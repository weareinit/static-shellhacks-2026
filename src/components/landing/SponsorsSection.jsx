import { useEffect, useRef, useState } from "preact/hooks";
import { asset } from "@utils/assets";
import { sponsorsData } from "@/data/sponsorsData";
import PartnersSection from "./PartnersSection";

const FEATURED_SPONSOR_NAME = "FIU_SGA";

const SponsorLogo = ({
  sponsor,
  heightClassName = "h-[clamp(2rem,5vw,5.5rem)]",
}) => (
  <a
    href={sponsor.url}
    target="_blank"
    rel="noopener noreferrer"
    className={`flex items-center justify-center w-full ${heightClassName}`}
  >
    <img
      src={asset(`/sponsors/${sponsor.name}.webp`)}
      alt={sponsor.name}
      className="w-full h-full object-contain object-center"
      loading="lazy"
      onError={(e) => {
        if (!e.target.dataset.fallbackAttempted) {
          e.target.dataset.fallbackAttempted = "true";
          e.target.src = asset(`/sponsors/${sponsor.name}.webp`);
        }
      }}
    />
  </a>
);

const SponsorsSection = () => {
  const sectionRef = useRef(null);
  const [sponsorInView, setSponsorInView] = useState(false);
  const featuredSponsor = sponsorsData.find(
    (sponsor) => sponsor.name === FEATURED_SPONSOR_NAME,
  );
  const remainingSponsors = sponsorsData.filter(
    (sponsor) => sponsor.name !== FEATURED_SPONSOR_NAME,
  );

  // Pause the robot sway / banner animations while this section is offscreen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setSponsorInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => setSponsorInView(entry.isIntersecting),
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`sponsor-fly-scope ${sponsorInView ? "sponsor-inview" : ""} relative w-full pt-[16vw] pb-[10vw] overflow-clip border-b scroll-mt-20 bg-landing-black`}
      id="sponsors"
    >
      {/* Worn overlay */}
      <div aria-hidden="true" className="hero-wear hero-wear-distressed" />
      {/* Top banner */}
      <img
        src={asset("/landing/sponsor_banner_top.svg")}
        alt=""
        className="sponsor-banner-fly absolute -top-2 left-0 pointer-events-none w-full z-[21]"
      />

      {/* Left robot */}
      <div className="absolute left-0 translate-x-[-35%] md:translate-x-[-40%] w-[clamp(4.6rem,17vw,30rem)] pointer-events-none top-[25vw] md:top-[20vw] z-[21]">
        <img
          src={asset("/landing/sponsor_robot_left.webp")}
          alt=""
          className="sponsor-robot-hang sponsor-robot-hang-left w-full h-auto block"
        />
      </div>
      {/* Right robot */}
      <div className="absolute right-0 translate-x-[30%] sm:translate-x-[20%] w-[clamp(4.6rem,17vw,30rem)] pointer-events-none bottom-[5%] z-[21]">
        <img
          src={asset("/landing/sponsor_robot_right.webp")}
          alt=""
          className="sponsor-robot-hang sponsor-robot-hang-right w-full h-auto block"
        />
      </div>

      <div className="container mx-auto relative">
        <div className="flex justify-center">
          <h2 className="text-center py-2 whitespace-nowrap font-nowduke text-bone text-shadow-md text-shadow-white leading-none text-[clamp(2.6rem,8.8vw,20rem)]">
            SPONSORED BY
          </h2>
        </div>

        {featuredSponsor && (
          <div className="flex justify-center w-full max-w-[80vw] md:max-w-[70vw] mx-auto mt-[2vw]">
            <div className="flex items-center justify-center">
              <SponsorLogo
                sponsor={featuredSponsor}
                heightClassName="h-[clamp(3rem,7vw,9rem)]"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-[6vw] w-full max-w-[75vw] md:max-w-[60vw] mx-auto mt-[2vw] justify-items-center">
          {remainingSponsors.map((sponsor) => (
            <div
              key={sponsor.name}
              className="flex items-center justify-center"
            >
              <SponsorLogo sponsor={sponsor} />
            </div>
          ))}
        </div>
        <PartnersSection />
      </div>
      {/* Light sepia wash above everything in the section */}
      <div aria-hidden="true" className="section-sepia" />
    </section>
  );
};

export default SponsorsSection;
