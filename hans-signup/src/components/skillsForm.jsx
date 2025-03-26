import React from 'react';
import { useFormData } from './FormDataContext'; // adjust path if needed

const skills = [
  {
    title: 'Listening',
    description: 'Improve comprehension through audio & conversation',
    icon: '🎧',
    value: 'Listening',
  },
  {
    title: 'Reading',
    description: 'Enhance vocabulary & understanding of written texts',
    icon: '📖',
    value: 'Reading',
  },
  {
    title: 'Speaking',
    description: 'Develop fluency & pronunciation in real conversations',
    icon: '🗣️',
    value: 'Speaking',
  },
  {
    title: 'Writing',
    description: 'Strengthen grammar & written communication skills',
    icon: '✍️',
    value: 'Writing',
  },
];

const SkillsForm = () => {
  const { formData, setFormData } = useFormData();
  const selectedSkills = formData.skills || [];

  const toggleSkill = (value) => {
    const updatedSkills = selectedSkills.includes(value)
      ? selectedSkills.filter((item) => item !== value)
      : [...selectedSkills, value];

    setFormData((prev) => ({ ...prev, skills: updatedSkills }));
  };

  return (
    <div className="max-w-md font-fellix mx-auto p-2 space-y-2 mt-5">
      <h3 className="text-center text-semibold text-gray-800 text-sm font-medium mb-2">
        Which language skill would you like to focus on?
      </h3>

      {skills.map((skill) => {
        const isSelected = selectedSkills.includes(skill.value);

        return (
          <button
            key={skill.value}
            onClick={() => toggleSkill(skill.value)}
            className={`w-full flex items-center px-4 py-2 rounded-full border transition-all duration-200 text-left
              ${
                isSelected
                  ? 'bg-secondary text-white border-green-500'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
              }`}
          >
            <div
              className={`text-2xl mr-1 flex-shrink-0 ${
                isSelected ? 'text-white' : 'text-green-500'
              }`}
            >
              {skill.icon}
            </div>
            <div>
              <div
                className={`font-semibold text-sm ${
                  isSelected ? 'text-white' : 'text-gray-500'
                }`}
              >
                {skill.title}
              </div>
              <div
                className={`text-[11px] leading-tight ${
                  isSelected ? 'text-white/80' : 'text-gray-500'
                }`}
              >
                {skill.description}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default SkillsForm;
