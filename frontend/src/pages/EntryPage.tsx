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

  return (
    <div 
      className="entry-viewport-container"
    >

      <div
        className="entry-carousel-track"
        style={{
          transform: landingScreen ? 'translateX(0%)' : 'translateX(-50%)',
        }}
      >
        {/*Landing Form Panel View */}
        <div 
          className="entry-panel-pane" 
          aria-hidden={!landingScreen}
        >
          <LandingPage onEnter={handleEnterCatalog} />
        </div>

        {/*Home Catalog Discovery Shelves Deck View */}
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