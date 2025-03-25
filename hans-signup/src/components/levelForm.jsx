import React from 'react';
import './levelForm.css';
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

const LevelForm = () => {
  const { formData, setFormData } = useFormData();
  const currentIndex = levels.findIndex((level) => level.title === formData.level);
  const value = currentIndex === -1 ? 1 : currentIndex;
  const selected = levels[value];

  const handleChange = (e) => {
    const newIndex = Number(e.target.value);
    const newLevel = levels[newIndex].title;
    setFormData((prev) => ({ ...prev, level: newLevel }));
  };

  return (
    <div className="slider-container">
      <label className="slider-label">Please select your English level</label>

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
