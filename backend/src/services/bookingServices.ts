import { randomBytes } from 'node:crypto';
import type { PoolClient } from 'pg';
import { pool } from '../config/pool';
import { HttpError } from '../middleware/errorHandler';

const HOLD_MINUTES = 15;
const MAX_NIGHTS = 30;
const MAX_ROOMS = 5;

export interface BookingInput {
  roomTypeId: number;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
}

export interface Booking {
  reference: string;
  status: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  totalCents: number;
  currency: string;
  holdExpiresAt: string | null;
  hotelId: number;
  hotelName: string;
  hotelCity: string;
  hotelImage: string | null;
  rooms: { roomName: string; quantity: number }[];
}

//Reading and checking what the visitor sent

function readWholeNumber(value: unknown, name: string, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    throw new HttpError(400, 'INVALID_BOOKING', `${name} must be a whole number from ${min} to ${max}.`);
  }
  return value;
}

function readDate(value: unknown, name: string): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
    throw new HttpError(400, 'INVALID_BOOKING', `${name} must be a date like 2026-12-24.`);
  }
  return value;
}

export function countNights(checkIn: string, checkOut: string): number {
  return Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86400000);
}

export function parseBookingInput(body: Record<string, unknown>): BookingInput {
  const checkIn = readDate(body.checkIn, 'Check-in');
  const checkOut = readDate(body.checkOut, 'Check-out');
  const today = new Date().toISOString().slice(0, 10);

  if (checkIn < today) {
    throw new HttpError(400, 'INVALID_BOOKING', 'Check-in cannot be in the past.');
  }
  const nights = countNights(checkIn, checkOut);
  if (nights < 1 || nights > MAX_NIGHTS) {
    throw new HttpError(400, 'INVALID_BOOKING', `Stay between 1 and ${MAX_NIGHTS} nights.`);
  }

  return {
    roomTypeId: readWholeNumber(body.roomTypeId, 'Room', 1, 2147483647),
    checkIn: checkIn,
    checkOut: checkOut,
    adults: readWholeNumber(body.adults, 'Adults', 1, 20),
    children: readWholeNumber(body.children, 'Children', 0, 20),
    rooms: readWholeNumber(body.rooms, 'Rooms', 1, MAX_ROOMS),
  };
}

//Database helpers

// Runs work as one all-or-nothing step: if anything throws, nothing is saved
async function inTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Gives the booked rooms back to the calendar for every night of the stay
async function returnRooms(client: PoolClient, bookingId: number): Promise<void> {
  await client.query(
    `UPDATE rooms_inventory ri
     SET units_available = ri.units_available + bi.quantity
     FROM booking_items bi, bookings b
     WHERE b.id = $1 AND bi.booking_id = b.id
       AND ri.room_type_id = bi.room_type_id
       AND ri.stay_date >= b.check_in AND ri.stay_date < b.check_out`,
    [bookingId],
  );
}

//Holds that were never paid go back on sale. Called before any booking or payment step.
export async function releaseExpiredHolds(): Promise<void> {
  await inTransaction(async (client) => {
    const expired = await client.query<{ id: number }>(
      `UPDATE bookings SET status = 'expired'
       WHERE status = 'held' AND hold_expires_at < now()
       RETURNING id::int AS id`,
    );
    for (const booking of expired.rows) {
      await returnRooms(client, booking.id);
    }
  });
}

const BOOKING_SELECT = `
  SELECT b.reference, b.status,
         to_char(b.check_in, 'YYYY-MM-DD') AS "checkIn",
         to_char(b.check_out, 'YYYY-MM-DD') AS "checkOut",
         b.adults, b.children,
         b.total_amount_cents AS "totalCents", b.currency,
         b.hold_expires_at AS "holdExpiresAt",
         h.id::int AS "hotelId", h.name AS "hotelName", h.city AS "hotelCity",
         (SELECT url FROM hotel_images WHERE hotel_id = h.id ORDER BY position LIMIT 1) AS "hotelImage",
         (SELECT json_agg(json_build_object('roomName', rt.name, 'quantity', bi.quantity))
            FROM booking_items bi JOIN room_types rt ON rt.id = bi.room_type_id
           WHERE bi.booking_id = b.id) AS rooms
  FROM bookings b
  JOIN hotels h ON h.id = b.hotel_id`;



