import { DISCORD_INVITE_URL } from "@/constants/links";
import { asset } from "@utils/assets";

const PRIVACY_POLICY_URL = asset("/privacy");

export default function Footer() {
  return (
    <footer className="pt-8 bg-landing-blue">
      <div className="mx-auto max-w-7xl grid grid-cols-[auto_auto] justify-between gap-x-4 md:gap-x-10 gap-y-4 px-[clamp(0.75rem,6.25vw,5rem)]">
        {/* Left column - name + subtitle */}
        <div className="flex flex-col">
          <h2
            className="text-landing-bone text-5xl md:text-7xl leading-12 md:leading-15 uppercase tracking-normal"
            style={{ fontFamily: "Nowduke, Poppins, sans-serif" }}
          >
            Shell
            <br />
            Hacks
          </h2>
          <p
            className="text-landing-gold mt-1 text-sm md:text-base opacity-90 max-w-40 md:max-w-none"
            style={{
              fontFamily: "Century Gothic, Poppins, sans-serif",
              fontWeight: 700,
            }}
          >
            Florida's Largest Hackathon
          </p>
        </div>

        {/* Right column - social icons + robots */}
        <div className="flex flex-col items-end justify-between gap-6 min-w-0 justify-self-end">
          <div className="flex space-x-2">
            <a
              href="https://www.linkedin.com/company/init-fiu/posts/?feedView=all"
              target="_blank"
              rel="noreferrer"
              className="hover:opacity-80 transition-opacity shrink-0"
              aria-label="LinkedIn"
            >
              <img
                src="/icons/LinkedIn.svg"
                alt="LinkedIn"
                className="w-7 h-7 object-contain"
              />
            </a>

            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:opacity-80 transition-opacity shrink-0"
              aria-label="Discord"
            >
              <img
                src="/icons/Discord.svg"
                alt="Discord"
                className="w-7 h-7 object-contain"
              />
            </a>

            <a
              href="https://www.instagram.com/init.fiu/"
              target="_blank"
              rel="noreferrer"
              className="hover:opacity-80 transition-opacity shrink-0"
              aria-label="Instagram"
            >
              <img
                src="/icons/Instagram.svg"
                alt="Instagram"
                className="w-7 h-7 object-contain"
              />
            </a>
          </div>

          {/* Robots dip into the white strip below; the offset + z-20 keep them
              on top of the strip (which is z-10) without moving anything else. */}
          <div className="relative z-20 flex items-end justify-end max-w-full -space-x-2 xs:space-x-2 translate-y-8">
            <img
              src={asset("/robots/robot1.svg")}
              alt="Robot 1"
              className="h-16 xxs:h-20 w-auto"
            />
            <img
              src={asset("/robots/robot2.svg")}
              alt="Robot 2"
              className="h-16 xxs:h-20 w-auto"
            />
            <img
              src={asset("/robots/robot3.svg")}
              alt="Robot 3"
              className="h-16 xxs:h-20 w-auto"
            />
          </div>
        </div>
      </div>
      {/* required links */}
      <div
        className="relative w-full z-20 mt-4.5 bg-landing-bone text-center py-1.5"
        style={{
          fontFamily: "Century Gothic, Poppins, sans-serif",
          fontWeight: 600,
        }}
      >
        <div className="grid grid-cols-2 justify-items-center gap-x-6 gap-y-2 md:flex md:flex-row justify-center items-center text-sm">
          <a
            href={PRIVACY_POLICY_URL}
            className="text-black underline underline-offset-4 hover:text-[#1b1440] transition-colors"
          >
            ShellHacks Terms
          </a>
          <a
            href="https://static.mlh.io/docs/mlh-code-of-conduct.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black underline underline-offset-4 hover:text-[#1b1440] transition-colors"
          >
            MLH Code of Conduct
          </a>
          <a
            href="https://github.com/MLH/mlh-policies/blob/main/contest-terms.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black underline underline-offset-4 hover:text-[#1b1440] transition-colors"
          >
            MLH Contest Terms
          </a>
          <a
            href="https://mlh.io/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black underline underline-offset-4 hover:text-[#1b1440] transition-colors"
          >
            MLH Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
