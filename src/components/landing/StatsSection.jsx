import { asset } from "@utils/assets";

const StatsSection = () => (
  <section
    id="stats"
    className="bg-landing-bone relative w-full aspect-9947/7220 overflow-hidden scroll-mt-20"
  >
    {/* Background tape image */}
    <img
      src={asset("/landing/about_tape.svg")}
      alt="About Us - Tape"
      aria-hidden="true"
      className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[calc(70%*759/703)] object-cover pointer-events-none select-none"
    />

    {/* Stats grid */}
    <div className="font-semibold font-century text-landing-black text-[4vw] absolute z-10 top-[32.4%] bottom-[31.4%] left-[46%] right-[6.5%] grid grid-cols-2 gap-x-[13.5%] place-items-center text-center leading-none">
      <div className="flex flex-col gap-[0.95vw]">
        <span>230+</span>
        <span>PROJECTS</span>
      </div>
      <div className="flex flex-col gap-[0.95vw]">
        <span>1400+</span>
        <span>HACKERS</span>
      </div>
      <div className="flex flex-col gap-[0.95vw]">
        <span>40+</span>
        <span>SPONSORS</span>
      </div>
      <div className="flex flex-col gap-[0.95vw]">
        <span>$20,000</span>
        <span>IN PRIZES</span>
      </div>
    </div>
  </section>
);

export default StatsSection;
