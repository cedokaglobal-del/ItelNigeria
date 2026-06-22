import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ImageCarousel({
  images,
  alt,
  className = "",
  hero,
}: {
  images: string[];
  alt: string;
  className?: string;
  /** Renders a React node as the first slide — useful for composite product showcases */
  hero?: ReactNode;
}) {
  const total = images.length + (hero ? 1 : 0);
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const touchX = useRef(0);

  const startTimer = useCallback(() => {
    stopTimer();
    if (total > 1) {
      timerRef.current = setInterval(() => {
        setIdx((prev) => (prev + 1) % total);
      }, 4000);
    }
  }, [total]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    startTimer();
    return stopTimer;
  }, [startTimer, stopTimer]);

  function go(i: number) {
    setIdx(((i % total) + total) % total);
    startTimer();
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) {
      go(idx + (dx < 0 ? 1 : -1));
    }
  }

  return (
    <div
      className={`group relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-accent md:aspect-[8/5] ${className}`}
      onMouseEnter={stopTimer}
      onMouseLeave={startTimer}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Hero slide (index 0) */}
      {hero && (
        <div
          className={`pointer-events-none absolute inset-0 select-none transition-opacity duration-500 ${
            idx === 0 ? "opacity-100" : "opacity-0"
          }`}
        >
          {hero}
        </div>
      )}

      {/* Image slides (index 1..n when hero exists, 0..n when no hero) */}
      {images.map((src, i) => {
        const slideIdx = hero ? i + 1 : i;
        return (
          <img
            key={i}
            src={src}
            alt={`${alt} — ${i + 1}`}
            loading={i === 0 && !hero ? "eager" : "lazy"}
            draggable={false}
            className={`pointer-events-none absolute inset-0 h-full w-full select-none object-cover transition-opacity duration-500 ${
              slideIdx === idx ? "opacity-100" : "opacity-0"
            }`}
          />
        );
      })}

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              go(idx - 1);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm transition-all hover:bg-black/60 hover:scale-110 active:scale-95 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              go(idx + 1);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm transition-all hover:bg-black/60 hover:scale-110 active:scale-95 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  go(i);
                }}
                className={`rounded-full transition-all ${
                  i === idx ? "w-6 bg-white shadow-sm" : "w-1.5 bg-white/60 hover:bg-white/80"
                } h-1.5`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
