import FAQ from "../ui/FAQ";
import faqData from "@/data/faqData";

const FAQSection = () => (
  <section id="faq" className="relative z-10 bg-background scroll-mt-20">
    <FAQ items={faqData} />
  </section>
);

export default FAQSection;
