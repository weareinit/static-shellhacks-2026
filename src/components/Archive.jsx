import "@/styles/globals.css";
import HeroSection from "./landing/HeroSection";
import StatsSection from "./landing/StatsSection";
import AboutSection from "./landing/AboutSection";
import ExperienceSection from "./landing/ExperienceSection";
import FaqSection from "./landing/FaqSection";
import OrganizersSection from "./landing/OrganizersSection";
import SponsorsSection from "./landing/SponsorsSection";
import Footer from "./ui/Footer";
import ArcadeLauncher from "./arcade/ArcadeLauncher";

/**
 * The archived landing page.
 *
 * Section order is identical to the live app's Landing.jsx. The differences
 * are all deliberate removals, and the diff against that file is the best
 * description of what the archive is:
 *
 *   - no QueryClientProvider, useRegistrationStatus, useIsEOL,
 *     useRegistrationOpen: the archive makes zero API calls. The hero's CTA
 *     used to be derived from those and is now a frozen EOL label.
 *   - no ClientApp wrapper and therefore no html.has-app-navbar, so no
 *     `app-main` gutter is reserved on either side of the viewport.
 *   - ArcadeLauncher is new: the FAQ's checkerboard used to open Pixel Drop
 *     directly. Both games now live behind one launcher.
 */
export default function Archive() {
  return (
    <div className="overflow-clip">
      <HeroSection />
      <div className="min-h-dvh w-full relative">
        <StatsSection />
        <AboutSection />
        <ExperienceSection />
        <FaqSection />
        <OrganizersSection />
        <SponsorsSection />
        <Footer />
      </div>
      <ArcadeLauncher />
    </div>
  );
}
