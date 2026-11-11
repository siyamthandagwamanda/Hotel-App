import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/storeHooks';
import { changeReservation, loadReservations, moveReservation } from '../../slices/adminSlice';
import type { AdminBooking } from '../../slices/adminSlice';
import { describeStatus } from '../../utils/bookingUtils';
import { formatRand, formatShortDate } from '../../utils/formatUtils';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'paid_pending_approval', label: 'Needs approval' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'held', label: 'Awaiting payment' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rejected', label: 'Rejected' },
];

const LIVE = ['held', 'paid_pending_approval', 'confirmed'];

export function ReservationsPanel() {
  const dispatch = useAppDispatch();
  const { reservations, status } = useAppSelector((state) => state.admin);
  const busy = status === 'loading';

  const [filter, setFilter] = useState('paid_pending_approval');
  const [movingRef, setMovingRef] = useState<string | null>(null);
  const [newCheckIn, setNewCheckIn] = useState('');
  const [newCheckOut, setNewCheckOut] = useState('');

  useEffect(() => {
    dispatch(loadReservations(filter));
  }, [dispatch, filter]);

  function startMoving(reservation: AdminBooking) {
    setMovingRef(reservation.reference);
    setNewCheckIn(reservation.checkIn);
    setNewCheckOut(reservation.checkOut);
  }

  async function saveMove(reference: string) {
    const result = await dispatch(moveReservation({ reference: reference, checkIn: newCheckIn, checkOut: newCheckOut }));
    if (moveReservation.fulfilled.match(result)) {
      setMovingRef(null);
    }
  }

  return (
    <section>
      <div className="admin-filters" role="group" aria-label="Filter reservations">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={filter === option.value ? 'admin-filter admin-filter-on' : 'admin-filter'}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {reservations.length === 0 && status !== 'loading' && <p className="admin-empty">No reservations here.</p>}

      <ul className="admin-list">
        {reservations.map((reservation) => (
          <li key={reservation.reference} className="admin-item">
            <div className="admin-item-top">
              <strong>{reservation.reference}</strong>
              <span className={'booking-status booking-status-' + reservation.status}>{describeStatus(reservation.status)}</span>
            </div>

            <p className="admin-item-title">{reservation.hotelName}</p>
            <p className="booking-muted">
              {reservation.guestName} · {reservation.guestEmail}
            </p>
            <p className="booking-muted">
              {formatShortDate(reservation.checkIn)} to {formatShortDate(reservation.checkOut)} ·{' '}
              {reservation.rooms.map((room) => room.quantity + ' × ' + room.roomName).join(', ')} ·{' '}
              {reservation.adults + reservation.children} guests
            </p>
            <p className="admin-item-total">{formatRand(reservation.totalCents)}</p>

            {movingRef === reservation.reference ? (
              <div className="admin-row">
                <label className="admin-field">
                  New check-in
                  <input type="date" value={newCheckIn} onChange={(event) => setNewCheckIn(event.target.value)} />
                </label>
                <label className="admin-field">
                  New check-out
                  <input type="date" value={newCheckOut} onChange={(event) => setNewCheckOut(event.target.value)} />
                </label>
                <button type="button" className="admin-button" disabled={busy} onClick={() => saveMove(reservation.reference)}>
                  Save dates
                </button>
                <button type="button" className="admin-link" onClick={() => setMovingRef(null)}>
                  Never mind
                </button>
              </div>
            ) : (
              <div className="admin-row">
                {reservation.status === 'paid_pending_approval' && (
                  <>
                    <button
                      type="button"
                      className="admin-button"
                      disabled={busy}
                      onClick={() => dispatch(changeReservation({ reference: reservation.reference, action: 'approve' }))}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="admin-button admin-button-quiet"
                      disabled={busy}
                      onClick={() => dispatch(changeReservation({ reference: reservation.reference, action: 'reject' }))}
                    >
                      Reject
                    </button>
                  </>
                )}
                {LIVE.includes(reservation.status) && (
                  <>
                    <button type="button" className="admin-button admin-button-quiet" disabled={busy} onClick={() => startMoving(reservation)}>
                      Change dates
                    </button>
                    <button
                      type="button"
                      className="admin-button admin-button-danger"
                      disabled={busy}
                      onClick={() => dispatch(changeReservation({ reference: reservation.reference, action: 'cancel' }))}
                    >
                      Cancel booking
                    </button>
                  </>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ReservationsPanel;