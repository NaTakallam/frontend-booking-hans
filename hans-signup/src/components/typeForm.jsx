import React, { useEffect } from 'react';
import { useFormData } from './FormDataContext'; // adjust path if needed

const approaches = [
  { title: 'Structured courses', description: 'Follow a step-by-step path', icon: '📚', value: 'Structured' },
  { title: 'Free-flowing conversations', description: 'Practice naturally', icon: '💬', value: 'FreeFlow' },
  { title: 'A mix of both', description: 'Balanced learning', icon: '⚖️', value: 'both' },
];

const SkillsForm = () => {
  const { formData, setFormData } = useFormData();

  useEffect(() => {
    if (!formData.type_of_session?.length) {
      setFormData((prev) => ({ ...prev, type_of_session: ['FreeFlow'] }));
    }
  }, []);

  const handleSelect = (value) => {
    if (value === 'both') {
      setFormData((prev) => ({ ...prev, type_of_session: ['Structured', 'FreeFlow'] }));
    } else {
      setFormData((prev) => ({ ...prev, type_of_session: [value] }));
    }
  };

  const isSelected = (value) => {
    if (value === 'both') {
      return (
        formData.type_of_session?.length === 2 &&
        formData.type_of_session.includes('Structured') &&
        formData.type_of_session.includes('FreeFlow')
      );
    }
    return (
      formData.type_of_session?.length === 1 &&
      formData.type_of_session[0] === value
    );
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h2 className="text-center text-base font-semibold text-gray-700 mb-4">
        Choose Your Learning Approach!
      </h2>

      {approaches.map((option) => {
        const selected = isSelected(option.value);
        return (
          <button
            key={option.value}
            onClick={() => handleSelect(option.value)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-full border transition-all duration-200 text-left
              ${selected ? 'bg-secondary text-white border-green-500' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`text-2xl flex-shrink-0 ${selected ? 'text-white' : 'text-green-500'}`}>
                {option.icon}
              </div>
              <div>
                <div className={`font-semibold text-sm ${selected ? 'text-white' : 'text-gray-800'}`}>
                  {option.title}
                </div>
                <div className={`text-[11px] leading-tight ${selected ? 'text-white/80' : 'text-gray-500'}`}>
                  {option.description}
                </div>
              </div>
            </div>

            <div className={`w-4 h-4 rounded-full border-2 transition duration-200 ${selected ? 'border-white bg-white' : 'border-gray-400'}`}>
              {selected && <div className="w-2 h-2 m-[3px] rounded-full bg-green-500" />}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default SkillsForm;
