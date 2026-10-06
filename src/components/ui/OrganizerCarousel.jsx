import { useState, useEffect, useRef } from "preact/hooks";
import { organizers } from "@/data/organizerData";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { asset } from "@utils/assets";

const SLIDE_DURATION_MS = 4000;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

function OrganizerFrame({ organizer }) {
  return (
    <a
      href={organizer.linkedinUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${organizer.name} on LinkedIn`}
      className="organizer-frame group"
    >
      <div className="organizer-frame-inner">
        <div className="organizer-frame-title">{organizer.name}</div>
        <div className="organizer-frame-photo">
          <img
            src={asset(organizer.image)}
            alt={organizer.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="eager"
            decoding="async"
          />
        </div>
        <div className="organizer-frame-footer">
          <span className="organizer-frame-linkedin" aria-hidden="true">
            in
          </span>
          <div className="organizer-frame-copy">
            <span className="organizer-frame-role">{organizer.role}</span>
          </div>
        </div>
      </div>
      <div className="organizer-frame-notch" aria-hidden="true" />
    </a>
  );
}

export default function OrganizerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [screenSize, setScreenSize] = useState("small");
  const [isPaused, setIsPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const rootRef = useRef(null);
  const totalSlidesRef = useRef(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize("small");
      } else if (width < 1280) {
        setScreenSize("medium");
      } else {
        setScreenSize("large");
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const getItemsPerSlide = () => {
    switch (screenSize) {
      case "small":
        return 4;
      case "medium":
        return 3;
      case "large":
        return 3;
      default:
        return 4;
    }
  };

  const itemsPerSlide = getItemsPerSlide();
  const totalSlides = Math.ceil(organizers.length / itemsPerSlide);
  totalSlidesRef.current = totalSlides;

  const getCurrentSlideOrganizers = () => {
    const startIndex = currentIndex * itemsPerSlide;
    const endIndex = Math.min(startIndex + itemsPerSlide, organizers.length);
    const slice = organizers.slice(startIndex, endIndex);
    while (slice.length < itemsPerSlide) slice.push(null);
    return slice;
  };

  const goToSlide = (direction) => {
    if (!isPaused) {
      setIsPaused(true);
    }
    setCurrentIndex((prev) => {
      const total = totalSlidesRef.current;
      return direction === "next"
        ? (prev + 1) % total
        : (prev - 1 + total) % total;
    });
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  // Only run the auto-advance + progress animation while the carousel is on
  // screen, not paused, and motion is not reduced. A plain setTimeout is cheap
  // and compositor-friendly (no per-frame rAF writes).
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "150px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (isPaused || reducedMotion || !inView) return;
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlidesRef.current);
    }, SLIDE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [currentIndex, isPaused, reducedMotion, inView, totalSlides]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [screenSize]);

  // Prefetch the next slide's images so arrow/auto advances feel instant
  useEffect(() => {
    const nextIndex = (currentIndex + 1) % totalSlides;
    const start = nextIndex * itemsPerSlide;
    const end = Math.min(start + itemsPerSlide, organizers.length);
    for (let i = start; i < end; i++) {
      const img = new Image();
      img.src = asset(organizers[i].image);
    }
  }, [currentIndex, itemsPerSlide, totalSlides]);

  const progressRunning = inView && !isPaused && !reducedMotion;

  return (
    <div
      ref={rootRef}
      className="relative overflow-hidden w-full bg-[#5CAAE2] px-2 pb-6"
    >
      <div className="relative w-full max-w-7xl mx-auto">
        <div className="px-2 sm:px-10 lg:px-12 py-2 sm:py-4 lg:py-6">
          <div
            className={`grid gap-3 sm:gap-4 lg:gap-6 ${
              screenSize === "small"
                ? "grid-cols-2"
                : screenSize === "medium"
                  ? "grid-cols-3"
                  : "grid-cols-3"
            }`}
          >
            {getCurrentSlideOrganizers().map((organizer, index) => (
              <div
                key={organizer ? organizer.name : `empty-${index}`}
                className="w-full"
                style={{ aspectRatio: "410 / 434" }}
              >
                {organizer && <OrganizerFrame organizer={organizer} />}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1 px-2 sm:px-14 lg:px-16 pb-4 sm:pb-6">
          {/* Progress bar: scaleX CSS animation (compositor-thread), restarted
              per slide via key. No per-frame JS. */}
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              key={progressRunning ? currentIndex : "stopped"}
              className={`h-full bg-white rounded-full ${progressRunning ? "w-full" : "w-0"}`}
              style={
                progressRunning
                  ? {
                      transformOrigin: "left center",
                      animation: `slide-progress-scale ${SLIDE_DURATION_MS}ms linear forwards`,
                    }
                  : undefined
              }
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => goToSlide("prev")}
              aria-label="Previous organizers"
              className="shrink-0 text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft
                className="w-8 h-8 sm:w-12 sm:h-12"
                strokeWidth={2.5}
              />
            </button>

            <button
              type="button"
              onClick={togglePause}
              aria-label={
                isPaused ? "Resume auto-advance" : "Pause auto-advance"
              }
              className="shrink-0 text-white/60 hover:text-white transition-colors"
            >
              {isPaused ? (
                <Play className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2.5} />
              ) : (
                <Pause className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2.5} />
              )}
            </button>

            <div className="flex-1 h-5 sm:h-8 bg-transparent border-2 border-white/60 rounded-md relative overflow-hidden px-2 py-0.5">
              <div className="relative h-full overflow-hidden">
                <div
                  className="absolute inset-y-0 flex items-center justify-center gap-1 sm:gap-1.5"
                  style={{
                    left: `${(currentIndex / totalSlides) * 100}%`,
                    width: `${100 / totalSlides}%`,
                  }}
                >
                  <div className="w-2 sm:w-3 h-3 sm:h-4 bg-white/70" />
                  <div className="w-2 sm:w-3 h-3 sm:h-4 bg-white/70" />
                  <div className="w-2 sm:w-3 h-3 sm:h-4 bg-white/70" />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => goToSlide("next")}
              aria-label="Next organizers"
              className="shrink-0 text-white/60 hover:text-white transition-colors"
            >
              <ChevronRight
                className="w-8 h-8 sm:w-12 sm:h-12"
                strokeWidth={2.5}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
