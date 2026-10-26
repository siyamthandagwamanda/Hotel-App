import { useState } from 'react';
import Logo from '../components/shared/Logo';
import ChipBar from '../components/shared/ChipBar';
import DeckPager from '../components/shared/HomePaper';
import { buildDeckPages, deckChips } from '../utils/homePageUtils';
import { setCurrentPage } from '../slices/journeySlice';
import SearchSheet from '../components/shared/SearchSheet';
import { describeSearch } from '../utils/describeSearch';
import { useAppDispatch, useAppSelector } from '../hooks/storeHooks';
//import './HomeDeckPage.css';

interface HomeDeckPageProps {
  onBackToLanding: () => void;
}

export function HomeDeckPage({ onBackToLanding }: HomeDeckPageProps) {
  const dispatch = useAppDispatch();

  const city = useAppSelector((state) => state.search.city);
  const checkIn = useAppSelector((state) => state.search.checkIn);
  const checkOut = useAppSelector((state) => state.search.checkOut);
  const adults = useAppSelector((state) => state.search.guests.adults);
  
  const { currentPage } = useAppSelector((state) => state.journey);
  const { shelves, isLoading, error } = useAppSelector((state) => state.hotels);

  const [clickedChipId, setClickedChipId] = useState<string | null>(null);
  const [openedId, setOpenedId] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const pages = shelves ? buildDeckPages(shelves) : [];
  const safePage = pages.length === 0 ? 0 : Math.min(Math.max(currentPage, 0), pages.length - 1);
  const activePage = pages.length > 0 ? pages[safePage] : null;

  const visibleChips = deckChips.filter((chip) =>
    pages.some((page) => page.id === chip.pageId)
  );

  const findActiveChipId = (): string => {
    if (activePage === null) return '';
    const clicked = visibleChips.find((chip) => chip.id === clickedChipId);
    if (clicked !== undefined && clicked.pageId === activePage.id) return clicked.id;
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
    
      <header className="deck-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
        {/* Explicit Back Arrow Button Trigger to slide the viewport backward */}
        <button
          type="button"
          className="pane-swap-back-btn"
          aria-label="Back to search entry form"
          onClick={onBackToLanding}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0 8px',
            color: 'var(--color-primary, #000)'
          }}
        >
          ←
        </button>

        <Logo colour="dark" />
        
        <button
          type="button"
          className="deck-pill"
          onClick={() => setSearchOpen(true)}
          style={{ marginLeft: 'auto' }}
        >
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
      

      {openedId !== null && (
        <p className="deck-message" style={{ padding: '0 16px', color: 'var(--color-accent, #0066cc)' }}>
          Hotel ID {openedId} selected. The detailed view panel maps in the next module.
        </p>
      )}

      {pages.length > 0 && (
        <div className="deck-body">
          <DeckPager pages={pages} onOpenHotel={setOpenedId} />
        </div>
      )}


      {searchOpen && (
        <SearchSheet
          onClose={() => setSearchOpen(false)}
          onSubmit={() => {
            setSearchOpen(false);
            dispatch(setCurrentPage(1));
          }}
        />
      )}
    </div>
  );
}

export default HomeDeckPage;