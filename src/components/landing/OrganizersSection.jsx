import OrganizerCarousel from "../ui/OrganizerCarousel";

const OrganizersSection = () => (
  <section
    id="organizers"
    className="relative w-full bg-[#5CAAE2] py-8 scroll-mt-20"
  >
    <h2
      className="font-[Nowduke] text-white text-center leading-none py-4 md:pt-12 px-6"
      style={{ fontSize: "clamp(2rem, 10vw, 6rem)" }}
    >
      ORGANIZED BY
    </h2>

    {/* Carousel */}
    <OrganizerCarousel />
  </section>
);

export default OrganizersSection;
