import { useState } from 'react';
import type { FormEvent, SyntheticEvent } from 'react';
import Logo from '../components/shared/Logo';
import { useAppDispatch, useAppSelector } from '../hooks/storeHooks';
import { setCity, setDates, setGuests } from '../slices/searchSlice';
import '../styles/LandingPage.css';

interface LandingPageProps {
  onEnter: () => void;
}

const heroImage =
  'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1200&q=80';
const accentImage =
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=600&q=80';

const quickCities = ['Durban', 'Cape Town', 'Johannesburg', 'Stellenbosch'];

const trustPoints = ['All-in prices', '15-minute room hold', 'Flexible cancellation'];

const footerColumns = [
  { title: 'Explore', items: ['Beach stays', 'City stays', 'Safari lodges', 'Under R1000'] },
  { title: 'Customer', items: ['My trips', 'Favourites', 'Help centre', 'Cancellation policy'] },
  { title: 'Company', items: ['About StayHop', 'Contact', 'Privacy', 'Terms'] },
];

function hideBrokenImage(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.style.display = 'none';
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function LandingPage({ onEnter }: LandingPageProps) {
  const dispatch = useAppDispatch();

  const search = useAppSelector((state) => state.search);

  const [city, setCityInput] = useState(search.city);
  const [checkIn, setCheckIn] = useState(search.checkIn ?? '');
  const [checkOut, setCheckOut] = useState(search.checkOut ?? '');
  const [adults, setAdults] = useState(search.guests.adults);
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const hasOneDate = (checkIn === '') !== (checkOut === '');
    if (hasOneDate) {
      setError('Choose both a check-in and a check-out date.');
      return;
    }
    if (checkIn !== '' && checkOut <= checkIn) {
      setError('Check-out must be after check-in.');
      return;
    }

    setError('');
    dispatch(setCity(city.trim()));
    dispatch(
      setDates({
        checkIn: checkIn === '' ? null : checkIn,
        checkOut: checkOut === '' ? null : checkOut,
      }),
    );
    dispatch(setGuests({ adults: adults, children: 0, rooms: 1 }));
    onEnter();
  };

  return (
    <div className="landing-page">
      <header className="landing-header">
        <Logo colour="dark" />
        <nav className="landing-nav" aria-label="Main">
          <button type="button" className="landing-nav-link" onClick={onEnter}>
            Stays
          </button>
          <button type="button" className="landing-nav-link">
            My trips
          </button>
          <button type="button" className="landing-avatar" aria-label="Account">
            <span aria-hidden="true">&#9786;</span>
          </button>
        </nav>
      </header>

      <main className="landing-hero">
        <div className="landing-copy">
          <p className="landing-eyebrow">
            <span className="landing-eyebrow-num">01</span>
            Independent stays{' '}
            <br />
            across South Africa
          </p>

          <h1 className="landing-headline">
            STAY
            <span className="landing-headline-accent">LESS</span>
            ORDINARY.
          </h1>

          <p className="landing-promise">
            The memorable ones are rarely the obvious ones. Find character-filled stays, honest
            prices, and room to wander.
          </p>

          <button type="button" className="landing-explore" onClick={onEnter}>
            Explore the deck &rsaquo;
          </button>
        </div>

        <div className="landing-art" aria-hidden="true">
          <div className="landing-arch">
            <img className="landing-arch-img" src={heroImage} alt="" onError={hideBrokenImage} />
            <span className="landing-arch-caption">Cape Town</span>
          </div>
          <div className="landing-polaroid">
            <img className="landing-polaroid-img" src={accentImage} alt="" onError={hideBrokenImage} />
          </div>
          <div className="landing-badge">
            <strong>26</strong>
            <span>
              New stays
              <br />
              this week
            </span>
          </div>
        </div>
      </main>

      <section className="landing-search-wrap" aria-label="Search stays">
        <form className="landing-card" onSubmit={handleSubmit} noValidate>
          <div className="landing-card-intro">
            <h2 className="landing-card-title">Book your escape</h2>
            <p className="landing-card-sub">One search. Final prices. No surprises.</p>
          </div>

          <div className="landing-fields">
            <label className="landing-field">
              <span className="landing-field-label">Where to?</span>
              <input
                className="landing-input"
                type="text"
                placeholder="City or town"
                value={city}
                onChange={(event) => setCityInput(event.target.value)}
              />
            </label>

            <label className="landing-field">
              <span className="landing-field-label">Check-in</span>
              <input
                className="landing-input"
                type="date"
                min={todayIso()}
                value={checkIn}
                onChange={(event) => setCheckIn(event.target.value)}
              />
            </label>

            <label className="landing-field">
              <span className="landing-field-label">Check-out</span>
              <input
                className="landing-input"
                type="date"
                min={checkIn === '' ? todayIso() : checkIn}
                value={checkOut}
                onChange={(event) => setCheckOut(event.target.value)}
              />
            </label>

            <label className="landing-field">
              <span className="landing-field-label">Guests</span>
              <select
                className="landing-input"
                value={adults}
                onChange={(event) => setAdults(Number(event.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map((count) => (
                  <option key={count} value={count}>
                    {count} {count === 1 ? 'guest' : 'guests'}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button type="submit" className="landing-search-btn">
            Search
          </button>

          {error !== '' && (
            <p className="landing-error" role="alert">
              {error}
            </p>
          )}
        </form>

        <div className="landing-under">
          <div className="landing-chips">
            <span className="landing-chips-label">Go where it feels good</span>
            {quickCities.map((name) => (
              <button
                key={name}
                type="button"
                className="landing-chip"
                onClick={() => setCityInput(name)}
              >
                {name}
              </button>
            ))}
          </div>

          <ul className="landing-trust">
            {trustPoints.map((point) => (
              <li key={point} className="landing-trust-item">
                <span className="landing-tick" aria-hidden="true">&#10003;</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <Logo colour="light" />
            <p>Independent stays across South Africa.</p>
          </div>
          {footerColumns.map((column) => (
            <div key={column.title} className="landing-footer-col">
              <h3 className="landing-footer-title">{column.title}</h3>
              <ul>
                {column.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
