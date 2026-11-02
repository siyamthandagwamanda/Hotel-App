import { useEffect, useRef } from 'react';
import type { TouchEvent, UIEvent } from 'react';
import type { DeckPageData } from './../../utils/homePageUtils.js';
import { useAppDispatch, useAppSelector } from '../../hooks/storeHooks';
import { setCurrentPage } from '../../slices/journeySlice.js';
import { toggleFavourite } from '../../slices/favouriteSlice';
import './../../styles/HomePaper.css';

interface DeckPagerProps {
  pages: DeckPageData[];
  onOpenHotel: (hotelId: number) => void;
}

const DOTS_SWIPE_DISTANCE = 50;

//so shelf numbers run 01, 02, 03 across
function pageOffset(pages: DeckPageData[], pageId: string): number {
  let count = 0;
  for (const page of pages) {
    if (page.id === pageId) break;
    count += page.shelves.length;
  }
  return count;
}

export function DeckPager({ pages, onOpenHotel }: DeckPagerProps) {
  const dispatch = useAppDispatch();
  

  const { currentPage } = useAppSelector((state) => state.journey);
  const savedIds = useAppSelector((state) => state.favourites.hotelIds);

  const trackRef = useRef<HTMLDivElement>(null);
  const placedOnce = useRef(false);
  const dotsTouchStartX = useRef(0);

  const lastIndex = pages.length - 1;
  const safePage = Math.min(Math.max(currentPage, 0), lastIndex);


  useEffect(() => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;

    const shownPage = Math.round(track.scrollLeft / track.clientWidth);
    if (shownPage !== safePage) {
      const instant = !placedOnce.current;
      track.scrollTo({
        left: safePage * track.clientWidth,
        behavior: instant ? 'auto' : 'smooth',
      });
    }
    placedOnce.current = true;
  }, [safePage, pages.length]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const track = event.currentTarget;
    if (track.clientWidth === 0) return;

    const page = Math.round(track.scrollLeft / track.clientWidth);
    if (page !== currentPage) {
      dispatch(setCurrentPage(page));
    }
  };

  const goToPage = (index: number) => {
    const clamped = Math.min(Math.max(index, 0), lastIndex);
    dispatch(setCurrentPage(clamped));
  };

  const handleDotsTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    dotsTouchStartX.current = event.touches[0].clientX;
  };

  const handleDotsTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const deltaX = event.changedTouches[0].clientX - dotsTouchStartX.current;
    if (deltaX < -DOTS_SWIPE_DISTANCE) {
      goToPage(safePage + 1);
    } else if (deltaX > DOTS_SWIPE_DISTANCE) {
      goToPage(safePage - 1);
    }
  };

  return (
    <div className="pager">
     
      <div className="pager-track" ref={trackRef} onScroll={handleScroll}>
        {pages.map((page) => (
          <section className="pager-page" key={page.id} aria-label={page.title}>
            <div className="pager-page-inner">
              {page.shelves.map((shelf, shelfIndex) => (
                <section key={shelf.id} className="deck-shelf-section">
                  <div className="deck-shelf-head">
                    <h2 className="deck-shelf-title">
                      <span className="deck-shelf-number">
                        {String(pageOffset(pages, page.id) + shelfIndex + 1).padStart(2, '0')}
                      </span>
                      {shelf.title}
                    </h2>
                    <span className="deck-shelf-hint">Swipe to explore &rarr;</span>
                  </div>
                  <div className="deck-row">
                    {shelf.hotels.map((hotel) => (
                      <article
                        key={hotel.id}
                        className="deck-card"
                        onClick={() => onOpenHotel(hotel.id)}
                      >
                        <div className="deck-card-media">
                          {hotel.images.length > 0 && (
                            <img
                              className="deck-card-img"
                              src={hotel.images[0].url}
                              alt={hotel.images[0].alt || hotel.name}
                              loading="lazy"
                            />
                          )}
                          <button
                            type="button"
                            className="deck-card-heart"
                            aria-label={savedIds.includes(hotel.id) ? 'Remove from favourites' : 'Save to favourites'}
                            onClick={(event) => {
                              event.stopPropagation();
                              dispatch(toggleFavourite(hotel.id));
                            }}
                          >
                            {savedIds.includes(hotel.id) ? '\u2665' : '\u2661'}
                          </button>
                        </div>
                        <div className="deck-card-body">
                          <span className="deck-card-name">{hotel.name}</span>
                          <span className="deck-card-price">
                            R{(hotel.fromPriceCents / 100).toLocaleString('en-ZA')}
                          </span>
                          <span className="deck-card-meta">{hotel.city}</span>
                          <span className="deck-card-night">/ night</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        ))}
      </div>

     
      <div className="pager-dots" onTouchStart={handleDotsTouchStart} onTouchEnd={handleDotsTouchEnd}>
        <span className="pager-title">{pages[safePage]?.title}</span>
        <div className="pager-dot-row">
          {pages.map((page, index) => (
            <button
              key={page.id}
              type="button"
              className={index === safePage ? 'pager-dot pager-dot-active' : 'pager-dot'}
              aria-label={`Go to ${page.title}`}
              aria-current={index === safePage}
              onClick={() => goToPage(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default DeckPager;
