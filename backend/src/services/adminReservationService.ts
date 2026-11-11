import { pool } from '../config/pool';
import { HttpError } from '../middleware/errorHandler';
import {
  BOOKING_COLUMNS, BOOKING_FROM, countNights, inTransaction, returnRooms, takeRooms,
} from './bookingServices';
import type { Booking } from './bookingServices';

export interface AdminBooking extends Booking {
  guestName: string;
  guestEmail: string;
}

const ACTIVE = ['held', 'paid_pending_approval', 'confirmed'];

const ADMIN_SELECT = `
  SELECT ${BOOKING_COLUMNS}, u.name AS "guestName", u.email AS "guestEmail"
  ${BOOKING_FROM}
  JOIN users u ON u.id = b.user_id`;

export async function getReservation(reference: string): Promise<AdminBooking> {
  const result = await pool.query<AdminBooking>(`${ADMIN_SELECT} WHERE b.reference = $1`, [reference]);
  if (result.rows.length === 0) {
    throw new HttpError(404, 'BOOKING_NOT_FOUND', 'That booking could not be found.');
  }
  return result.rows[0];
}

// All reservations, newest first. Pass a status to see just one kind.
export async function listReservations(status: string | null): Promise<AdminBooking[]> {
  const result = await pool.query<AdminBooking>(
    `${ADMIN_SELECT}
     WHERE ($1::text IS NULL OR b.status::text = $1)
     ORDER BY b.created_at DESC
     LIMIT 200`,
    [status],
  );
  return result.rows;
}

// Moves a booking to a new status, but only if it is currently in one of the allowed statuses
async function changeStatus(reference: string, allowedFrom: string[], to: string, giveRoomsBack: boolean): Promise<AdminBooking> {
  await inTransaction(async (client) => {
    const found = await client.query<{ id: number; status: string }>(
      `SELECT id::int AS id, status FROM bookings WHERE reference = $1 FOR UPDATE`,
      [reference],
    );
    if (found.rows.length === 0) {
      throw new HttpError(404, 'BOOKING_NOT_FOUND', 'That booking could not be found.');
    }

    const booking = found.rows[0];
    if (!allowedFrom.includes(booking.status)) {
      throw new HttpError(409, 'WRONG_STATUS', `A booking that is ${booking.status.replace(/_/g, ' ')} cannot be changed this way.`);
    }

    if (giveRoomsBack) {
      await returnRooms(client, booking.id);
    }
    await client.query(`UPDATE bookings SET status = $2, hold_expires_at = NULL WHERE id = $1`, [booking.id, to]);
  });

  return getReservation(reference);
}

export function approveReservation(reference: string): Promise<AdminBooking> {
  return changeStatus(reference, ['paid_pending_approval'], 'confirmed', false);
}

export function rejectReservation(reference: string): Promise<AdminBooking> {
  return changeStatus(reference, ['paid_pending_approval'], 'rejected', true);
}

export function cancelReservation(reference: string): Promise<AdminBooking> {
  return changeStatus(reference, ACTIVE, 'cancelled', true);
}

// Moves a booking to new dates, keeping the same rooms. The price is worked out again for the new nights.
export async function changeReservationDates(reference: string, checkIn: string, checkOut: string): Promise<AdminBooking> {
  await inTransaction(async (client) => {
    const found = await client.query(
      `SELECT b.id::int AS id, b.status, b.total_amount_cents, b.discount_cents,
              bi.room_type_id::int AS room_type_id, bi.quantity, rt.base_price_cents
       FROM bookings b
       JOIN booking_items bi ON bi.booking_id = b.id
       JOIN room_types rt ON rt.id = bi.room_type_id
       WHERE b.reference = $1
       FOR UPDATE OF b`,
      [reference],
    );
    if (found.rows.length === 0) {
      throw new HttpError(404, 'BOOKING_NOT_FOUND', 'That booking could not be found.');
    }

    const booking = found.rows[0];
    if (!ACTIVE.includes(booking.status)) {
      throw new HttpError(409, 'WRONG_STATUS', 'Only a live booking can be moved to new dates.');
    }
    if (countNights(checkIn, checkOut) < 1) {
      throw new HttpError(400, 'INVALID_BOOKING', 'Check-out must be after check-in.');
    }

    // Give the old nights back, then take the new ones. If the new nights are full, everything rolls back.
    await returnRooms(client, booking.id);
    const perRoomTotal = await takeRooms(client, booking.room_type_id, checkIn, checkOut, booking.quantity, booking.base_price_cents);

    // Keep the same share of discount the guest had before
    const oldFullPrice = booking.total_amount_cents + booking.discount_cents;
    const newFullPrice = perRoomTotal * booking.quantity;
    const newDiscount = booking.discount_cents === 0 ? 0 : Math.round((newFullPrice * booking.discount_cents) / oldFullPrice);

    await client.query(
      `UPDATE bookings
       SET check_in = $2, check_out = $3, total_amount_cents = $4, discount_cents = $5
       WHERE id = $1`,
      [booking.id, checkIn, checkOut, newFullPrice - newDiscount, newDiscount],
    );
  });

  return getReservation(reference);
}