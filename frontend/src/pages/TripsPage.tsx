import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/shared/PageHeader';
import { useAppDispatch, useAppSelector } from '../hooks/storeHooks';
import { loadLoyalty, loadTrips } from '../slices/bookingSlice';
import { formatRand, formatShortDate } from '../utils/formatUtils';
import { describeStatus } from '../utils/bookingUtils';
import '../styles/BookingPage.css';

export function TripsPage() {
  const dispatch = useAppDispatch();
  const { trips, loyalty, status, error } = useAppSelector((state) => state.booking);

  useEffect(() => {
    dispatch(loadTrips());
    dispatch(loadLoyalty());
  }, [dispatch]);

  return (
    <div className="booking-page">
      <PageHeader />
      <main className="booking-main">
        <h1 className="booking-title">My trips</h1>

        {loyalty !== null && (
          <section className="loyalty">
            {loyalty.unlocked ? (
              <p><strong>{loyalty.percent}% loyalty discount unlocked.</strong> It is taken off every new booking.</p>
            ) : (
              <>
                <p>
                  <strong>{loyalty.tripsNeeded - loyalty.trips} more paid {loyalty.tripsNeeded - loyalty.trips === 1 ? 'trip' : 'trips'}</strong>{' '}
                  to unlock {loyalty.percent}% off every booking.
                </p>
                <progress className="loyalty-bar" max={loyalty.tripsNeeded} value={loyalty.trips} />
              </>
            )}
          </section>
        )}

        {status === 'loading' && trips.length === 0 && <p className="booking-muted">Loading your trips...</p>}
        {status === 'error' && <p className="booking-error" role="alert">{error}</p>}

        {status !== 'loading' && status !== 'error' && trips.length === 0 && (
          <div className="booking-message">
            <p>You have no trips yet.</p>
            <Link to="/" className="booking-button">Find a stay</Link>
          </div>
        )}

        <ul className="trips">
          {trips.map((trip) => (
            <li key={trip.reference}>
              <Link to={'/bookings/' + trip.reference} className="trip">
                {trip.hotelImage !== null && <img className="trip-image" src={trip.hotelImage} alt="" />}
                <div className="trip-info">
                  <h2 className="trip-name">{trip.hotelName}</h2>
                  <p className="booking-muted">
                    {trip.hotelCity} · {formatShortDate(trip.checkIn)} to {formatShortDate(trip.checkOut)}
                  </p>
                  <p className={'booking-status booking-status-' + trip.status}>{describeStatus(trip.status)}</p>
                </div>
                <p className="trip-total">{formatRand(trip.totalCents)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default TripsPage;