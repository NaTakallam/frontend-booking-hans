import React, { useState }  from 'react';
import './levelForm.css';
import Select from 'react-select';
import { useFormData } from "./FormDataContext";

const levels = [
  {
    label: 'A1',
    title: 'Beginner',
    description: 'I can understand basic words and phrases.',
    icon: '/rocket-Emoji.png',
  },
  {
    label: 'A2',
    title: 'Upper Beginner',
    description: 'I can use simple expressions.',
    icon: '/rocket-Emoji.png',
  },
  {
    label: 'B1',
    title: 'Intermediate',
    description: 'I can deal with everyday situations.',
    icon: '/rocket-Emoji.png',
  },
  {
    label: 'B2',
    title: 'Upper Intermediate',
    description: 'I can interact fluently with native speakers.',
    icon: '/rocket-Emoji.png',
  },
  {
    label: 'C1',
    title: 'Advanced',
    description: 'I can use language effectively and flexibly.',
    icon: '/rocket-Emoji.png',
  },
];

const languageOptions = [
  { value: 'English', label: 'English' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Arabic - Levantine', label: 'Arabic - Levantine' },
  { value: 'Arabic - Lebanese', label: 'Arabic - Lebanese' },
  { value: 'Persian - Farsi', label: 'Persian - Farsi' },
  { value: 'Russian', label: 'Russian' },
  { value: 'Ukrainian', label: 'Ukrainian' },
  { value: 'French', label: 'French' },
  { value: 'Persian - Dari', label: 'Persian - Dari' },
];
const LevelForm = () => {
  const { formData, setFormData } = useFormData();
  const currentIndex = levels.findIndex((level) => level.title === formData.level);
  const value = currentIndex === -1 ? 1 : currentIndex;
  const selected = levels[value];
  const [selectedLanguage, setSelectedLanguage] = useState(languageOptions[0].value);

  const handleChange = (e) => {
    const newIndex = Number(e.target.value);
    const newLevel = levels[newIndex].title;
    setFormData((prev) => ({ ...prev, level: newLevel }));
  };

 const handleLanguageChange = (option) => {
    setSelectedLanguage(option.value);
    setFormData((prev) => ({ ...prev, target_language: option.value }));
  };
  return (
    <div className="slider-container">
     <label className="slider-label mb-1 text-sm font-medium text-gray-700">
        Choose the language
      </label>
    <Select
          options={languageOptions}
          value={languageOptions.find((lang) => lang.value === selectedLanguage)}
          onChange={handleLanguageChange}
          className="z-50"
          menuPortalTarget={document.body}
          menuPosition="fixed"
          styles={{
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            control: (base) => ({
              ...base,
              borderColor: '#D1D5DB',
              color: 'black',
            }),
            singleValue: (base) => ({ ...base, color: 'black' }),
          }}
        />
      <label className="slider-label">Please select your level</label>

      <div className="slider-wrapper">
        <div className="slider-track">
          <div
            className="slider-progress"
            style={{ width: `${(value / (levels.length - 1)) * 100}%` }}
          />
          <div className="slider-dots">
            {levels.map((_, index) => (
              <span
                key={index}
                className="dot"
                style={{
                  left: `calc(${(index / (levels.length - 1)) * 100}% - 3px)`
                }}
              />
            ))}
          </div>
        </div>
        <input
          type="range"
          min="0"
          max={levels.length - 1}
          value={value}
          onChange={handleChange}
          className="level-slider"
        />
      </div>

      <div className="slider-labels">
        {levels.map((level, index) => (
          <span
            key={index}
            className={`slider-level ${value === index ? 'active' : ''}`}
          >
            {level.label}
          </span>
        ))}
      </div>

      <div className="slider-info-box">
        <img src={selected.icon} alt="icon" className="info-icon" />
        <div className="info-text">
          <div className="info-title">{selected.title}</div>
          <div className="info-desc">{selected.description}</div>
        </div>
      </div>
    </div>
  );
};

export default LevelForm;
