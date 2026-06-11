import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ImageCarousel({ images, alt, className = "" }: { images: string[]; alt: string; className?: string }) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const touchX = useRef(0);

  const startTimer = useCallback(() => {
    stopTimer();
    if (images.length > 1) {
      timerRef.current = setInterval(() => {
        setIdx((prev) => (prev + 1) % images.length);
      }, 3000);
    }
  }, [images.length]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    startTimer();
    return stopTimer;
  }, [startTimer, stopTimer]);

  function go(i: number) {
    setIdx(((i % images.length) + images.length) % images.length);
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
      className={`group relative aspect-[8/5] w-full overflow-hidden rounded-xl bg-accent ${className}`}
      onMouseEnter={stopTimer}
      onMouseLeave={startTimer}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {images.map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`${alt} — ${i + 1}`}
          loading={i === 0 ? "eager" : "lazy"}
          draggable={false}
          className={`pointer-events-none absolute inset-0 h-full w-full select-none object-cover transition-opacity duration-500 ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); go(idx - 1); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm transition-all hover:bg-black/60 hover:scale-110 active:scale-95 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); go(idx + 1); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm transition-all hover:bg-black/60 hover:scale-110 active:scale-95 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); go(i); }}
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
