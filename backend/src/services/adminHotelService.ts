import { pool } from '../config/pool';
import { HttpError } from '../middleware/errorHandler';
import { readChoice, readDecimal, readText, readWhole } from './inputReaders';

const SETTINGS = ['beach', 'city', 'safari', 'mountain', 'countryside'];
const STATUSES = ['draft', 'published', 'retired'];
const DAYS_ON_SALE = 365;

export interface AdminHotel {
  id: number;
  name: string;
  city: string;
  province: string;
  address: string;
  description: string;
  starRating: number;
  setting: string;
  status: string;
  roomTypes: number;
}

export interface AdminRoom {
  id: number;
  hotelId: number;
  name: string;
  description: string | null;
  adults: number;
  children: number;
  bedType: string | null;
  basePriceCents: number;
  totalUnits: number;
}

const HOTEL_SELECT = `
  SELECT h.id::int AS id, h.name, h.city, h.province, h.address, h.description,
         h.star_rating::float AS "starRating", h.setting, h.status,
         (SELECT COUNT(*) FROM room_types rt WHERE rt.hotel_id = h.id)::int AS "roomTypes"
  FROM hotels h`;

const ROOM_SELECT = `
  SELECT id::int AS id, hotel_id::int AS "hotelId", name, description, adults, children,
         bed_type AS "bedType", base_price_cents AS "basePriceCents", total_units AS "totalUnits"
  FROM room_types`;

// ---------- Hotels ----------

export async function listHotels(): Promise<AdminHotel[]> {
  const result = await pool.query<AdminHotel>(`${HOTEL_SELECT} ORDER BY h.id`);
  return result.rows;
}

async function getHotel(hotelId: number): Promise<AdminHotel> {
  const result = await pool.query<AdminHotel>(`${HOTEL_SELECT} WHERE h.id = $1`, [hotelId]);
  if (result.rows.length === 0) {
    throw new HttpError(404, 'HOTEL_NOT_FOUND', 'That hotel could not be found.');
  }
  return result.rows[0];
}

// New hotels start as drafts, so nothing shows to guests until an admin publishes it
export async function createHotel(body: Record<string, unknown>, adminId: number): Promise<AdminHotel> {
  const result = await pool.query<{ id: number }>(
    `INSERT INTO hotels (name, description, city, province, address, latitude, longitude, star_rating, setting, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id::int AS id`,
    [
      readText(body.name, 'Name', 120),
      readText(body.description, 'Description', 2000),
      readText(body.city, 'City', 80),
      readText(body.province, 'Province', 80),
      readText(body.address, 'Address', 200),
      readDecimal(body.latitude, 'Latitude', -90, 90),
      readDecimal(body.longitude, 'Longitude', -180, 180),
      readDecimal(body.starRating, 'Star rating', 1, 5),
      readChoice(body.setting, 'Setting', SETTINGS),
      adminId,
    ],
  );
  return getHotel(result.rows[0].id);
}

// Changes only the fields that were sent
export async function updateHotel(hotelId: number, body: Record<string, unknown>): Promise<AdminHotel> {
  await getHotel(hotelId);

  const name = body.name === undefined ? null : readText(body.name, 'Name', 120);
  const description = body.description === undefined ? null : readText(body.description, 'Description', 2000);
  const status = body.status === undefined ? null : readChoice(body.status, 'Status', STATUSES);
  const setting = body.setting === undefined ? null : readChoice(body.setting, 'Setting', SETTINGS);
  const starRating = body.starRating === undefined ? null : readDecimal(body.starRating, 'Star rating', 1, 5);

  await pool.query(
    `UPDATE hotels
     SET name = COALESCE($2, name),
         description = COALESCE($3, description),
         status = COALESCE($4::hotel_status, status),
         setting = COALESCE($5::hotel_setting, setting),
         star_rating = COALESCE($6, star_rating)
     WHERE id = $1`,
    [hotelId, name, description, status, setting, starRating],
  );
  return getHotel(hotelId);
}

// ---------- Rooms and availability ----------

export async function listRooms(hotelId: number): Promise<AdminRoom[]> {
  await getHotel(hotelId);
  const result = await pool.query<AdminRoom>(`${ROOM_SELECT} WHERE hotel_id = $1 ORDER BY base_price_cents, id`, [hotelId]);
  return result.rows;
}

