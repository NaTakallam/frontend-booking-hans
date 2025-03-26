import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const loadingMessages = [
  "Finding your Language partner who will inspire you ...",
  "Matching you with an inspiring tutor ...",
  "Preparing your personalized language journey ..."
];

const LoadingPage = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { formData } = location.state || {};

  // ⏳ Loop through messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // 📡 Fetch API on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://ml.natakallam.com/api/matching-teacher-schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('Submission failed:', result);
          alert('Failed to submit the form. Please try again.');
          return;
        }

        console.log('✅ Submission successful:', result);

        // 🧭 Navigate to results page and pass data
        navigate('/results', { state: { result } });

      } catch (error) {
        console.error('An error occurred during submission:', error);
        alert('An unexpected error occurred. Please try again later.');
      }
    };

    if (formData) {
      fetchData();
    } else {
      console.error("No formData found in location.state");
    }
  }, [formData, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full text-center font-fellix">
      <img src="/NaTakallam-logo-2.png" alt="Logo" className="w-[6em] h-[6em] mb-8 object-contain" />
      <p className="text-black text-2xl font-bold mt-4 px-4 transition-opacity duration-300 ease-in-out">
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
};

export default LoadingPage;
