import { asset } from "@utils/assets";
import { partnersData } from "@/data/partnersData";

export default function PartnersSection() {
  return (
    <section id="partners" className="mt-[6vw] scroll-mt-20">
      <div className="flex justify-center">
        <h2 className="text-center py-2 whitespace-nowrap font-nowduke text-landing-bone text-shadow-md text-shadow-white leading-none text-[clamp(2.6rem,8.8vw,20rem)]">
          PARTNERS
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-[6vw] w-full max-w-[75vw] md:max-w-[60vw] mx-auto mt-[2vw] justify-items-center">
        {partnersData.map((partner) => (
          <div key={partner.name} className="flex items-center justify-center">
            <a
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full h-[clamp(2rem,5vw,5.5rem)]"
            >
              <img
                src={asset(`/partners/${partner.name}.webp`)}
                alt={partner.name}
                className="w-full h-full object-contain object-center"
                loading="lazy"
                onError={(e) => {
                  if (!e.target.dataset.fallbackAttempted) {
                    e.target.dataset.fallbackAttempted = "true";
                    e.target.src = asset(`/partners/${partner.name}.webp`);
                  }
                }}
              />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
