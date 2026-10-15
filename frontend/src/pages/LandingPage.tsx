import { useState } from 'react';
import Logo from '../components/shared/Logo.js';
import { useAppDispatch, useAppSelector } from '../hooks/storeHooks.js';
import { setCity, setDates, setGuests } from '../slices/searchSlice.js';
import "../styles/LandingPage.module.css";

interface LandingPageProps {
  onEnter: () => void;
}

const popularCities = ['Durban', 'Cape Town', 'Johannesburg', 'Stellenbosch', 'Knysna'];
const guestOptions: number[] = [];

export function LandingPage({ onEnter }: LandingPageProps) {
  const dispatch = useAppDispatch();
  const savedCity = useAppSelector((state) => state.search.city);
  

  const { shelves } = useAppSelector((state) => state.hotels);
  

  const topRatedShelf = shelves.find((shelf) => shelf.id === 'top-rated');
  const featuredHotels = topRatedShelf ? topRatedShelf.hotels.slice(0, 4) : [];


  const [activeIndex, setActiveIndex] = useState(0);
  const activeHotel = featuredHotels[activeIndex] || null;

  const [cityInput, setCityInput] = useState(savedCity);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState('2');
  const [error, setError] = useState('');


  const today = new Intl.DateTimeFormat('en-CA').format(new Date());

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (checkIn && checkOut && checkOut <= checkIn) {
      setError('Check-out must be after check-in.');
      return;
    }
    setError('');

   
    dispatch(setCity(cityInput.trim()));
    dispatch(setDates({ checkIn: checkIn || null, checkOut: checkOut || null }));
    dispatch(setGuests({ adults: Number(adults), children: 0, rooms: 1 }));
    
    onEnter();
  };

  const handleChipClick = (city: string) => {
    dispatch(setCity(city));
    onEnter();
  };

  return (
    <section className="landing">
    
      <div className="landing-hero" aria-hidden="true">
        {featuredHotels.map((hotel, index) => (
          <img
            key={hotel.id}
            className={`landing-hero-img ${index === activeIndex ? 'landing-hero-img-active' : ''}`}
            src={hotel.images?.[0]?.url || ''}
            alt=""
          />
        ))}
      </div>
      <div className="landing-overlay" />

      <div className="landing-content">
    
        {featuredHotels.length > 1 && (
          <div className="landing-bars">
            {featuredHotels.map((hotel, index) => (
              <button
                key={hotel.id}
                type="button"
                className={`landing-bar ${index === activeIndex ? 'landing-bar-active' : ''}`}
                aria-label={`Show slide ${index + 1}`}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        )}

        <header className="landing-header">
          <Logo colour="light" />
          <button type="button" className="landing-signin">Sign in</button>
        </header>

        <h1 className="landing-headline">
          Swipe your <span className="landing-headline-accent">next stay.</span>
        </h1>
        <p className="landing-promise">Hundreds of hotels. Final prices. One screen to book.</p>

        {activeHotel && (
          <p className="landing-now">
            Now showing: {activeHotel.name} · R{(activeHotel.fromPriceCents / 100).toLocaleString('en-ZA')} / night
          </p>
        )}

        <div className="landing-spacer" />

      
        <form className="landing-card" onSubmit={handleSubmit}>
          <label className="landing-field">
            Where to?
            <input
              className="landing-input"
              type="text"
              value={cityInput}
              placeholder="City or hotel"
              onChange={(e) => setCityInput(e.target.value)}
            />
          </label>

          <div className="landing-dates">
            <label className="landing-field">
              Check-in
              <input
                className="landing-input"
                type="date"
                value={checkIn}
                min={today}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </label>
            <label className="landing-field">
              Check-out
              <input
                className="landing-input"
                type="date"
                value={checkOut}
                min={checkIn || today}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </label>
          </div>

          <label className="landing-field">
            Guests
            <select className="landing-input" value={adults} onChange={(e) => setAdults(e.target.value)}>
              {guestOptions.map((count: number) => (
                <option key={count} value={count}>
                  {count} {count === 1 ? 'guest' : 'guests'}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="landing-signin" style={{ background: 'var(--color-action)', color: '#fff' }}>
            Search
          </button>

          {error && <p className="landing-error" role="alert">{error}</p>}
        </form>

      
        <div className="landing-chips">
          {popularCities.map((city) => (
            <button key={city} type="button" className="landing-chip" onClick={() => handleChipClick(city)}>
              {city}
            </button>
          ))}
        </div>

        <ul className="landing-trust">
          <li className="landing-trust-item">🛡️ Secure Payments</li>
          <li className="landing-trust-item">✨ Verified Stays</li>
        </ul>

        <button type="button" className="landing-explore" onClick={onEnter}>
          Or browse all stays directly →
        </button>
      </div>
    </section>
  );
}

export default LandingPage;
