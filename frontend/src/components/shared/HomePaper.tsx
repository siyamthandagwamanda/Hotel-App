import { useEffect, useRef } from 'react';
import type { TouchEvent, UIEvent } from 'react';
import type { DeckPageData } from './../../utils/homePageUtils.js';
import { useAppDispatch, useAppSelector } from '../../hooks/storeHooks';
import { setCurrentPage } from '../../slices/journeySlice.js';
import './DeckPager.css';

interface DeckPagerProps {
  pages: DeckPageData[];
  onOpenHotel: (hotelId: number) => void;
}

const DOTS_SWIPE_DISTANCE = 50;

export function DeckPager({ pages, onOpenHotel }: DeckPagerProps) {
  const dispatch = useAppDispatch();
  

  const { currentPage } = useAppSelector((state) => state.journey);

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
              {page.shelves.map((shelf) => (
                <section key={shelf.id} className="deck-shelf-section" style={{ padding: '16px 0' }}>
                  <h2 className="deck-shelf-title" style={{ fontSize: '1.4rem', fontWeight: 800 }}>{shelf.title}</h2>
                  <ul className="deck-hotel-list" style={{ listStyle: 'none', padding: 0 }}>
                    {shelf.hotels.map((hotel) => (
                      <li
                        key={hotel.id}
                        className="deck-hotel-item"
                        onClick={() => onOpenHotel(hotel.id)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '12px',
                          background: '#f9f9f9',
                          marginBottom: '8px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <span><strong>{hotel.name}</strong> — {hotel.city}</span>
                        <span style={{ color: '#0066cc', fontWeight: 700 }}>
                          R{(hotel.fromPriceCents / 100).toLocaleString('en-ZA')}
                        </span>
                      </li>
                    ))}
                  </ul>
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
