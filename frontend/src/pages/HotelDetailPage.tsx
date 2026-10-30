import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/storeHooks';
import { toggleFavourite } from '../slices/favouriteSlice';
import {
  fetchHotelDetail,
  fetchHotelRooms,
  fetchHotelReviews,
  clearDetail,
} from '../slices/hotelDetailSlices';
import SearchSheet from '../components/shared/SearchSheet';
import Gallery from '../components/shared/Gallery';
import RoomList from '../components/shared/RoomList';
import { formatRand, formatShortDate } from '../utils/formatUtils';
import '../styles/HotelDetailPage.css';

const tabs = [
  { id: 'rooms', label: 'Rooms' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'policies', label: 'Policies' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'map', label: 'Map' },
];

function policyLabel(type: string): string {
  if (type === 'cancellation') return 'Cancellation';
  if (type === 'pets') return 'Pets';
  if (type === 'children') return 'Children';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (element !== null) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export function HotelDetailPage() {
  const dispatch = useAppDispatch();
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // The hotel id comes from the address, for example /hotels/3
  const idNumber = Number(params.id);
  const hotelId = Number.isInteger(idNumber) && idNumber > 0 ? idNumber : null;

  const search = useAppSelector((state) => state.search);
  const user = useAppSelector((state) => state.auth.user);
  const savedIds = useAppSelector((state) => state.favourites.hotelIds);
  const detail = useAppSelector((state) => state.hotelDetail);

  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [note, setNote] = useState('');
  const [shareMessage, setShareMessage] = useState('');

  // Load the hotel and its reviews when the page opens, clear them when it closes.
  useEffect(() => {
    if (hotelId === null) return;

    window.scrollTo(0, 0);
    dispatch(fetchHotelDetail(hotelId));
    dispatch(fetchHotelReviews(hotelId));

    return () => {
      dispatch(clearDetail());
    };
  }, [dispatch, hotelId]);

  // Load the rooms again whenever the dates or guests change.
  useEffect(() => {
    if (hotelId === null) return;

    dispatch(
      fetchHotelRooms({
        hotelId: hotelId,
        checkIn: search.checkIn,
        checkOut: search.checkOut,
        adults: search.guests.adults,
        children: search.guests.children,
        rooms: search.guests.rooms,
      })
    );
  }, [
    dispatch,
    hotelId,
    search.checkIn,
    search.checkOut,
    search.guests.adults,
    search.guests.children,
    search.guests.rooms,
  ]);

  // If the page was opened straight from a shared link there is nothing to go back to,
  // so Back goes to the home page instead of leaving the app.
  function handleBack() {
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/');
    }
  }

  async function handleShare() {
    if (detail.hotel === null) return;

    const link = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: detail.hotel.name,
          text: detail.hotel.name + ' in ' + detail.hotel.city + ' on StayHop',
          url: link,
        });
        return;
      }
      await navigator.clipboard.writeText(link);
      setShareMessage('Link copied');
      window.setTimeout(() => setShareMessage(''), 2500);
    } catch {
      // The person closed the share sheet, or copying was blocked.
    }
  }

  if (hotelId === null || detail.hotelStatus === 'error') {
    return (
      <div className="detail-state">
        <p>We could not find that hotel.</p>
        <button type="button" className="detail-button" onClick={handleBack}>
          Go back
        </button>
      </div>
    );
  }

  if (detail.hotel === null) {
    return <div className="detail-state">Loading hotel...</div>;
  }

  const hotel = detail.hotel;
  const saved = savedIds.includes(hotel.id);
  const hasDates = search.checkIn !== null && search.checkOut !== null;

  // The chosen room is the one the person picked, or else the best one.
  const pickedRoom = detail.rooms.find(
    (room) => room.id === selectedRoomId && room.fitsParty && room.available !== false
  );
  const bestRoom = detail.rooms.find((room) => room.id === detail.bestRoomId);
  const chosenRoom = pickedRoom !== undefined ? pickedRoom : bestRoom;
  const chosenIsBest = chosenRoom !== undefined && chosenRoom.id === detail.bestRoomId;

  let buttonLabel = user === null ? 'Register to reserve' : 'Reserve';
  if (!hasDates) {
    buttonLabel = 'Choose dates';
  }

  function handleReserve() {
    if (!hasDates) {
      setSearchOpen(true);
      return;
    }
    if (chosenRoom === undefined) {
      setNote('Pick a room first.');
      return;
    }
    setNote('Booking opens in the next step of the build.');
  }

  const boxLeft = hotel.longitude - 0.01;
  const boxBottom = hotel.latitude - 0.01;
  const boxRight = hotel.longitude + 0.01;
  const boxTop = hotel.latitude + 0.01;
  const mapSrc =
    'https://www.openstreetmap.org/export/embed.html?bbox=' +
    boxLeft + ',' + boxBottom + ',' + boxRight + ',' + boxTop +
    '&layer=mapnik&marker=' + hotel.latitude + ',' + hotel.longitude;
  const mapLink =
    'https://www.openstreetmap.org/?mlat=' + hotel.latitude + '&mlon=' + hotel.longitude +
    '#map=15/' + hotel.latitude + '/' + hotel.longitude;

  const cardImage = hotel.images.length > 1 ? hotel.images[1] : hotel.images[0];

  return (
    <div className="detail">
      <div className="detail-top">
        <div className="detail-bar-row">
          <button type="button" className="detail-link" onClick={handleBack}>
            &lsaquo; Back to stays
          </button>
          <div className="detail-actions">
            <button type="button" className="detail-link" onClick={handleShare}>
              Share
            </button>
            <button
              type="button"
              className="detail-link"
              aria-pressed={saved}
              onClick={() => dispatch(toggleFavourite(hotel.id))}
            >
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {shareMessage !== '' && <p className="detail-toast" role="status">{shareMessage}</p>}

        <nav className="detail-tabs" aria-label="Hotel sections">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" className="detail-tab" onClick={() => scrollToSection(tab.id)}>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <Gallery images={hotel.images} />

      <div className="detail-layout">
        <div className="detail-main">
          <header>
            <p className="detail-place">{hotel.city}, {hotel.province}</p>
            <h1 className="detail-name">{hotel.name}</h1>
            <p className="detail-rating">
              <span className="detail-star">&#9733;</span>
              <strong>{hotel.ratingAvg.toFixed(1)}</strong>
              <span>{hotel.starRating} stars</span>
              <span>{hotel.reviewCount} {hotel.reviewCount === 1 ? 'review' : 'reviews'}</span>
            </p>
            <p className="detail-description">{hotel.description}</p>
            <p className="detail-muted">
              Check-in from {hotel.checkInTime} · Check-out by {hotel.checkOutTime}
            </p>
          </header>

          <section id="rooms" className="detail-section">
            <h2 className="detail-heading">Rooms</h2>

            {!hasDates && (
              <div className="detail-prompt">
                <p>Choose your dates to see which rooms are free and the total price.</p>
                <button type="button" className="detail-button" onClick={() => setSearchOpen(true)}>
                  Choose dates
                </button>
              </div>
            )}

            {hasDates && (
              <p className="detail-muted">
                {formatShortDate(search.checkIn as string)} to {formatShortDate(search.checkOut as string)} ·{' '}
                {search.guests.adults} {search.guests.adults === 1 ? 'adult' : 'adults'}
                {search.guests.children > 0 ? ', ' + search.guests.children + ' children' : ''} ·{' '}
                {search.guests.rooms} {search.guests.rooms === 1 ? 'room' : 'rooms'}
              </p>
            )}

            {detail.roomsStatus === 'loading' && <p className="detail-muted">Checking availability...</p>}
            {detail.roomsStatus === 'error' && (
              <p className="detail-muted">Could not check availability. Try again shortly.</p>
            )}

            <RoomList
              rooms={detail.rooms}
              nights={detail.nights}
              chosenRoomId={chosenRoom === undefined ? null : chosenRoom.id}
              onSelect={setSelectedRoomId}
            />
          </section>

          <section id="facilities" className="detail-section">
            <h2 className="detail-heading">Facilities</h2>
            <ul className="detail-chips">
              {hotel.amenities.map((amenity) => (
                <li className="detail-chip" key={amenity.id}>&#10003; {amenity.name}</li>
              ))}
            </ul>
          </section>

          <section id="policies" className="detail-section">
            <h2 className="detail-heading">Policies</h2>
            <dl className="detail-policies">
              {hotel.policies.map((policy) => (
                <div key={policy.type}>
                  <dt>{policyLabel(policy.type)}</dt>
                  <dd>{policy.text}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section id="reviews" className="detail-section">
            <h2 className="detail-heading">Reviews</h2>
            {detail.reviews.length === 0 && (
              <p className="detail-muted">No reviews yet. Guests can review after their stay.</p>
            )}
            <ul className="detail-reviews">
              {detail.reviews.map((review) => (
                <li className="detail-review" key={review.id}>
                  <p>
                    <strong>{review.name}</strong> <span className="detail-star">&#9733;</span> {review.rating} out of 5
                  </p>
                  {review.comment !== null && <p>{review.comment}</p>}
                  <p className="detail-muted">
                    {formatShortDate(review.createdAt.slice(0, 10))} {review.createdAt.slice(0, 4)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section id="map" className="detail-section">
            <h2 className="detail-heading">Location</h2>
            <p className="detail-muted">{hotel.address}</p>
            <iframe className="detail-map" title={'Map showing ' + hotel.name} src={mapSrc} loading="lazy" />
            <a className="detail-maplink" href={mapLink} target="_blank" rel="noreferrer">
              Open a larger map
            </a>
          </section>
        </div>

        <aside className="detail-card">
          {cardImage !== undefined && <img className="detail-card-img" src={cardImage.url} alt={cardImage.alt} />}

          {chosenRoom === undefined ? (
            <p className="detail-muted">
              No room fits this group and these dates. Try other dates or fewer guests.
            </p>
          ) : (
            <>
              <p className="detail-card-label">
                {chosenIsBest ? 'Best room for your dates' : 'Your selected room'}
              </p>
              <h3 className="detail-card-name">{chosenRoom.name}</h3>
              <p className="detail-muted">
                Sleeps {chosenRoom.adults}
                {chosenRoom.bedType !== null ? ' · ' + chosenRoom.bedType : ''}
              </p>
              <p>
                <span className="detail-card-price">{formatRand(chosenRoom.nightlyCents)}</span>
                <span className="detail-muted"> / night</span>
              </p>
              {chosenRoom.totalCents !== null && detail.nights !== null && (
                <p className="detail-muted">
                  {formatRand(chosenRoom.totalCents)} total for {detail.nights}{' '}
                  {detail.nights === 1 ? 'night' : 'nights'}, taxes included
                </p>
              )}
            </>
          )}

          <button
            type="button"
            className="detail-button detail-button-action"
            disabled={chosenRoom === undefined && hasDates}
            onClick={handleReserve}
          >
            {buttonLabel}
          </button>
          {note !== '' && <p className="detail-note" role="status">{note}</p>}
        </aside>
      </div>

      {searchOpen && (
        <SearchSheet onClose={() => setSearchOpen(false)} onSubmit={() => setSearchOpen(false)} />
      )}
    </div>
  );
}

export default HotelDetailPage;