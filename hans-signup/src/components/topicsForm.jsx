import React from 'react';
import { useFormData } from './FormDataContext'; // adjust path if needed

const topicsList = [
  { label: '🗳️Politics / Current affairs', value: 'Politics / Current affairs', width: 'w-[255px]' },
  { label: '🏡Daily Life', value: 'Daily Life', width: 'w-[145px]' },
  { label: '🎭 Art / Literature / Music ', value: 'Art / Literature / Music', width: 'w-[255px]' },
  { label: '⚽Sports', value: 'Sports', width: 'w-[145px]' },
  { label: '📺Media / Cinema / TV Shows', value: 'Media / Cinema / TV Shows', width: 'w-full' },
];

const TopicsForm = () => {
  const { formData, setFormData } = useFormData();
  const selectedTopics = formData.topic || [];
  const selectedField = formData.field_of_study?.[0] || '';

  const toggleTopic = (value) => {
    const updatedTopics = selectedTopics.includes(value)
      ? selectedTopics.filter((t) => t !== value)
      : [...selectedTopics, value];
    setFormData((prev) => ({ ...prev, topic: updatedTopics }));
  };

  const handleFieldChange = (e) => {
    setFormData((prev) => ({ ...prev, field_of_study: [e.target.value] }));
  };

  const getBtnClasses = (isSelected, customWidth) =>
    `flex items-center justify-start gap-2 px-2 py-2 font-fellix m-0 rounded-full border text-xs text-500 font-semibold transition-all duration-200 
     ${customWidth} ${
       isSelected
         ? 'bg-secondary text-white border-green-600'
         : 'bg-white text-black-600 border-gray-300 hover:bg-gray-100'
     }`;

  return (
    <div className="max-w-xl mx-auto p-2 space-y-3 text-sm mt-5">
      <h3 className="text-gray-800 text-sm font-medium mb-2">
        Topics you want to cover during the sessions
      </h3>

      {/* Row 1 */}
      <div className="flex gap-2 mb-3">
        {topicsList.slice(0, 2).map((topic) => (
          <button
            key={topic.value}
            onClick={() => toggleTopic(topic.value)}
            className={getBtnClasses(
              selectedTopics.includes(topic.value),
              topic.width
            )}
          >
            <span>{topic.label}</span>
          </button>
        ))}
      </div>

      {/* Row 2 */}
      <div className="flex gap-2 mb-3">
        {topicsList.slice(2, 4).map((topic) => (
          <button
            key={topic.value}
            onClick={() => toggleTopic(topic.value)}
            className={getBtnClasses(
              selectedTopics.includes(topic.value),
              topic.width
            )}
          >
            <span>{topic.label}</span>
          </button>
        ))}
      </div>

      {/* Row 3 */}
      <div className="mb-7">
        <button
          onClick={() => toggleTopic(topicsList[4].value)}
          className={getBtnClasses(
            selectedTopics.includes(topicsList[4].value),
            topicsList[4].width
          )}
        >
          <span>{topicsList[4].label}</span>
        </button>
      </div>

      {/* Dropdown */}
      <div className="relative mb-4">
        <div className="flex justify-between items-center mb-1">
          <label className="text-gray-800 text-sm font-medium">
            General field of work or studies
          </label>
          <span className="text-yellow-500 text-xl">🛈</span>
        </div>
        <select
          value={selectedField}
          onChange={handleFieldChange}
          className="block text-sm font-bold mb-1 font-fellix w-full border border-gray-300 text-sm rounded-md px-5 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-secondary-500"
        >
          <option value="">Select your field</option>
          <option value="education">Education</option>
          <option value="health">Health</option>
          <option value="engineering">Engineering</option>
          <option value="business">Business</option>
        </select>
      </div>
    </div>
  );
};

export default TopicsForm;

