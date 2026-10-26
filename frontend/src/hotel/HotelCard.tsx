//import './HotelCard.css';

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

interface HotelCardProps {
  hotel: HotelCardData;
  saved: boolean;
  onToggleSave: (hotelId: number) => void;
  onOpen: (hotelId: number) => void;
}

export function HotelCard({ hotel, saved, onToggleSave, onOpen }: HotelCardProps) {
 
  const priceRand = `R${(hotel.fromPriceCents / 100).toLocaleString('en-ZA')}`;

  return (
    <article className="results-card" onClick={() => onOpen(hotel.id)}>
      
      <div className="results-card-media">
        {hotel.images && hotel.images.length > 0 ? (
          <img 
            className="results-card-img" 
            src={hotel.images[0].url} 
            alt={hotel.images[0].alt || hotel.name} 
          />
        ) : (
          <div className="results-card-img-fallback">No Preview Available</div>
        )}
        <span className="results-card-badge">{hotel.setting}</span>
      </div>

      {/*Details Panel */}
      <div className="results-card-body">
        <div className="results-card-meta-row">
          <p className="results-card-meta">
             {hotel.city}, {hotel.province} · ⭐ {hotel.ratingAvg.toFixed(1)}
          </p>
          
          {/*heart button trigger*/}
          <button
            type="button"
            className={`results-card-save-btn ${saved ? 'saved' : ''}`}
            aria-label={saved ? "Remove from favourites" : "Save to favourites"}
            onClick={(event) => {
              event.stopPropagation();
              onToggleSave(hotel.id);
            }}
          >
            {saved ? '❤️' : '🤍'}
          </button>
        </div>

        <h2 className="results-card-name">{hotel.name}</h2>
        <p className="results-card-reviews">{hotel.reviewCount} verified reviews</p>
        
        <div className="results-card-footer">
          <span className="results-card-price">
            <strong>{priceRand}</strong> <small>/ night</small>
          </span>
        </div>
      </div>
    </article>
  );
}

export default HotelCard;
