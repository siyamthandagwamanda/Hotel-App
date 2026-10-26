import { useAppDispatch, useAppSelector } from '../../src/hooks/storeHooks';
import { HomeDeckPage } from '../../src/pages/HomePage';
import { LandingPage } from '../../src/pages/LandingPage';
import { setLandingScreen } from '../../src/slices/journeySlice';

export function EntryPage() {
  const dispatch = useAppDispatch();

 
  const { landingScreen } = useAppSelector((state) => state.journey);

  const handleEnterCatalog = () => {
    dispatch(setLandingScreen(false));
  };

  const handleReturnToLanding = () => {
    dispatch(setLandingScreen(true));
  };

  return (
    <div 
      className="entry-viewport-container" 
      style={{
        width: '100%',
        overflow: 'hidden',
        position: 'relative'
      }}
    >

      <div
        className="entry-carousel-track"
        style={{
          display: 'flex',
          width: '200%',
          transform: landingScreen ? 'translateX(0%)' : 'translateX(-50%)',
          transition: 'transform 400ms cubic-bezier(0.25, 1, 0.5, 1)'
        }}
      >
        {/* PANEL 1: Landing Form Panel View */}
        <div 
          className="entry-panel-pane" 
          aria-hidden={!landingScreen}
          style={{ width: '50%', height: '100%' }}
        >
          <LandingPage onEnter={handleEnterCatalog} />
        </div>

        {/* PANEL 2: Home Catalog Discovery Shelves Deck View */}
        <div 
          className="entry-panel-pane" 
          aria-hidden={landingScreen}
          style={{ width: '50%', height: '100%' }}
        >
          <HomeDeckPage onBackToLanding={handleReturnToLanding} />
        </div>
      </div>
    </div>
  );
}

export default EntryPage;