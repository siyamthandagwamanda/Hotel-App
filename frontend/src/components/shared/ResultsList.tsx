import { useState, useEffect } from 'react';
import HotelCard from '../../hotel/HotelCard';
import { useAppDispatch, useAppSelector } from '../../hooks/storeHooks';
import { searchHotelInventory } from '../../slices/hotelSlices.js';
import { toggleFavourite } from '../../slices/favouriteSlice';

export type ResultsArgs = {
  city: string;
  checkIn: string | null;
  checkOut: string | null;
  adults: number;
  children: number;
  rooms: number;
  minPrice: number | null;
  maxPrice: number | null;
  stars: number | null;
  amenityIds: number[];
  propertyType: string | null;
  sort: string;
};

interface ResultsListProps {
  args: ResultsArgs;
  onOpenHotel: (hotelId: number) => void;
}

interface ResultsChunkProps {
  args: ResultsArgs;
  cursor: string | null;
  isLast: boolean;
  onLoadMore: (nextCursor: string) => void;
  onOpenHotel: (hotelId: number) => void;
}

function ResultsChunk({ args, cursor, isLast, onLoadMore, onOpenHotel }: ResultsChunkProps) {
  const dispatch = useAppDispatch();
  

  const savedIds = useAppSelector((state) => state.favourites.hotelIds);
  const { searchResults, nextCursor, isLoading, error } = useAppSelector((state) => state.hotels);

  useEffect(() => {
    dispatch(searchHotelInventory({ ...args, cursor }));
  }, [args, cursor, dispatch]);

  if (isLoading && searchResults.length === 0) {
    return (
      <div className="results-grid" aria-busy="true">
        {[0, 1, 2, 3, 4, 5].map((placeholder) => (
          <div className="results-skeleton" key={placeholder} />
        ))}
      </div>
    );
  }

  if (error && searchResults.length === 0) {
    return (
      <div className="results-message">
        <p>Could not load stays: {error}</p>
        <button 
          type="button" 
          className="results-retry-btn"
          onClick={() => dispatch(searchHotelInventory({ ...args, cursor }))}
        >
          Try again
        </button>
      </div>
    );
  }

  if (searchResults.length === 0 && cursor === null) {
    return (
      <div className="results-message">
        <p>No stays match this search.</p>
        <p>Try other dates, fewer filters, or a different place.</p>
      </div>
    );
  }

  return (
    <>
      <div className="results-grid">
        {searchResults.map((hotel) => (
          <HotelCard
            key={hotel.id}
            hotel={hotel}
            saved={savedIds.includes(hotel.id)}
            onToggleSave={(hotelId) => dispatch(toggleFavourite(hotelId))}
            onOpen={onOpenHotel}
          />
        ))}
      </div>

      {isLast && nextCursor !== null && (
        <div className="results-more">
          <button
            type="button"
            className="results-load-button"
            onClick={() => onLoadMore(nextCursor)}
          >
            Show more stays
          </button>
        </div>
      )}
    </>
  );
}

export function ResultsList({ args, onOpenHotel }: ResultsListProps) {
  //keyset pagination
  const [cursors, setCursors] = useState<(string | null)[]>([null]);

  return (
    <div className="results-list-wrapper">
      {cursors.map((cursor, position) => (
        <ResultsChunk
          key={cursor === null ? 'first' : cursor}
          args={args}
          cursor={cursor}
          isLast={position === cursors.length - 1}
          onLoadMore={(nextCursor) => setCursors([...cursors, nextCursor])}
          onOpenHotel={onOpenHotel}
        />
      ))}
    </div>
  );
}

export default ResultsList;
