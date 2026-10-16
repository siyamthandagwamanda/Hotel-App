import { useState } from 'react';
import Logo from '../components/shared/Logo';
import ChipBar from './../components/shared/ChipBar';
import DeckPager from './../components/shared/HomePaper';
import { buildDeckPages, deckChips } from './../utils/homePageUtils';
import { setCurrentPage } from './../slices/journeySlice';
import { useAppDispatch, useAppSelector } from './../hooks/storeHooks';
import './../styles/HomePage.module.css';

interface HomeDeckPageProps {
  onBackToLanding: () => void;
}


function describeSearch(
  city: string,
  checkIn: string | null,
  checkOut: string | null,
  adults: number,

): string {

  const parts: string[] = [];
  parts.push(city === '' ? 'Where to?' : city);

  if (checkIn !== null && checkOut !== null) {
    parts.push(`${checkIn} to ${checkOut}`);
  }
  parts.push(`${adults} ${adults === 1 ? 'guest' : 'guests'}`);
  return parts.join(' · ');
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

  // Group raw database shelves into sub-page decks purely in-memory
  const pages = shelves ? buildDeckPages(shelves) : [];
  const safePage = pages.length === 0 ? 0 : Math.min(Math.max(currentPage, 0), pages.length - 1);
  const activePage = pages.length > 0 ? pages[safePage] : null;

  // Filter chips to display only the choices available in the current data payload
  const visibleChips = deckChips.filter((chip) => 
    pages.some((page) => page.id === chip.pageId)
  );

  
  const findActiveChipId = (): string => {
    if (!activePage) return '';
    
    const clicked = visibleChips.find((chip) => chip.id === clickedChipId);
    if (clicked && clicked.pageId === activePage.id) {
      return clicked.id;
    }
    
    const first = visibleChips.find((chip) => chip.pageId === activePage.id);
    return first ? first.id : '';
  };

  const handleChipSelect = (chipId: string) => {
    const chip = visibleChips.find((item) => item.id === chipId);
    if (!chip) return;

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
        <p className="deck-pill">{describeSearch(city, checkIn, checkOut, adults)}</p>
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
        <p className="deck-message deck-message-highlight">
          Hotel {openedId} selected. The detail page comes in a later step.
        </p>
      )}

      
      {pages.length > 0 && (
        <div className="deck-body">
          <DeckPager pages={pages} onOpenHotel={setOpenedId} />
        </div>
      )}
    </div>
  );
}

export default HomeDeckPage;
