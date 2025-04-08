import React, { useState, useRef, useEffect } from 'react';
import { FiArrowRightCircle } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { FaRegQuestionCircle } from 'react-icons/fa';

const partners = [
  {
    name: 'Sadiqa .M',
    image: '/Sadiqa.png',
    origin: 'Iran',
    location: 'Asylum Seeker',
    hobbies: 'Reading, Running, Cooking',
    fieldOfStudy: 'Engineering',
    interest: 'Business & Management',
    description:
      'Sadiqa loves for her students to have fun and get acquainted with a different culture while learning! In her free time, she enjoys spending time with family, writing in her journal.',
  },
  {
    name: 'Atefe Salim',
    image: '/Atefe.png',
    origin: 'Iran',
    location: 'Asylum Seeker',
    hobbies: 'Reading, Running',
    fieldOfStudy: 'Engineering',
    interest: 'Business & Management',
    description:
      'Atefe left her country to save her life and those of her family members. In her free time, she enjoys studying, reading books, listening to music, swimming and dancing and she loves volunteering for others. She is passionate about education and believes in the power of language to transform lives.',
  },
  {
    name: 'Ayran Majer',
    image: '/Ayran.png',
    origin: 'Iran',
    location: 'Asylum Seeker',
    hobbies: 'Reading, Running',
    fieldOfStudy: 'Engineering',
    interest: 'Business & Management',
    description:
      'Aryan possesses a fifteen-year background in teaching Persian literature and language to both native and non-native speakers.',
  },
];

export default function LanguagePartners() {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [overflowMap, setOverflowMap] = useState({});
  const descriptionRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { result } = location.state || {};
  const partners = result?.matches || [
  {
    name: 'Sadiqa .M',
    image: '/Sadiqa.png',
    origin: 'Iran',
    location: 'Asylum Seeker',
    hobbies: 'Reading, Running, Cooking',
    fieldOfStudy: 'Engineering',
    interest: 'Business & Management',
    description:
      'Sadiqa loves for her students to have fun and get acquainted with a different culture while learning! In her free time, she enjoys spending time with family, writing in her journal.',
  },
  {
    name: 'Atefe Salim',
    image: '/Atefe.png',
    origin: 'Iran',
    location: 'Asylum Seeker',
    hobbies: 'Reading, Running',
    fieldOfStudy: 'Engineering',
    interest: 'Business & Management',
    description:
      'Atefe left her country to save her life and those of her family members. In her free time, she enjoys studying, reading books, listening to music, swimming and dancing and she loves volunteering for others. She is passionate about education and believes in the power of language to transform lives.',
  },
  {
    name: 'Ayran Majer',
    image: '/Ayran.png',
    origin: 'Iran',
    location: 'Asylum Seeker',
    hobbies: 'Reading, Running',
    fieldOfStudy: 'Engineering',
    interest: 'Business & Management',
    description:
      'Aryan possesses a fifteen-year background in teaching Persian literature and language to both native and non-native speakers.',
  },
];

useEffect(() => {
  const newOverflowMap = {};
  descriptionRefs.current.forEach((ref, i) => {
    if (ref && ref.scrollHeight > 80) {
      newOverflowMap[i] = true;
    }
  });
  setOverflowMap(newOverflowMap);
}, [partners])

  const toggleShowMore = (index) => {
    setExpandedIndex(prevIndex => (prevIndex === index ? null : index));
  };
if (!partners.length) {
  return (
    <div className="p-10 text-center">
      <h2 className="text-2xl font-bold text-red-600">No matches found</h2>
      <p>Please try again later.</p>
    </div>
  );
}
  return (
    <div className="bg-white p-6 sm:p-6 max-w-5xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold mb-2">Your English Language Partner</h2>
      <p className="text-gray-600 mb-6 text-sm sm:text-base">
        Choose from 3 personalized English Language partners to grow, work, and enjoy your journey! 🌍✨
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 items-stretch">
        {partners.map((partner, index) => (
          <div
            key={index}
            className="rounded-2xl shadow-[0px_4px_25px_rgba(0,0,0,0.07)] border border-gray-200 p-6 flex flex-col bg-white h-full"
          >
            <img
              src={partner.image}
              alt={partner.name}
              className="w-[17em] h-[16em] object-cover rounded-xl mb-3"
            />

            <div className="flex justify-between items-start mb-1">
              <h3 className="text-xl sm:text-2xl font-bold text-[#007451] mb-4">{partner.name}</h3>
              <span className="text-yellow-600 text-xl"><FaRegQuestionCircle size={24} /></span>
            </div>

            <div className="text-xs sm:text-sm text-black font-fellix space-y-[2px]">
              <p className="mb-0"><span className="text-black font-bold">Origin:</span> {partner.origin}</p>
              <p><span className="text-black font-bold">Location:</span> {partner.location}</p>
              <p><span className="text-black font-bold">Hobbies:</span> {partner.hobbies}</p>
              <p><span className="text-black font-bold">Field of Study:</span> {partner.fieldOfStudy}</p>
              <p><span className="text-black font-bold">Interest:</span> {partner.interest}</p>
            </div>

            <button  onClick={() =>
    navigate('/booking', {
      state: {
        schedule: partner.schedule,
        tutorTimeZone: partner.time_zone,
      },
    })
  } className="mt-4 w-full bg-[#7A1D1D] text-white m-0 rounded-[8px] text-sm font-bold flex items-center justify-center gap-2 font-fellix">
              <FaRegCalendarAlt />
              Book Now
            </button>
            
            <div className="flex-grow mt-3 text-xs text-[#474747] leading-relaxed font-fellix">
              <div
                ref={(el) => (descriptionRefs.current[index] = el)}
                className={`transition-all duration-300 ease-in-out whitespace-pre-line ${
                  expandedIndex === index ? '' : 'max-h-[80px] overflow-hidden'
                }`}
              >
                {partner.description}
              </div>

              {overflowMap[index] && (
                <div
                  className="text-[#007451] mt-1 font-semibold cursor-pointer text-sm flex items-center gap-1"
                  onClick={() => toggleShowMore(index)}
                >
                  {expandedIndex === index ? 'Show Less' : 'Show More'}
                  <FiArrowRightCircle className="w-4 h-4 text-[#007451]" />
                </div>
              )}
            </div>

            <div className="mt-10 flex justify-between font-bold bg-[#FbF2F1] rounded-[12px] items-center text-[11px] text-[#283021] pt-2 pr-5 pb-2 pl-5">
              <div>
                <strong className="text-[#6F746A] font-bold font-fellix">Matched Availability:</strong><br />{partner.total_matched_hours} Hours / Week
              </div>
              <div>
                <strong className="text-[#6F746A] font-bold font-fellix">Avg. Match Rate:</strong><br />{partner.total_percentage}%
              </div>
            </div>
          </div>
        ))}
      </div>

      <hr className="mt-10 border-gray-300" />
      <footer className="mt-5 text-[10px] sm:text-xs text-gray-400 flex justify-between items-center flex-wrap gap-y-1">
        <p className="m-0 mb-10">Copyright © 2025, NaTakallam. All rights reserved.</p>
        <div className="mb-10">
          <a href="/terms" className="text-[#424242] outline-none focus:ring-0 focus:outline-none mr-2">Terms</a>|
          <a href="/privacy" className="text-[#424242] outline-none focus:ring-0 focus:outline-none ml-2">Privacy</a>
        </div>
      </footer>
    </div>
  );
}

