import { useState } from 'react';
import Logo from '../components/shared/Logo.js';
import { useAppDispatch, useAppSelector } from './../hooks/storeHooks';
import { setCurrentPage } from '../slices/journeySlice.js';


interface HotelImage {
  url: string;
  alt: string;
}

interface HotelCardData {
  id: number;
  name: string;
  city: string;
  province: string;
  starRating: number;
  ratingAvg: number;
  reviewCount: number;
  setting: string;
  fromPriceCents: number;
  images: HotelImage[];
}

export function SearchResultsPage() {
  const dispatch = useAppDispatch();

  
  const { city, checkIn, checkOut, guests } = useAppSelector((state) => state.search);
  

  const { searchResults, isLoading, error } = useAppSelector((state) => state.hotels);
  
  const [openedId, setOpenedId] = useState<number | null>(null);

  const searchSummaryText = `${city || 'All Destinations'} · ${
    checkIn && checkOut ? `${checkIn} to ${checkOut}` : 'Flexible Dates'
  } · ${guests.adults} ${guests.adults === 1 ? 'guest' : 'guests'}`;

  return (
    <div className="results-page">
    
      <header className="results-header">
        <button 
          type="button" 
          className="results-back-btn" 
          onClick={() => dispatch(setCurrentPage(0))}
        >
          ← Back
        </button>
        <div className="results-summary-pill">
          <Logo colour="dark" />
          <span className="results-pill-text">{searchSummaryText}</span>
        </div>
      </header>

     
      <main className="results-main">
        <h1 className="results-title">Available Accommodations</h1>

     
        {isLoading && <p className="results-message">Searching for optimal stays...</p>}
        {error && <p className="results-message results-message-error">Could not fetch properties: {error}</p>}
        
        {!isLoading && !error && (!searchResults || searchResults.length === 0) && (
          <p className="results-message">No matching stays found. Try widening your criteria bounds.</p>
        )}

        {openedId !== null && (
          <p className="results-message results-message-alert">
            Selected property ID: {openedId}. The details sheet arrives in the next milestone module.
          </p>
        )}

     
        {!isLoading && !error && searchResults && searchResults.length > 0 && (
          <div className="results-grid">
            {searchResults.map((hotel: HotelCardData) => (
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
                  <p className="results-card-meta">📍 {hotel.city}, {hotel.province} · ⭐ {hotel.ratingAvg.toFixed(1)}</p>
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
