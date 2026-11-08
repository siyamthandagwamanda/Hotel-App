import { randomBytes } from 'node:crypto';
import { pool } from '../config/pool';
import { env } from '../config/env';
import { HttpError } from '../middleware/errorHandler';
import { getBooking, releaseExpiredHolds } from './bookingService';
import type { Booking } from './bookingService';

const PAYSTACK_URL = 'https://api.paystack.co';
const PAYMENT_WINDOW_MINUTES = 30;

interface PaystackReply {
  status: boolean;
  message: string;
  data: { authorization_url?: string; status?: string; amount?: number; currency?: string };
}


async function callPaystack(path: string, body?: object): Promise<PaystackReply['data']> {
  if (env.paystackSecretKey === '') {
    throw new HttpError(503, 'PAYMENTS_UNAVAILABLE', 'Payments are not available right now.');
  }

  try {
    const response = await fetch(`${PAYSTACK_URL}${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        Authorization: `Bearer ${env.paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const reply = (await response.json()) as PaystackReply;
    if (!response.ok || !reply.status) {
      console.log('Paystack error:', reply.message);
      throw new Error(reply.message);
    }
    return reply.data;
  } catch (error) {
    console.log('Could not use Paystack:', error);
    throw new HttpError(502, 'PAYMENT_PROVIDER_ERROR', 'The payment service did not respond. Please try again.');
  }
}

//ask Paystack for a checkout page. The visitor pays there, so no card details touch our app.
export async function startPayment(userId: number, reference: string): Promise<string> {
  await releaseExpiredHolds();
  const booking = await getBooking(userId, reference);
  if (booking.status !== 'held') {
    throw new HttpError(409, 'NOT_PAYABLE', 'This booking is not waiting for payment.');
  }

  const user = await pool.query<{ email: string }>('SELECT email FROM users WHERE id = $1', [userId]);

  // Paystack refuses a reference it has seen before, so each attempt gets its own
  const paymentReference = `${reference}-${randomBytes(3).toString('hex')}`;

  const data = await callPaystack('/transaction/initialize', {
    email: user.rows[0].email,
    amount: booking.totalCents,
    currency: booking.currency,
    reference: paymentReference,
    callback_url: `${env.clientOrigin}/bookings/${reference}`,
  });

  await pool.query(
    `INSERT INTO payments (booking_id, provider, provider_ref, amounts_cents)
     SELECT id, 'paystack', $2, total_amount_cents FROM bookings WHERE reference = $1`,
    [reference, paymentReference],
  );
  // Keep the rooms held while the visitor is on the payment page
  await pool.query(
    `UPDATE bookings SET hold_expires_at = now() + make_interval(mins => $2) WHERE reference = $1`,
    [reference, PAYMENT_WINDOW_MINUTES],
  );

  return data.authorization_url as string;
}

// when the visitor comes back, ask Paystack whether the payment went through
export async function verifyPayment(userId: number, reference: string): Promise<Booking> {
  const booking = await getBooking(userId, reference);
  if (booking.status !== 'held') {
    return booking;
  }

  const attempts = await pool.query<{ id: number; providerRef: string }>(
    `SELECT p.id::int AS id, p.provider_ref AS "providerRef"
     FROM payments p JOIN bookings b ON b.id = p.booking_id
     WHERE b.reference = $1 AND p.status = 'pending'
     ORDER BY p.id DESC`,
    [reference],
  );

  for (const attempt of attempts.rows) {
    const data = await callPaystack(`/transaction/verify/${attempt.providerRef}`);

    if (data.status === 'success' && data.amount === booking.totalCents && data.currency === booking.currency) {
      await pool.query(`UPDATE payments SET status = 'paid', paid_at = now() WHERE id = $1`, [attempt.id]);
// Paid bookings wait for the hotel team to approve them
      await pool.query(
        `UPDATE bookings SET status = 'paid_pending_approval', hold_expires_at = NULL
         WHERE reference = $1 AND status = 'held'`,
        [reference],
      );
      break;
    }
    if (data.status === 'failed' || data.status === 'abandoned') {
      await pool.query(`UPDATE payments SET status = 'failed' WHERE id = $1`, [attempt.id]);
    }
  }

  return getBooking(userId, reference);
}