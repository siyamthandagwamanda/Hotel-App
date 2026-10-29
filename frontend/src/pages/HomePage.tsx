import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/shared/Logo';
import ChipBar from '../components/shared/ChipBar';
import DeckPager from '../components/shared/HomePaper';
import SearchSheet from '../components/shared/SearchSheet';
import { buildDeckPages, deckChips } from '../utils/homePageUtils';
import { describeSearch } from '../utils/describeSearch';
import { setCurrentPage } from '../slices/journeySlice';
import { useAppDispatch, useAppSelector } from '../hooks/storeHooks';
//import '../styles/HomePage.css';

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

  const { currentPage } = useAppSelector((state) => state.journey);
  const { shelves, isLoading, error } = useAppSelector((state) => state.hotels);

  const [clickedChipId, setClickedChipId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const pages = shelves ? buildDeckPages(shelves) : [];
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
        <button type="button" className="deck-home" onClick={onBackToLanding}>
          <Logo colour="dark" />
        </button>

        <button type="button" className="deck-pill" onClick={() => setSearchOpen(true)}>
          {describeSearch(city, checkIn, checkOut, adults)}
        </button>
      </header>

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
        <p className="deck-message">No hotels found. Try another city.</p>
      )}

      {pages.length > 0 && (
        <div className="deck-body">
          <DeckPager
            pages={pages}
            onOpenHotel={(hotelId) => navigate('/hotels/' + hotelId)}
          />
        </div>
      )}

      {searchOpen && (
        <SearchSheet
          onClose={() => setSearchOpen(false)}
          onSubmit={() => {
            setSearchOpen(false);
            navigate('/search');
          }}
        />
      )}
    </div>
  );
}

export default HomeDeckPage;