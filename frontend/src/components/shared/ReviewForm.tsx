import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/storeHooks';
import { clearReviewForm, loadReviewStatus, submitReview } from '../../slices/reviewSlice';
import '../../styles/ReviewForm.css';

interface ReviewFormProps {
  hotelId: number;
}

// Lets a guest with a confirmed booking leave one review for the hotel
export function ReviewForm({ hotelId }: ReviewFormProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { canReview, reason, saving, error } = useAppSelector((state) => state.reviewForm);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (user !== null) {
      dispatch(loadReviewStatus(hotelId));
    }
    return () => {
      dispatch(clearReviewForm());
    };
  }, [dispatch, hotelId, user]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    dispatch(submitReview({ hotelId: hotelId, rating: rating, comment: comment }));
  }

  if (user === null) {
    return (
      <p className="detail-muted">
        <Link to="/signin" state={{ from: '/hotels/' + hotelId }}>Sign in</Link> to review a hotel you have booked.
      </p>
    );
  }
  if (reason === 'already_reviewed') {
    return <p className="detail-muted">Thank you, you have reviewed this hotel.</p>;
  }
  if (!canReview) {
    return null;
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <p className="review-title">How was your stay?</p>
      <div className="review-stars" role="radiogroup" aria-label="Your rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={value + (value === 1 ? ' star' : ' stars')}
            className={value <= rating ? 'review-star review-star-on' : 'review-star'}
            onClick={() => setRating(value)}
          >
            &#9733;
          </button>
        ))}
      </div>
      <textarea
        className="review-text"
        rows={3}
        maxLength={1000}
        placeholder="Tell other guests about your stay (optional)"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />
      {error !== null && <p className="review-error" role="alert">{error}</p>}
      <button type="submit" className="review-submit" disabled={rating === 0 || saving}>
        {saving ? 'Saving...' : 'Post review'}
      </button>
    </form>
  );
}

export default ReviewForm;