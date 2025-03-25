import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import quotesImg from '/testimonials-quotes.png';

const testimonials = [
  {
    image: "/path-to-image.jpg", // Update with correct image path
    quote:
      "NaTakallam has given me the priceless opportunity to have a wonderful Syrian conversation partner it's a bridge to culture and connection.",
    name: "Valentina",
    country: "USA",
    role: "Founder, Catalog",
    language: "Arabic",
    rating: 5,
  },
  {
    image: "/path-to-image.jpg", // Update with correct image path
    quote:
      "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    name: "Valentina",
    country: "USA",
    role: "Founder, Catalog",
    language: "Arabic",
    rating: 5,
  },
  {
    image: "/path-to-image.jpg", // Update with correct image path
    quote:
      "NaTakallam has given me the priceless opportunity to have a wonderful Syrian conversation partner it's a bridge to culture and connection.",
    name: "Valentina",
    country: "USA",
    role: "Founder, Catalog",
    language: "Arabic",
    rating: 5,
  },
];

export default function TestimonialComponent() {
  const [index, setIndex] = useState(0);
  const { image, quote, name, country, role, language, rating } = testimonials[index];

  const prevTestimonial = () => {
    setIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const nextTestimonial = () => {
    setIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-1/2 flex justify-center items-end pb-16 bg-white px-10 testimonials">
      <div className="max-w-md mx-auto p-4 bg-secondary rounded-2xl shadow-lg relative">
        
        {/* Text and Quote Content */}
        <div className="p-6 text-white rounded-b-2xl relative">
          <div className="absolute -top-12 left-4 text-green-700 text-4xl">
            <img className="quotes-img" src={quotesImg} />
          </div>
          <p className="text-white italic">{quote}</p>
          <h3 className="font-bold text-lg mt-5">{name}, {country}</h3>
          <p className="text-sm text-white opacity-75">{role}</p>
          <p className="text-sm text-white opacity-75">{language}</p>
        </div>

        {/* Stars and Carousel Buttons */}
        <div className="absolute bottom-4 right-4 flex flex-col items-end">
          <div className="flex items-center justify-end mt-2">
            {Array.from({ length: rating }).map((_, i) => (
              <span key={i} className="text-yellow-400 text-xl">★</span>
            ))}
          </div>

          <div className="flex space-x-2 mt-2">
            <button
              onClick={prevTestimonial}
              className="p-2 rounded-full bg-white text-green-700 shadow"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextTestimonial}
              className="p-2 rounded-full bg-white text-green-700 shadow"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}