export async function createBooking(userId: number, input: BookingInput): Promise<Booking> {
  await releaseExpiredHolds();
  const nights = countNights(input.checkIn, input.checkOut);

  const reference = await inTransaction(async (client) => {
    const roomResult = await client.query(
      `SELECT rt.id, rt.hotel_id, rt.adults, rt.children, rt.base_price_cents
       FROM room_types rt
       JOIN hotels h ON h.id = rt.hotel_id
       WHERE rt.id = $1 AND h.status = 'published'`,
      [input.roomTypeId],
    );
    if (roomResult.rows.length === 0) {
      throw new HttpError(404, 'ROOM_NOT_FOUND', 'That room could not be found.');
    }
    const room = roomResult.rows[0];

    if (input.adults > room.adults * input.rooms || input.children > room.children * input.rooms) {
      throw new HttpError(400, 'TOO_MANY_GUESTS', 'That many guests do not fit in the rooms chosen.');
    }

// FOR UPDATE makes a second visitor wait here until this booking is saved
    const nightRows = await client.query<{ units: number; price: number }>(
      `SELECT units_available AS units,
              COALESCE(price_override_cents, $4) AS price
       FROM rooms_inventory
       WHERE room_type_id = $1 AND stay_date >= $2::date AND stay_date < $3::date
       FOR UPDATE`,
      [input.roomTypeId, input.checkIn, input.checkOut, room.base_price_cents],
    );

    const allNightsOnSale = nightRows.rows.length === nights;
    const enoughRooms = nightRows.rows.every((night) => night.units >= input.rooms);
    if (!allNightsOnSale || !enoughRooms) {
      throw new HttpError(409, 'NOT_AVAILABLE', 'Those rooms are no longer available for these dates.');
    }

    await client.query(
      `UPDATE rooms_inventory SET units_available = units_available - $4
       WHERE room_type_id = $1 AND stay_date >= $2::date AND stay_date < $3::date`,
      [input.roomTypeId, input.checkIn, input.checkOut, input.rooms],
    );

    const perRoomTotal = nightRows.rows.reduce((sum, night) => sum + night.price, 0);
    const totalCents = perRoomTotal * input.rooms;
    const nightlyAverage = Math.round(perRoomTotal / nights);
    const newReference = 'SC-' + randomBytes(4).toString('hex').toUpperCase();

    const bookingResult = await client.query<{ id: number }>(
      `INSERT INTO bookings
         (reference, user_id, hotel_id, check_in, check_out, adults, children,
          total_amount_cents, hold_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now() + make_interval(mins => $9))
       RETURNING id::int AS id`,
      [newReference, userId, room.hotel_id, input.checkIn, input.checkOut,
       input.adults, input.children, totalCents, HOLD_MINUTES],
    );

    await client.query(
      `INSERT INTO booking_items (booking_id, room_type_id, quantity, nightly_price_snapshot_cents)
       VALUES ($1, $2, $3, $4)`,
      [bookingResult.rows[0].id, input.roomTypeId, input.rooms, nightlyAverage],
    );

    return newReference;
  });

  return getBooking(userId, reference);
}

export async function getBooking(userId: number, reference: string): Promise<Booking> {
  const result = await pool.query<Booking>(
    `${BOOKING_SELECT} WHERE b.reference = $1 AND b.user_id = $2`,
    [reference, userId],
  );
  if (result.rows.length === 0) {
    throw new HttpError(404, 'BOOKING_NOT_FOUND', 'That booking could not be found.');
  }
  return result.rows[0];
}

export async function listBookings(userId: number): Promise<Booking[]> {
  await releaseExpiredHolds();
  const result = await pool.query<Booking>(
    `${BOOKING_SELECT} WHERE b.user_id = $1 AND b.status <> 'expired' ORDER BY b.created_at DESC`,
    [userId],
  );
  return result.rows;
}

export async function cancelBooking(userId: number, reference: string): Promise<Booking> {
  await inTransaction(async (client) => {
    const found = await client.query<{ id: number; status: string; checkIn: string }>(
      `SELECT id::int AS id, status, to_char(check_in, 'YYYY-MM-DD') AS "checkIn"
       FROM bookings WHERE reference = $1 AND user_id = $2 FOR UPDATE`,
      [reference, userId],
    );
    if (found.rows.length === 0) {
      throw new HttpError(404, 'BOOKING_NOT_FOUND', 'That booking could not be found.');
    }

    const booking = found.rows[0];
    const today = new Date().toISOString().slice(0, 10);
    const canCancel = ['held', 'paid_pending_approval', 'confirmed'].includes(booking.status);
    if (!canCancel || booking.checkIn <= today) {
      throw new HttpError(409, 'CANNOT_CANCEL', 'This booking can no longer be cancelled online.');
    }

    await returnRooms(client, booking.id);
    await client.query(`UPDATE bookings SET status = 'cancelled' WHERE id = $1`, [booking.id]);
  });

  return getBooking(userId, reference);
}