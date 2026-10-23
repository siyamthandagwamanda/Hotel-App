import { useState } from 'react';
<<<<<<< HEAD
import Logo from '../components/shared/Logo';
=======
import Logo from '../components/shared/Logo.js';
>>>>>>> feat/search-ui
import { useAppSelector } from '../hooks/storeHooks';
import { useNavigate } from 'react-router-dom';
import './SearchResultsPage.css';

export function SearchResultsPage() {
  const navigate = useNavigate();

<<<<<<< HEAD

  const { city, checkIn, checkOut, guests } = useAppSelector((state) => state.search);
  
 
  const { results, isLoading, error } = useAppSelector((state) => state.search);
  const [openedId, setOpenedId] = useState<number | null>(null);


=======
  // 1. Reaches directly into the single source of truth for travel query criteria
  const { city, checkIn, checkOut, guests } = useAppSelector((state) => state.search);
  
  // 2. Extracts response arrays and loading flags flatly from your search slice node
  const { results, isLoading, error } = useAppSelector((state) => state.search);
  const [openedId, setOpenedId] = useState<number | null>(null);

  // Fallback default value string parsing if criteria are blank
>>>>>>> feat/search-ui
  const searchSummaryText = `${city || 'All Destinations'} · ${checkIn && checkOut ? `checkIn to {checkOut}` : 'Flexible Dates'} · ${guests.adults} ${guests.adults === 1 ? 'guest' : 'guests'}`;

  return (
    <div className="results-page">
<<<<<<< HEAD
    
=======
      {/* Search Layout Top Header Navigation Bar */}
>>>>>>> feat/search-ui
      <header className="results-header">
        <button type="button" className="results-back-btn" onClick={() => navigate('/')}>
          ← Back
        </button>
        <div className="results-summary-pill">
<<<<<<< HEAD
          <Logo colour="dark" />
=======
          <Logo tone="dark" />
>>>>>>> feat/search-ui
          <span className="results-pill-text">{searchSummaryText}</span>
        </div>
      </header>

<<<<<<< HEAD
    
      <main className="results-main">
        <h1 className="results-title">Available Accommodations</h1>

   
=======
      {/* Main Core Catalogue Frame Content */}
      <main className="results-main">
        <h1 className="results-title">Available Accommodations</h1>

        {/* Dynamic Operational Safety Guard Clauses */}
>>>>>>> feat/search-ui
        {isLoading && <p className="results-message">Searching for optimal stays...</p>}
        {error && <p className="results-message results-message-error">Could not fetch properties: {error}</p>}
        
        {!isLoading && !error && (!results || results.length === 0) && (
          <p className="results-message">No matching stays found. Try widening your criteria bounds.</p>
        )}

        {openedId !== null && (
          <p className="results-message results-message-alert">
            Selected property ID: {openedId}. The details sheet arrives in the next milestone module.
          </p>
        )}

<<<<<<< HEAD
     
=======
        {/* Flat Grid Matrix Rendering Engine */}
>>>>>>> feat/search-ui
        {!isLoading && !error && results && results.length > 0 && (
          <div className="results-grid">
            {results.map((hotel) => (
              <article 
                key={hotel.id} 
                className="results-card"
                onClick={() => setOpenedId(hotel.id)}
              >
                {hotel.images && hotel.images.length > 0 && (
                  <img 
                    className="results-card-img" 
                    src={hotel.images[0].url} 
                    alt={hotel.images[0].alt || hotel.name} 
                  />
                )}
                <div className="results-card-body">
                  <h2 className="results-card-name">{hotel.name}</h2>
                  <p className="results-card-meta">📍 {hotel.city}, {hotel.province} · ⭐ {hotel.ratingAvg}</p>
                  <div className="results-card-footer">
                    <span className="results-card-setting">{hotel.setting}</span>
                    <span className="results-card-price">
                      R{(hotel.fromPriceCents / 100).toLocaleString('en-ZA')} <small>/ night</small>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default SearchResultsPage;
