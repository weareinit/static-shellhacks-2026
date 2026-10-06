import { asset } from "@utils/assets";

const ExperienceSection = () => (
  <section
    id="experience"
    className="relative z-30 w-full overflow-visible bg-landing-black pt-0 pb-0 scroll-mt-20"
  >
    <img
      src={asset("/landing/transition1.svg")}
      alt=""
      className="relative z-20 pt-1 block w-full h-auto m-0 p-0"
      aria-hidden
    />

    <div className="relative flex w-full flex-col items-center overflow-visible pt-[clamp(2rem,2.5vw,2.5rem)]">
      <h2 className="font-nowduke mb-[clamp(1.5rem,4vw,2.5rem)] whitespace-nowrap px-4 py-[clamp(0rem,2vw,2rem)] text-center text-[clamp(0.9375rem,6.5vw,4.5rem)] text-landing-bone">
        THE SHELLHACKS EXPERIENCE
      </h2>

      <div className="relative w-full overflow-visible mb-0 pb-0">
        {/* z-[5] — rainbow; top: mobile -5% → desktop -15% */}
        <div
          className="pointer-events-none absolute left-1/2 top-[clamp(-15%,calc(-5%-0.95vw),-5%)] z-5 w-dvw max-w-none -translate-x-1/2 bg-no-repeat bg-top-left bg-size-[100%_auto] aspect-1440/995"
          style={{
            backgroundImage: `url(${asset("/landing/rainbow.svg")})`,
          }}
          aria-hidden
        />

        {/* TV — aspect matches cropped tv.svg viewBox (1313×842) */}
        <div className="relative z-20 mx-auto mb-0 w-[91%] max-w-3xl pb-0 md:max-w-none">
          <div className="relative isolate aspect-1313/842 w-full">
            <img
              src={asset("/landing/tv.svg")}
              alt=""
              className="pointer-events-none absolute inset-0 z-20 h-full w-full"
              aria-hidden
            />

            <div className="absolute md:left-[5%] md:top-[18%] md:h-[62%] md:w-[71%] left-[2.6%] top-[5.59%] h-[88%] w-[76%] z-30 overflow-hidden rounded-xl">
              <iframe
                className="absolute inset-0 h-full w-full rounded-xl border-0"
                src="https://www.youtube.com/embed/D9vD7bs_aKg?si=5Ly0YHaJkED1xhpX&controls=1&modestbranding=1&rel=0"
                title="ShellHacks Experience"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>

        {/* Robot + arms — same structure; fluid padding/position clamps */}
        <div className="relative m-0 w-full overflow-visible">
          <div className="relative z-50 w-full overflow-visible">
            <img
              src={asset("/landing/robothaflbody.svg")}
              alt=""
              className="block h-auto md:hidden mx-auto w-[clamp(84%,84%,84%)]"
              aria-hidden
            />
            <img
              src={asset("/landing/robot-body-desktop.svg")}
              alt=""
              className="mx-auto hidden h-auto w-full max-w-none origin-center md:block md:w-[clamp(84%,84%,84%)]"
              aria-hidden
            />
          </div>
          <div
            className="clip-x-bleed pointer-events-none absolute inset-0 z-10 overflow-visible"
            aria-hidden
          >
            <img
              src={asset("/landing/robot_right_arm.svg")}
              alt=""
              className="absolute top-[clamp(4%,calc(4%+0.22vw),6%)] right-[clamp(-30vw,calc(-20.3vw-2.8vw),-20.3vw)] md:right-[clamp(-21vw,calc(-20vw-1.2vw),-20vw)] lg:right-[clamp(-23vw,calc(-21.5vw-0.8vw),-21.5vw)] h-auto w-auto origin-top-right scale-[0.35]"
              aria-hidden
            />
            <img
              src={asset("/landing/robot_left_arm.svg")}
              alt=""
              className="absolute top-[7%] left-[clamp(-30vw,calc(-20.3vw-2.8vw),-20.3vw)] md:left-[clamp(-21vw,calc(-20vw-1.2vw),-20vw)] lg:left-[clamp(-23vw,calc(-21.5vw-0.8vw),-21.5vw)] h-auto w-auto origin-top-left scale-[0.35]"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ExperienceSection;
