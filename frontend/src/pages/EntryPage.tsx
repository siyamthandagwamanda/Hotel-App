import LandingPage from "./LandingPage";
import HomePage from "./HomePage";
import { useAppDispatch, useAppSelector } from "../hooks/storeHooks";
import {setLandingScreen} from "./../slices/journeySlice";
import './../styles/EntryPage.module.css';

export function EntryPage(){
    const dispatch = useAppDispatch();

    const { landingScreen } = useAppSelector((state) => state.journey);

    const handleEnter = () => {
        dispatch(setLandingScreen(true));
    };

    const handleBackToLanding = () => {
        dispatch(setLandingScreen(false));
    };

    return(
        <div className="entry">
{/* Sliding Track Viewport: Animates sideways depending on store state */}
        <div className={`entry-track ${landingScreen ? 'entry-track-home' : ''}`}>

        <div
            className={`entry-panel ${landingScreen ? 'entry-panel-hidden' : ''}`}
            aria-hidden={landingScreen}
        >
            <LandingPage onEnter={handleEnter}/>
        </div>

        <div
            className={`entry-panel ${!landingScreen ? 'entry-panel-hidden' : ''}`}
            aria-hidden={!landingScreen}
        >
            <HomePage  onBackToLanding={handleBackToLanding}/>
        </div>

        </div>
        </div>

    )
}

export default EntryPage
