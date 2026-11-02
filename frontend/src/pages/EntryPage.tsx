import { useRef } from 'react';
import type { TouchEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../src/hooks/storeHooks';
import { HomeDeckPage } from '../../src/pages/HomePage';
import { LandingPage } from '../../src/pages/LandingPage';
import { setLandingScreen } from '../../src/slices/journeySlice';
import '../styles/EntryPage.css';

export function EntryPage() {
  const dispatch = useAppDispatch();

 
  const { landingScreen } = useAppSelector((state) => state.journey);

  const handleEnterCatalog = () => {
    dispatch(setLandingScreen(false));
  };

  const handleReturnToLanding = () => {
    dispatch(setLandingScreen(true));
  };

  const touchStart = useRef<{ x: number; y: number; fromDeckContent: boolean } | null>(null);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const target = event.target as Element;
    // Swipes that start on a hotel row or a shelf page belong to that scroller
    const fromDeckContent = target.closest('.deck-row, .pager-track, .sheet-backdrop') !== null;
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY, fromDeckContent: fromDeckContent };
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (start === null || start.fromDeckContent) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return;

    if (deltaX < 0 && landingScreen) {
      dispatch(setLandingScreen(false));
    } else if (deltaX > 0 && !landingScreen) {
      dispatch(setLandingScreen(true));
    }
  };

  return (
    <div
      className="entry-viewport-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >

      <div
        className="entry-carousel-track"
        style={{
          transform: landingScreen ? 'translateX(0%)' : 'translateX(-50%)',
        }}
      >
        {/* Landing Form Panel View */}
        <div 
          className="entry-panel-pane" 
          aria-hidden={!landingScreen}
        >
          <LandingPage onEnter={handleEnterCatalog} />
        </div>

        {/* Home Catalog Discovery Shelves Deck View */}
        <div 
          className="entry-panel-pane" 
          aria-hidden={landingScreen}
        >
          <HomeDeckPage onBackToLanding={handleReturnToLanding} />
        </div>
      </div>
    </div>
  );
}

export default EntryPage;