async function getRoom(roomId: number): Promise<AdminRoom> {
  const result = await pool.query<AdminRoom>(`${ROOM_SELECT} WHERE id = $1`, [roomId]);
  if (result.rows.length === 0) {
    throw new HttpError(404, 'ROOM_NOT_FOUND', 'That room could not be found.');
  }
  return result.rows[0];
}

// A new room type goes on sale for the next year, all units free
export async function createRoom(hotelId: number, body: Record<string, unknown>): Promise<AdminRoom> {
  await getHotel(hotelId);

  const totalUnits = readWhole(body.totalUnits, 'Units', 1, 500);
  const bedType = typeof body.bedType === 'string' && body.bedType.trim() !== '' ? body.bedType.trim().slice(0, 40) : null;
  const description = typeof body.description === 'string' && body.description.trim() !== '' ? body.description.trim().slice(0, 500) : null;

  const created = await pool.query<{ id: number }>(
    `INSERT INTO room_types (hotel_id, name, description, adults, children, bed_type, base_price_cents, total_units)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id::int AS id`,
    [
      hotelId,
      readText(body.name, 'Name', 80),
      description,
      readWhole(body.adults, 'Adults', 1, 20),
      readWhole(body.children, 'Children', 0, 20),
      bedType,
      readWhole(body.basePriceCents, 'Price', 100, 100000000),
      totalUnits,
    ],
  );

  await pool.query(
    `INSERT INTO rooms_inventory (room_type_id, stay_date, units_available)
     SELECT $1, d::date, $2
     FROM generate_series(CURRENT_DATE, CURRENT_DATE + $3::int, interval '1 day') AS d
     ON CONFLICT DO NOTHING`,
    [created.rows[0].id, totalUnits, DAYS_ON_SALE - 1],
  );
  return getRoom(created.rows[0].id);
}

export async function updateRoom(roomId: number, body: Record<string, unknown>): Promise<AdminRoom> {
  await getRoom(roomId);

  const name = body.name === undefined ? null : readText(body.name, 'Name', 80);
  const basePrice = body.basePriceCents === undefined ? null : readWhole(body.basePriceCents, 'Price', 100, 100000000);

  await pool.query(
    `UPDATE room_types SET name = COALESCE($2, name), base_price_cents = COALESCE($3, base_price_cents) WHERE id = $1`,
    [roomId, name, basePrice],
  );
  return getRoom(roomId);
}

// Sets how many rooms are free, and/or a special price, for every night from `from` up to (not including) `to`.
// Send units: 0 to close those nights. Send priceCents: null to go back to the normal price.
export async function setAvailability(roomId: number, body: Record<string, unknown>): Promise<{ nights: number }> {
  const room = await getRoom(roomId);

  const from = readDateText(body.from, 'From');
  const to = readDateText(body.to, 'To');
  if (to <= from) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'The "to" date must be after the "from" date.');
  }

  const changeUnits = body.units !== undefined;
  const changePrice = body.priceCents !== undefined;
  if (!changeUnits && !changePrice) {
    throw new HttpError(400, 'VALIDATION_ERROR', 'Send the number of rooms, a price, or both.');
  }

  const units = changeUnits ? readWhole(body.units, 'Units', 0, room.totalUnits) : null;
  const price = changePrice && body.priceCents !== null ? readWhole(body.priceCents, 'Price', 100, 100000000) : null;

  // Make sure every night in the range exists, then change them
  await pool.query(
    `INSERT INTO rooms_inventory (room_type_id, stay_date, units_available)
     SELECT $1, d::date, $2
     FROM generate_series($3::date, $4::date - 1, interval '1 day') AS d
     ON CONFLICT DO NOTHING`,
    [roomId, room.totalUnits, from, to],
  );

  const updated = await pool.query(
    `UPDATE rooms_inventory
     SET units_available = CASE WHEN $4::boolean THEN $5::int ELSE units_available END,
         price_override_cents = CASE WHEN $6::boolean THEN $7::int ELSE price_override_cents END
     WHERE room_type_id = $1 AND stay_date >= $2::date AND stay_date < $3::date`,
    [roomId, from, to, changeUnits, units, changePrice, price],
  );
  return { nights: updated.rowCount ?? 0 };
}

function readDateText(value: unknown, name: string): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
    throw new HttpError(400, 'VALIDATION_ERROR', `${name} must be a date like 2026-12-24.`);
  }
  return value;
}