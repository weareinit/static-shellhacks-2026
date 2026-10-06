import { useState } from "preact/hooks";
import { asset } from "@utils/assets";
import tabData from "@/data/tabData";
import "../../styles/retroButtons.css";
import { useRef } from "preact/hooks";

function RetroTabButton({ label, active, onClick }) {
  const btnRef = useRef(null);

  const faceEl = () => btnRef.current?.querySelector(".btn");

  const clearState = () => {
    const el = faceEl();
    if (!el) return;
    el.classList.remove("btn-active");
  };

  return (
    <button
      type="button"
      ref={btnRef}
      className={`retro-btn ${active ? "active" : "inactive"}`}
      aria-pressed={active}
      aria-label={label}
      onClick={onClick}
      onPointerDown={(e) => {
        if (e.button !== undefined && e.button !== 0) return;
        faceEl()?.classList.add("btn-active");
      }}
      onPointerUp={clearState}
      onPointerCancel={clearState}
      onMouseLeave={clearState}
    >
      <span className="btn">
        {/* Hit zones: the left/right/center hover tilt is styled via
				    :has() in retroButtons.css - no per-mousemove JS. */}
        <span className="btn-zone btn-zone-left" aria-hidden="true" />
        <span className="btn-zone btn-zone-center" aria-hidden="true" />
        <span className="btn-zone btn-zone-right" aria-hidden="true" />
        <span className="btn-inner">
          <span className="content-wrapper">
            <span className="btn-content">
              <span className="btn-content-inner" label={label} />
            </span>
          </span>
        </span>
      </span>
    </button>
  );
}

const AboutSection = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section
      id="about"
      className="relative isolate overflow-x-hidden bg-landing-red scroll-mt-20"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-[0.15]"
        style={{
          backgroundImage: `url(${asset("/landing/bgtexture.webp")})`,
        }}
        aria-hidden
      />
      <div className="relative z-10">
        <div className="w-full overflow-hidden flex justify-end">
          <h1 className="font-nowduke whitespace-nowrap shrink-0 text-[clamp(2rem,22vw,5rem)] min-[300px]:text-[clamp(4.125rem,22vw,50rem)] sm:text-[clamp(4.125rem,calc((100vw-var(--navbar-desktop-width))*0.22),50rem)] -mt-1.5 md:-mt-5  leading-[0.8] text-right text-landing-bone">
            ABOUT US
          </h1>
        </div>

        <div className="px-4 lg:px-32 pb-8 lg:pb-20 mt-6 lg:mt-10">
          {/* Desktop — lg and up */}
          <div className="hidden lg:flex lg:flex-col lg:items-start lg:gap-10 lg:w-full">
            <div className="flex flex-col items-start gap-10 w-full">
              <div className="overflow-hidden rounded-xl border border-white/30 w-[clamp(14rem,90vw,100vw)] min-[300px]:w-full lg:-mx-12 lg:w-[calc(100%+6rem)] aspect-1400/520">
                <img
                  src={asset(tabData[activeTab].image)}
                  alt={tabData[activeTab].imageAlt}
                  className="w-full h-full object-cover"
                  width={1400}
                  height={520}
                  preserveLayout={true}
                />
              </div>
              <div className="flex flex-row flex-nowrap gap-4 w-full">
                {tabData.map((tab, idx) => (
                  <div key={tab.label} className="flex-1 min-w-0">
                    <RetroTabButton
                      label={tab.label}
                      active={activeTab === idx}
                      onClick={() => setActiveTab(idx)}
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-row items-start gap-10 w-full">
                <div className="font-century text-landing-black grid flex-1 min-w-0 *:col-start-1 *:row-start-1">
                  {tabData.map((tab, idx) => (
                    <div
                      key={tab.label}
                      className={activeTab === idx ? "" : "invisible"}
                      aria-hidden={activeTab !== idx}
                    >
                      {tab.content}
                    </div>
                  ))}
                </div>
                <div className="shrink-0 flex items-start">
                  <img
                    src={asset("/landing/music_player.svg")}
                    alt="ShellHacks section selector"
                    className="h-auto w-[clamp(11rem,32vw,18rem)] min-[300px]:w-[clamp(14rem,22vw,28rem)]"
                    preserveLayout
                    placeholder={false}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile — below lg */}
          <div className="grid grid-rows-[auto_auto_auto] gap-6 lg:hidden">
            <div className="w-full flex justify-center">
              <div className="overflow-hidden rounded-xl border border-white/30 w-[clamp(14rem,90vw,100vw)] min-[300px]:w-full aspect-1400/520">
                <img
                  src={asset(tabData[activeTab].image)}
                  alt={tabData[activeTab].imageAlt}
                  className="w-full h-full object-cover"
                  width={1400}
                  height={520}
                  preserveLayout={true}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {tabData.map((tab, idx) => (
                <RetroTabButton
                  key={tab.label}
                  label={tab.label}
                  active={activeTab === idx}
                  onClick={() => setActiveTab(idx)}
                />
              ))}
            </div>

            <div className="font-century text-landing-black grid *:col-start-1 *:row-start-1">
              {tabData.map((tab, idx) => (
                <div
                  key={tab.label}
                  className={activeTab === idx ? "" : "invisible"}
                  aria-hidden={activeTab !== idx}
                >
                  {tab.content}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
