import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/shared/Logo';
import ChipBar from '../components/shared/ChipBar';
import DeckPager from '../components/shared/HomePaper';
import SearchSheet from '../components/shared/SearchSheet';
import FilterSheet from '../components/shared/FilterSheet';
import { buildDeckPages, buildResultPages, deckChips } from '../utils/homePageUtils';
import { countActiveFilters } from '../utils/countFilter';
import { describeSearch } from '../utils/describeSearch';
import { setCurrentPage } from '../slices/journeySlice';
import { useAppDispatch, useAppSelector } from '../hooks/storeHooks';
import { fetchAllAmenities, fetchShelvesByCity, searchHotelInventory } from '../slices/hotelSlices';
import { setAgainSearch } from '../slices/searchSlice';
import selectShelfCity from '../hotel/searchSelector';
import '../styles/HomePage.css';

interface HomeDeckPageProps {
  onBackToLanding: () => void;
}

export function HomeDeckPage({ onBackToLanding }: HomeDeckPageProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const city = useAppSelector((state) => state.search.city);
  const checkIn = useAppSelector((state) => state.search.checkIn);
  const checkOut = useAppSelector((state) => state.search.checkOut);
  const adults = useAppSelector((state) => state.search.guests.adults);

  const search = useAppSelector((state) => state.search);
  const shelfCity = useAppSelector(selectShelfCity);

  const filterCount = countActiveFilters(search.filters);
  const searchActive = search.city.trim() !== '' || search.checkIn !== null || filterCount > 0;

  // A search shows matching stays as shelves. With no search, the deck shows the city shelves.
  useEffect(() => {
    dispatch(setCurrentPage(0));
    if (searchActive) {
      dispatch(
        searchHotelInventory({
          city: search.city,
          checkIn: search.checkIn,
          checkOut: search.checkOut,
          adults: search.guests.adults,
          children: search.guests.children,
          rooms: search.guests.rooms,
          minPrice: search.filters.minPrice,
          maxPrice: search.filters.maxPrice,
          stars: search.filters.stars,
          amenityIds: search.filters.amenityIds,
          propertyType: search.filters.propertyType,
          sort: search.sort,
          cursor: null,
        }),
      );
    } else {
      dispatch(fetchShelvesByCity(shelfCity));
    }
  }, [dispatch, search, searchActive, shelfCity]);

  // The filter sheet lists facilities, so load them once
  useEffect(() => {
    dispatch(fetchAllAmenities());
  }, [dispatch]);

  const { currentPage } = useAppSelector((state) => state.journey);
  const { shelves, searchResults, isLoading, error } = useAppSelector((state) => state.hotels);

  const [clickedChipId, setClickedChipId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<'none' | 'search' | 'filters'>('none');

  let pages = shelves ? buildDeckPages(shelves) : [];
  if (searchActive) {
    pages = buildResultPages(searchResults);
  }
  const safePage = pages.length === 0 ? 0 : Math.min(Math.max(currentPage, 0), pages.length - 1);
  const activePage = pages.length > 0 ? pages[safePage] : null;

  const visibleChips = deckChips.filter((chip) =>
    pages.some((page) => page.id === chip.pageId),
  );

  const findActiveChipId = (): string => {
    if (!activePage) return '';

    const clicked = visibleChips.find((chip) => chip.id === clickedChipId);
    if (clicked && clicked.pageId === activePage.id) {
      return clicked.id;
    }

    const first = visibleChips.find((chip) => chip.pageId === activePage.id);
    return first === undefined ? '' : first.id;
  };

  const handleChipSelect = (chipId: string) => {
    const chip = visibleChips.find((item) => item.id === chipId);
    if (chip === undefined) return;
    const pageIndex = pages.findIndex((page) => page.id === chip.pageId);
    if (pageIndex === -1) return;
    setClickedChipId(chipId);
    dispatch(setCurrentPage(pageIndex));
  };

  return (
    <div className="deck">
      <header className="deck-header">
        <div className="deck-brand">
          <button type="button" className="deck-home" onClick={onBackToLanding}>
            <Logo colour="dark" />
          </button>
          <button type="button" className="deck-back" onClick={onBackToLanding}>
            &lsaquo; Landing page
          </button>
        </div>

        <button type="button" className="deck-pill" onClick={() => setSheet('search')}>
          <span className="deck-pill-text">{describeSearch(city, checkIn, checkOut, adults)}</span>
          <span className="deck-pill-go">Search</span>
        </button>

        <nav className="deck-nav" aria-label="Main">
          <span className="deck-nav-link">Stays</span>
          <span className="deck-nav-link">My trips</span>
          <span className="deck-avatar" aria-hidden="true">&#9786;</span>
        </nav>
      </header>

      <div className="deck-intro">
        <p className="deck-eyebrow">The NextStay Home</p>
        <h1 className="deck-heading">Find somewhere worth staying.</h1>
      </div>

      <div className="deck-tools">
        <button type="button" className="deck-tool-btn" onClick={() => setSheet('filters')}>
          Filters
          {filterCount > 0 && <span className="deck-tool-badge">{filterCount}</span>}
        </button>
        {searchActive && (
          <>
            <span className="deck-tool-count">
              {isLoading ? 'Searching...' : searchResults.length + (searchResults.length === 1 ? ' stay found' : ' stays found')}
            </span>
            <button type="button" className="deck-tool-clear" onClick={() => dispatch(setAgainSearch())}>
              Clear search
            </button>
          </>
        )}
      </div>

      {visibleChips.length > 0 && (
        <ChipBar
          chips={visibleChips}
          activeChipId={findActiveChipId()}
          onSelect={handleChipSelect}
        />
      )}

      {isLoading && <p className="deck-message">Loading shelves...</p>}
      {error && <p className="deck-message">Could not load shelves: {error}</p>}

      {!isLoading && !error && pages.length === 0 && (
        <p className="deck-message">
          {searchActive ? 'No stays match this search. Try other dates, fewer filters or a different place.' : 'No hotels found. Try another city.'}
        </p>
      )}

      {pages.length > 0 && (
        <div className="deck-body">
          <DeckPager
            pages={pages}
            onOpenHotel={(hotelId) => navigate('/hotels/' + hotelId)}
          />
        </div>
      )}

      {sheet === 'search' && (
        <SearchSheet onClose={() => setSheet('none')} onSubmit={() => setSheet('none')} />
      )}

      {sheet === 'filters' && <FilterSheet onClose={() => setSheet('none')} />}
    </div>
  );
}

export default HomeDeckPage;