import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { asset } from "@utils/assets";
import CheckerboardDivider from "./CheckerboardDivider";

// Example categories
const categories = [
  { label: "GENERAL", value: "general" },
  { label: "EVENT DETAILS", value: "event" },
  { label: "LOGISTICS", value: "logistics" },
  { label: "SPONSORS/​VOLUNTEERS", value: "sponsors" },
];

const FAQ = ({ items = [] }) => {
  // Track selected category
  const [selected, setSelected] = useState(categories[0].value);
  const [openIndex, setOpenIndex] = useState(null);

  // Filter items by category (assuming each item has a 'category' field)
  const filteredItems = items.filter((faq) => faq.category === selected);

  const handleCategoryChange = (value) => {
    setSelected(value);
    setOpenIndex(null);
  };

  const handleToggle = (idx) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div
      style={{ backgroundColor: "#FFDC5E" }}
      className="faq-fall-scope relative z-0 w-full overflow-hidden"
    >
      <div className="w-full h-full">
        {/* Mobile layout */}
        <div className="flex flex-col md:hidden items-center px-4 py-12">
          <h2
            style={{
              fontFamily: "'Nowduke', sans-serif",
              color: "#D80813",
              lineHeight: 1,
              letterSpacing: 0,
            }}
            className="text-[28vw] text-center mb-4"
          >
            FAQ
          </h2>

          <div className="grid grid-cols-2 gap-3 w-full mb-8">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                style={{
                  fontFamily: "'Century Gothic', sans-serif",
                  backgroundColor:
                    selected === cat.value ? "#1a1a1a" : "transparent",
                  color: selected === cat.value ? "#ffffff" : "#1a1a1a",
                  border: "2px solid #1a1a1a",
                  borderRadius: "8px",
                }}
                className="py-3 text-base font-bold tracking-wide transition-colors leading-tight whitespace-normal wrap-break-word"
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="w-full min-h-[31vh]">
            {filteredItems.length > 0 ? (
              filteredItems.map((faq, idx) => (
                <FAQItem
                  key={idx}
                  question={faq.question}
                  answer={faq.answer}
                  isLast={idx === filteredItems.length - 1}
                  isOpen={openIndex === idx}
                  onToggle={() => handleToggle(idx)}
                />
              ))
            ) : (
              <p
                style={{ fontFamily: "'Poppins', sans-serif" }}
                className="text-center"
              >
                No FAQs available.
              </p>
            )}
          </div>
        </div>

        {/* Desktop layout */}
        <div
          className="hidden md:grid w-full items-start"
          style={{ gridTemplateColumns: "35% 65%" }}
        >
          {/* Left: phone illustration */}
          <div className="flex items-start justify-end pt-2 -mr-10">
            <img
              src={asset("/landing/faq-phone.svg")}
              alt="Retro phone"
              className="w-full h-auto max-w-117.5"
              style={{
                transform: "rotate(-4.36deg)",
                transformOrigin: "top center",
              }}
            />
          </div>

          {/* Right: FAQ title + accordion */}
          <div className="flex flex-col justify-center py-12 px-12 items-stretch">
            <h2
              style={{
                fontFamily: "'Nowduke', sans-serif",
                color: "#D80813",
                lineHeight: 1,
                letterSpacing: 0,
                fontSize: "clamp(7rem, 22vw, 25rem)",
                textAlign: "center",
              }}
              className="w-full"
            >
              FAQ
            </h2>

            <div className="w-full lg:w-4/5 lg:mx-auto grid grid-cols-2 gap-2 mb-2">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    backgroundColor:
                      selected === cat.value ? "#1a1a1a" : "transparent",
                    color: selected === cat.value ? "#ffffff" : "#1a1a1a",
                    border: "1px solid #1a1a1a",
                    borderRadius: "8px",
                  }}
                  className="px-4 py-3 text-sm font-bold tracking-wide transition-colors"
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="w-full lg:w-4/5 lg:mx-auto mt-8 min-h-[38vh]">
              {filteredItems.length > 0 ? (
                filteredItems.map((faq, idx) => (
                  <FAQItem
                    key={idx}
                    question={faq.question}
                    answer={faq.answer}
                    isLast={idx === filteredItems.length - 1}
                    isOpen={openIndex === idx}
                    onToggle={() => handleToggle(idx)}
                  />
                ))
              ) : (
                <p
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                  className="text-center"
                >
                  No FAQs available.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <CheckerboardDivider />
    </div>
  );
};

const FAQItem = ({ question, answer, isLast, isOpen, onToggle }) => {
  return (
    <div>
      <div className="border-t md:border-t-[1.5px] border-black" />
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex justify-between items-center py-2 px-2 text-left"
      >
        <span
          style={{
            fontFamily: "'Poppins', sans-serif",
            color: "#1a1a1a",
            fontSize: "clamp(1rem, 1.5vw, 1.5rem)",
            fontWeight: 400,
            lineHeight: 1,
          }}
          className="pr-4"
        >
          {question}
        </span>
        <span className="shrink-0">
          {isOpen ? (
            <Minus
              className="w-5 h-5 md:w-7 md:h-7"
              stroke="#1a1a1a"
              strokeWidth={0.75}
            />
          ) : (
            <Plus
              className="w-5 h-5 md:w-7 md:h-7"
              stroke="#1a1a1a"
              strokeWidth={0.75}
            />
          )}
        </span>
      </button>
      <div
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
        className="grid transition-[grid-template-rows] duration-500 ease-in-out"
      >
        <div className="overflow-hidden">
          <div
            style={{
              fontFamily: "'Poppins', sans-serif",
              color: "#1a1a1a",
              fontSize: "clamp(0.75rem, 1.2vw, 1.2rem)",
            }}
            className="pb-4 px-2"
          >
            {answer}
          </div>
        </div>
      </div>
      {isLast && <div className="border-t  md:border-t-[1.5px] border-black" />}
    </div>
  );
};

export default FAQ;
