import React, { useState, useEffect } from 'react';
import ntkLogo from '/NaTakallam-logo-2.png'
import { useFormData } from '../components/FormDataContext'; // adjust path if needed
import { useNavigate } from 'react-router-dom';


const StepProgress = ({ currentStep, setCurrentStep }) => {
  const totalSteps = 5;
  const navigate = useNavigate();

  const steps = ['levelForm', 'topicsForm', 'typeForm', 'skillsForm', 'availabilityForm']; // Step names
const componentsMap = {
  levelForm: () => import('./levelForm'),
  topicsForm: () => import('./topicsForm'),
  typeForm: () => import('./typeForm'),
  skillsForm: () => import('./skillsForm'),
  availabilityForm: () => import('./availabilityForm'),
}; 
  const [Component, setComponent] = useState(null); // State to hold dynamically imported component
  const { formData, setFormData } = useFormData(); // ✅ access form data
  // Dynamically import the correct component based on the current step
  useEffect(() => {
  const loadComponent = async () => {
    const stepName = steps[currentStep];
    if (componentsMap[stepName]) {
      const component = await componentsMap[stepName]();
      setComponent(() => component.default);
    } else {
      console.error(`Component not found for step: ${stepName}`);
    }
  };

  loadComponent();
}, [currentStep]);

  const getStepClass = (stepIndex) => {
    if (stepIndex === currentStep) {
      return 'current-step'; // Highlight the current step
    }
    return stepIndex < currentStep ? 'completed-step' : ''; // Completed or not yet reached
  };

  const handleNext = async () => {
    if (currentStep === totalSteps - 1) {
      // If availability already formatted from modal, skip
    if (!formData.availability || formData.availability.length === 0) {
      if (formData.selectedWeekdays && formData.selectedTimeSlots?.length > 0) {
        const firstSlot = formData.selectedTimeSlots[0];
        const [startRaw, endRaw] = firstSlot.split("-");
        const parseTime = (t) => {
          let [hour, suffix] = t.trim().split(" ");
          let [h, m] = hour.split(":");
          h = parseInt(h);
          if (suffix === "PM" && h < 12) h += 12;
          if (suffix === "AM" && h === 12) h = 0;
          return `${h.toString().padStart(2, "0")}:00:00`;
        };

        const startTime = parseTime(startRaw);
        const endTime = parseTime(endRaw);

        const availability = formData.selectedWeekdays.map((dayValue) => ({
          day_index: parseInt(dayValue),
          start_time: startTime,
          end_time: endTime,
        }));

        setFormData((prev) => ({ ...prev, availability }));
        console.log("Final availability from quick select:", availability);
      }
    } else {
      console.log("Final availability from modal:", formData.availability);
    }
    navigate('/loading', { state: { formData } });

    // alert('Form Submitted');
      // try {
      //   const response = await fetch('https://ml.natakallam.com/api/matching-teacher-schedules', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify(formData),
      //   });
      
      //   if (!response.ok) {
      //     const errorData = await response.json();
      //     console.error('Submission failed:', errorData);
      //     alert('Failed to submit the form. Please try again.');
      //   } else {
      //     const result = await response.json();
      //     console.log('Submission successful:', result);
      //     alert('Form successfully submitted!');
      //     // Optionally redirect or reset form here
      //   }
      // } catch (error) {
      //   console.error('An error occurred during submission:', error);
      //   alert('An unexpected error occurred. Please try again later.');
      // }
    } else {
      setCurrentStep(Math.min(currentStep + 1, totalSteps - 1));
    }
  };

  // Capitalize the first letter of the component name for dynamic imports
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div className="step-progress font-fellix">
      <ul className="steps">
        {steps.map((step, index) => (
          <li
            key={index}
            className={`step ${getStepClass(index)}`}
          />
        ))}
      </ul>
      {/* Render the dynamically imported component */}
      <div className="component-name font-fellix">
        {Component ? <Component /> : <div>Loading...</div>}
      </div>
      <div className="navigation-buttons">
        {currentStep !== 0 && (
          <button
            className="back-button font-fellix"
            onClick={() => setCurrentStep(Math.max(currentStep - 1, 0))}
          >
            Back
          </button>
        )}
        <button
          className="next-button font-fellix"
          onClick={handleNext}
          // disabled={currentStep === totalSteps - 1} // Disable next button on the last step
        >
          {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
};

const Form = () => {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div className="w-1/2 flex justify-center items-center bg-white px-10 font-fellix">
        <div className="w-full text-center">
            <img src={ntkLogo} alt="Logo" className="w-20 mb-5 mx-auto logo-ntk" />
            <h2 className="text-xl font-semibold text-black mb-2">Tell us a bit about yourself</h2>
            <p className="text-sm text-lightGrey mb-5">This will help to personalize your experience</p>
            <StepProgress currentStep={currentStep} setCurrentStep={setCurrentStep} />
        </div>
    </div>
  );
};

export default Form;