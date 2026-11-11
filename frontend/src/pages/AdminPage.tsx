import { useEffect, useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import ReservationsPanel from '../components/admin/ReservationsPanel';
import HotelsPanel from '../components/admin/HotelsPanel';
import { useAppDispatch, useAppSelector } from '../hooks/storeHooks';
import { clearAdminMessages } from '../slices/adminSlice';
import '../styles/BookingPage.css';
import '../styles/AdminPage.css';

type Tab = 'reservations' | 'hotels';

export function AdminPage() {
  const dispatch = useAppDispatch();
  const { error, message } = useAppSelector((state) => state.admin);
  const [tab, setTab] = useState<Tab>('reservations');

  // Start each visit with a clean slate
  useEffect(() => {
    dispatch(clearAdminMessages());
  }, [dispatch, tab]);

  return (
    <div className="booking-page">
      <PageHeader />
      <main className="admin-main">
        <h1 className="booking-title">Admin panel</h1>

        <div className="admin-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'reservations'} className={tab === 'reservations' ? 'admin-tab admin-tab-on' : 'admin-tab'} onClick={() => setTab('reservations')}>
            Reservations
          </button>
          <button type="button" role="tab" aria-selected={tab === 'hotels'} className={tab === 'hotels' ? 'admin-tab admin-tab-on' : 'admin-tab'} onClick={() => setTab('hotels')}>
            Hotels and rooms
          </button>
        </div>

        {message !== null && <p className="booking-note" role="status">{message}</p>}
        {error !== null && <p className="booking-error" role="alert">{error}</p>}

        {tab === 'reservations' ? <ReservationsPanel /> : <HotelsPanel />}
      </main>
    </div>
  );
}

export default AdminPage;