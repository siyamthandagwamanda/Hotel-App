import { pool } from '../config/pool';
import { HttpError } from '../middleware/errorHandler';

export interface ReviewEligibility {
  canReview: boolean;
  reason: 'ok' | 'no_stay' | 'already_reviewed';
}

// Guest ratings are 1 to 5, but the hotel's average is shown out of 10, so each rating counts double
const HOTEL_SCALE = 2;

// A guest can review a hotel once, and only if they hold a confirmed (or completed) booking there
export async function getEligibility(userId: number, hotelId: number): Promise<ReviewEligibility> {
  const already = await pool.query('SELECT 1 FROM reviews WHERE user_id = $1 AND hotel_id = $2', [userId, hotelId]);
  if (already.rows.length > 0) {
    return { canReview: false, reason: 'already_reviewed' };
  }

  const stay = await pool.query(
    `SELECT 1 FROM bookings
     WHERE user_id = $1 AND hotel_id = $2 AND status IN ('confirmed', 'completed')
     LIMIT 1`,
    [userId, hotelId],
  );
  if (stay.rows.length === 0) {
    return { canReview: false, reason: 'no_stay' };
  }
  return { canReview: true, reason: 'ok' };
}

export async function addReview(userId: number, hotelId: number, rating: number, comment: string | null): Promise<void> {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new HttpError(400, 'INVALID_REVIEW', 'Choose a rating from 1 to 5.');
  }
  if (comment !== null && comment.length > 1000) {
    throw new HttpError(400, 'INVALID_REVIEW', 'Keep your review under 1000 characters.');
  }

  const eligibility = await getEligibility(userId, hotelId);
  if (!eligibility.canReview) {
    const message = eligibility.reason === 'already_reviewed'
      ? 'You have already reviewed this hotel.'
      : 'You can review a hotel once you have a confirmed booking there.';
    throw new HttpError(403, 'CANNOT_REVIEW', message);
  }

  await pool.query('INSERT INTO reviews (user_id, hotel_id, rating, comment) VALUES ($1, $2, $3, $4)', [userId, hotelId, rating, comment]);

  // Fold the new rating into the hotel's average and count
  await pool.query(
    `UPDATE hotels
     SET rating_avg = ROUND((rating_avg * review_count + $2) / (review_count + 1), 1),
         review_count = review_count + 1
     WHERE id = $1`,
    [hotelId, rating * HOTEL_SCALE],
  );
}