import { pool } from '../config/pool';
import { HttpError } from '../middleware/errorHandler';
import { mapRow } from './hotelService';
import type { HotelCardData, HotelRow } from './hotelService';

// Which hotels this guest has saved, newest first, as cards ready to show
export async function listFavourites(userId: number): Promise<HotelCardData[]> {
  const result = await pool.query<HotelRow>(
    `SELECT h.id, h.name, h.city, h.province, h.star_rating, h.rating_avg, h.review_count, h.setting,
            (SELECT MIN(base_price_cents) FROM room_types WHERE hotel_id = h.id) AS from_price_cents,
            (SELECT COALESCE(json_agg(json_build_object('url', i.url, 'alt', i.alt_text) ORDER BY i.position), '[]'::json)
               FROM (SELECT url, alt_text, position FROM hotel_images WHERE hotel_id = h.id ORDER BY position LIMIT 3) i) AS images
     FROM favourites f
     JOIN hotels h ON h.id = f.hotel_id
     WHERE f.user_id = $1 AND h.status = 'published'
     ORDER BY f.created_at DESC`,
    [userId],
  );
  return result.rows.map(mapRow);
}

export async function listFavouriteIds(userId: number): Promise<number[]> {
  const result = await pool.query<{ hotel_id: string }>('SELECT hotel_id FROM favourites WHERE user_id = $1', [userId]);
  return result.rows.map((row) => Number(row.hotel_id));
}

// Saving twice, or removing something that is not saved, is harmless
export async function addFavourite(userId: number, hotelId: number): Promise<void> {
  const hotel = await pool.query(`SELECT 1 FROM hotels WHERE id = $1 AND status = 'published'`, [hotelId]);
  if (hotel.rows.length === 0) {
    throw new HttpError(404, 'HOTEL_NOT_FOUND', 'That hotel could not be found.');
  }
  await pool.query('INSERT INTO favourites (user_id, hotel_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, hotelId]);
}

export async function removeFavourite(userId: number, hotelId: number): Promise<void> {
  await pool.query('DELETE FROM favourites WHERE user_id = $1 AND hotel_id = $2', [userId, hotelId]);
}