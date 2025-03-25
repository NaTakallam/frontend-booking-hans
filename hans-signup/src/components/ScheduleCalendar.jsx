import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import default styles

const CalendarView = () => {
  const [value, setValue] = useState(new Date());

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-xl font-bold mb-4">Select a Date</h1>
      <div className="bg-white shadow-lg p-4 rounded-md">
        <Calendar
          onChange={setValue}
          value={value}
          calendarType="US" // starts week on Sunday
        />
      </div>

      <p className="mt-4 text-md">
        <strong>Selected Date:</strong> {value.toDateString()}
      </p>
    </div>
  );
};

export default CalendarView;
