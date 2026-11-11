import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/shared/PageHeader';
import { useAppDispatch, useAppSelector } from '../hooks/storeHooks';
import { updateProfile } from '../slices/authSlice';
import { loadFavouriteHotels, saveFavourite } from '../slices/favouriteSlice';
import { formatRand } from '../utils/formatUtils';
import '../styles/BookingPage.css';
import '../styles/ProfilePage.css';

export function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const savedHotels = useAppSelector((state) => state.favourites.hotels);

  const [name, setName] = useState(user === null ? '' : user.name);
  const [phone, setPhone] = useState(user === null || user.phone === null ? '' : user.phone);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [problem, setProblem] = useState('');

  useEffect(() => {
    dispatch(loadFavouriteHotels());
  }, [dispatch]);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setNotice('');
    setProblem('');

    const result = await dispatch(updateProfile({ name: name.trim(), phone: phone.trim() }));
    if (updateProfile.fulfilled.match(result)) {
      setNotice('Your details are saved.');
    } else {
      setProblem(result.error.message ?? 'We could not save your details.');
    }
    setSaving(false);
  }

  if (user === null) {
    return null;
  }

  return (
    <div className="booking-page">
      <PageHeader />
      <main className="booking-main">
        <h1 className="booking-title">Your profile</h1>

        <section className="profile-card">
          <h2 className="profile-heading">Your details</h2>
          <form className="profile-form" onSubmit={handleSave}>
            <label className="profile-field">
              Name
              <input required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="profile-field">
              Email
              <input value={user.email} disabled />
            </label>
            <label className="profile-field">
              Phone (optional)
              <input type="tel" maxLength={20} value={phone} onChange={(event) => setPhone(event.target.value)} />
            </label>
            {notice !== '' && <p className="booking-note" role="status">{notice}</p>}
            {problem !== '' && <p className="booking-error" role="alert">{problem}</p>}
            <button type="submit" className="booking-button" disabled={saving}>
              {saving ? 'Saving...' : 'Save details'}
            </button>
          </form>
        </section>

        <section className="profile-card">
          <h2 className="profile-heading">Your bookings</h2>
          <p className="booking-muted">See, pay for and cancel your trips.</p>
          <Link to="/trips" className="booking-link">Go to my trips</Link>
        </section>

        <section className="profile-card">
          <h2 className="profile-heading">Saved stays</h2>
          {savedHotels.length === 0 && (
            <p className="booking-muted">Tap the heart on a hotel to save it here.</p>
          )}
          <ul className="saved-list">
            {savedHotels.map((hotel) => (
              <li key={hotel.id} className="saved-item">
                <Link to={'/hotels/' + hotel.id} className="saved-link">
                  {hotel.images.length > 0 && <img className="saved-image" src={hotel.images[0].url} alt="" />}
                  <div>
                    <p className="saved-name">{hotel.name}</p>
                    <p className="booking-muted">{hotel.city}, {hotel.province}</p>
                    <p className="saved-price">From {formatRand(hotel.fromPriceCents)} / night</p>
                  </div>
                </Link>
                <button
                  type="button"
                  className="booking-link"
                  onClick={() => dispatch(saveFavourite({ hotelId: hotel.id, save: false }))}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default ProfilePage;