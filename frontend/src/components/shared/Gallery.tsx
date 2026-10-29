import { useRef, useState } from 'react';
import type { TouchEvent } from 'react';

interface GalleryImage {
  url: string;
  alt: string;
}

interface GalleryProps {
  images: GalleryImage[];
}

const SWIPE_DISTANCE = 50;

export function Gallery({ images }: GalleryProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(0);

  if (images.length === 0) {
    return <div className="gallery gallery-empty" />;
  }

  const lastIndex = images.length - 1;

  function showNext() {
    setIndex(index === lastIndex ? 0 : index + 1);
  }

  function showPrevious() {
    setIndex(index === 0 ? lastIndex : index - 1);
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    if (deltaX < -SWIPE_DISTANCE) {
      showNext();
    } else if (deltaX > SWIPE_DISTANCE) {
      showPrevious();
    }
  }

  const current = images[index];

  return (
    <div className="gallery" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <img className="gallery-img" src={current.url} alt={current.alt} />

      {images.length > 1 && (
        <>
          <button type="button" className="gallery-arrow gallery-arrow-left" aria-label="Previous photo" onClick={showPrevious}>
            &lsaquo;
          </button>
          <button type="button" className="gallery-arrow gallery-arrow-right" aria-label="Next photo" onClick={showNext}>
            &rsaquo;
          </button>
        </>
      )}

      <span className="gallery-count" aria-live="polite">
        {index + 1} / {images.length}
      </span>
    </div>
  );
}

export default Gallery;