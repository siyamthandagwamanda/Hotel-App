import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/shared/PageHeader';
import { useAppDispatch, useAppSelector } from '../hooks/storeHooks';
import { cancelBooking, clearCurrent, loadBooking, payForBooking, verifyBooking } from '../slices/bookingSlice';
import { formatRand, formatShortDate } from '../utils/formatUtils';
import { describeStatus, minutesLeft } from '../utils/bookingUtils';
import '../styles/BookingPage.css';

const CANCELLABLE = ['held', 'paid_pending_approval', 'confirmed'];

export function BookingPage() {
  const dispatch = useAppDispatch();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { current, status, error } = useAppSelector((state) => state.booking);

  const reference = params.reference ?? '';
  // Paystack sends the visitor back here with the payment reference in the address
  const cameBackFromPaystack = searchParams.has('trxref') || searchParams.has('reference');

  const [sureToCancel, setSureToCancel] = useState(false);

  useEffect(() => {
    if (cameBackFromPaystack) {
      dispatch(verifyBooking(reference));
    } else {
      dispatch(loadBooking(reference));
    }
    return () => {
      dispatch(clearCurrent());
    };
  }, [dispatch, reference, cameBackFromPaystack]);

  async function handlePay() {
    const result = await dispatch(payForBooking(reference));
    if (payForBooking.fulfilled.match(result)) {
      window.location.assign(result.payload);
    }
  }

  function handleCancel() {
    setSureToCancel(false);
    dispatch(cancelBooking(reference));
  }

  if (current === null) {
    return (
      <div className="booking-page">
        <PageHeader />
        <main className="booking-main">
          {status === 'error' ? (
            <div className="booking-message">
              <p>{error}</p>
              <Link to="/trips" className="booking-button">Go to my trips</Link>
            </div>
          ) : (
            <p className="booking-muted">Loading your booking...</p>
          )}
        </main>
      </div>
    );
  }

  const booking = current;
  const minutes = minutesLeft(booking.holdExpiresAt);
  const guests = booking.adults + booking.children;
  const busy = status === 'loading';

  return (
    <div className="booking-page">
      <PageHeader />
      <main className="booking-main">
        <p className="booking-reference">Booking {booking.reference}</p>
        <h1 className="booking-title">{booking.hotelName}</h1>
        <p className="booking-muted">{booking.hotelCity}</p>

        <p className={'booking-status booking-status-' + booking.status}>{describeStatus(booking.status)}</p>

        {cameBackFromPaystack && booking.status === 'held' && (
          <p className="booking-note" role="status">
            We have not received your payment yet. You can try again below.
          </p>
        )}
        {booking.status === 'paid_pending_approval' && (
          <p className="booking-note" role="status">
            Thank you, your payment is in. The hotel will approve your booking shortly.
          </p>
        )}
        {error !== null && <p className="booking-error" role="alert">{error}</p>}

        <section className="booking-card">
          {booking.hotelImage !== null && (
            <img className="booking-image" src={booking.hotelImage} alt={booking.hotelName} />
          )}
          <dl className="booking-facts">
            <div>
              <dt>Check-in</dt>
              <dd>{formatShortDate(booking.checkIn)}</dd>
            </div>
            <div>
              <dt>Check-out</dt>
              <dd>{formatShortDate(booking.checkOut)}</dd>
            </div>
            <div>
              <dt>Guests</dt>
              <dd>{guests}</dd>
            </div>
            {booking.rooms.map((room) => (
              <div key={room.roomName}>
                <dt>Room</dt>
                <dd>{room.quantity} × {room.roomName}</dd>
              </div>
            ))}
          </dl>

          <div className="booking-total">
            {booking.discountCents > 0 && (
              <p className="booking-muted">Loyalty discount −{formatRand(booking.discountCents)}</p>
            )}
            <p>
              <span className="booking-total-label">Total</span>
              <span className="booking-total-amount">{formatRand(booking.totalCents)}</span>
            </p>
          </div>
        </section>

        {booking.status === 'held' && (
          <div className="booking-actions">
            <p className="booking-muted">
              {minutes > 0
                ? `Your rooms are held for ${minutes} more ${minutes === 1 ? 'minute' : 'minutes'}.`
                : 'Your hold is about to run out.'}
            </p>
            <button type="button" className="booking-button" disabled={busy} onClick={handlePay}>
              {busy ? 'Please wait...' : 'Pay ' + formatRand(booking.totalCents) + ' with Paystack'}
            </button>
          </div>
        )}

        {CANCELLABLE.includes(booking.status) && !sureToCancel && (
          <button type="button" className="booking-link" onClick={() => setSureToCancel(true)}>
            Cancel this booking
          </button>
        )}
        {sureToCancel && (
          <div className="booking-sure">
            <p>Cancel this booking? The rooms go back on sale.</p>
            <button type="button" className="booking-button booking-button-danger" disabled={busy} onClick={handleCancel}>
              Yes, cancel it
            </button>
            <button type="button" className="booking-link" onClick={() => setSureToCancel(false)}>
              Keep my booking
            </button>
          </div>
        )}

        <Link to="/trips" className="booking-link">See all my trips</Link>
      </main>
    </div>
  );
}

export default BookingPage;