import { useState } from "react";
import Logo from "../components/shared/Logo";
import { useAppSelector } from "../hooks/storeHooks";
import { selectShelfCity } from "../hotel/searchSelector";
import "../styles/HomePage.module.css";

interface HomePageProps {
    onBackToLanding: () => void;
}

function describeSearch(
    city: string, checkIn: string | null, checkOut: string | null, adults: number,
): string {

    const parts: string[] = [];

    parts.push(city === '' ? 'Where to?' : city);

    if (checkIn !== null && checkOut !== null){
        parts.push(`${checkIn} to ${checkOut}`);
    }
    parts.push(`${adults} ${adults === 1 ? 'guest' : 'guests'}`);

    return parts.join('.');
}

export function HomePage({onBackToLanding}: HomePageProps){

    const shelfCity = useAppSelector(selectShelfCity);

    const city = useAppSelector((state) => state.search.city);

    const checkIn = useAppSelector((state) => state.search.checkIn);

    const checkOut = useAppSelector((state) => state.search.checkOut);

    const adults = useAppSelector((state) => state.search.guests.adults)

    const { shelves, isLoading, error } = useAppSelector((state) => state.hotels)
    const [ openedId, setOpenedId ] = useState<number | null>(null);

    return(
        <div className="home">
            <header className="home-header">
                <button type="button" className="home-page" onClick={onBackToLanding}>
                    <Logo colour="dark"/>
                </button>
                <p className="home-pill">{describeSearch(city, checkIn, checkOut, adults)}</p>
            </header>

            {isLoading &&  <p className="home-message">Loading shelves...</p>}
            {error && <p className="home-message">Could not load shelves: {error}</p>}

            {openedId !== null && (
                <p className="home-message home-message-highlight">
                    Hotel {openedId} selected. The detail page comes in a later step.
                </p>
            )}

            { shelves && shelves.length > 0 && (
                <div className="home-shelves">
                    {shelves.slice(0,3).map((shelf) => (

                        <section key={shelf.id} className="home-shelf-section">

                            <h2 className="home-shelf-title">{shelf.title}</h2>
                            <ul className="home-hotel-list">

                                {shelf.hotels.map((hotel) => (
                                    <li
                                        key={hotel.id}
                                        className="home-hotel-item"
                                        onClick={() => setOpenedId(hotel.id)}
                                    >
                                        <span className="home-hotel-details">
                                            <strong className="home-hotel-name">{hotel.name}</strong> - {hotel.city}
                                        </span>
                                        <span className="home-hotel-price">
                                            R{(hotel.fromPriceCents / 100).toLocaleString('en-ZA')}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            )}
        </div>
    )
}

export default HomePage;