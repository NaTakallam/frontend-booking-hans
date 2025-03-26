import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, isBefore, parseISO, addHours } from 'date-fns';

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const BookingCalendar = ({ schedule }) => {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [activeDayIndex, setActiveDayIndex] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [initialSelectedDay, setInitialSelectedDay] = useState(null);

  const now = new Date();
  const nowPlus24 = addHours(now, 24);

  const generateTimeSlots = (start, end) => {
    const slots = [];
    let startHour = parseInt(start.split(":")[0]);
    let endHour = parseInt(end.split(":")[0]);

    for (let hour = startHour; hour < endHour; hour++) {
      const from = `${hour.toString().padStart(2, '0')}:00`;
      const to = `${(hour + 1).toString().padStart(2, '0')}:00`;
      slots.push({ from, to });
    }

    return slots;
  };

  useEffect(() => {
    let validDayFound = false;
  
    for (let i = 0; i < 7 && !validDayFound; i++) {
      const date = addDays(weekStart, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const periods = schedule[i + 1] || [];
  
      for (let period of periods) {
        const slots = generateTimeSlots(period.start_time, period.end_time);
  
        for (let { from } of slots) {
          const slotStart = new Date(`${dateStr}T${from}:00`);
          const slotTime = slotStart.getTime();
          const thresholdTime = nowPlus24.getTime();
  
          if (format(date, 'yyyy-MM-dd') === '2025-03-27') {
            console.log(`🕐 Slot on 27th: ${slotStart.toString()} (${slotTime}) vs nowPlus24: ${nowPlus24.toString()} (${thresholdTime})`);
          }
  
          if (slotTime >= thresholdTime) {
            console.log('🎯 Selecting default day:', i, dateStr);
            setActiveDayIndex(i);
            setInitialSelectedDay(i);
            validDayFound = true;
            break;
          }
        }
  
        if (validDayFound) break;
      }
    }
  }, [weekStart]);
  

  const changeWeek = (direction) => {
    const shift = direction === 'next' ? 7 : -7;
    setWeekStart(addDays(weekStart, shift));
    setActiveDayIndex(null);
    setInitialSelectedDay(null);
  };

  const toggleSlot = (date, slot) => {
    const id = `${date}|${slot}`;
    setSelectedSlots((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const renderTimeSlots = (type) => {
    if (activeDayIndex === null) return null;

    const day = activeDayIndex;
    const dateObj = addDays(weekStart, day);
    const dateStr = format(dateObj, 'yyyy-MM-dd');
    const periods = schedule[day + 1] || [];

    const filtered = periods.filter((p) => {
      const hour = parseInt(p.start_time.split(':')[0]);
      return type === 'morning' ? hour < 12 : hour >= 12;
    });

    const isThisWeek = format(weekStart, 'yyyy-MM-dd') === format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

    return (
      <div className="grid grid-cols-3 gap-3 my-3">
        {filtered.flatMap((period, i) =>
          generateTimeSlots(period.start_time, period.end_time).map(({ from, to }, j) => {
            const slot = `${from} - ${to}`;
            const slotDateTime = new Date(`${dateStr}T${from}:00`);
            const shouldHideSlot = isThisWeek && slotDateTime.getTime() < nowPlus24.getTime();
            if (shouldHideSlot) return null;

            const id = `${dateStr}|${slot}`;
            const selected = selectedSlots.includes(id);

            return (
              <button
                key={`${i}-${j}`}
                onClick={() => toggleSlot(dateStr, slot)}
                className={`text-sm px-3 py-2 rounded-full border transition-all duration-200 ease-in-out ${
                  selected
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-green-700 border-green-400 hover:bg-green-100'
                }`}
              >
                {slot}
              </button>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => changeWeek('prev')}
          className="text-xl px-3 py-1 text-green-600 rounded-full border border-green-600 hover:bg-green-100"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold">
          {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
        </h2>
        <button
          onClick={() => changeWeek('next')}
          className="text-xl px-3 py-1 text-green-600 rounded-full border border-green-600 hover:bg-green-100"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 text-center gap-2 mb-6">
        {dayNames.map((day, i) => {
          const date = addDays(weekStart, i);
          const isTodayOrLater = !isBefore(date, now);
          const isSelected = activeDayIndex === i;

          return (
            <button
              key={i}
              disabled={!isTodayOrLater}
              onClick={() => setActiveDayIndex(i)}
              className={`flex flex-col items-center py-2 rounded-md transition ${
                !isTodayOrLater
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : isSelected
                  ? 'bg-green-600 text-white'
                  : 'hover:bg-green-100'
              }`}
            >
              <span className="text-sm">{day}</span>
              <span className="font-bold">{format(date, 'd')}</span>
            </button>
          );
        })}
      </div>

      {activeDayIndex !== null && (
        <>
          <h3 className="text-md font-semibold mb-2">🌅 Morning</h3>
          {renderTimeSlots('morning')}

          <h3 className="text-md font-semibold mt-6 mb-2">🌞 Afternoon</h3>
          {renderTimeSlots('afternoon')}

          <div className="flex justify-center mt-8">
            <button
              onClick={() => alert(`Booking sessions:\n${selectedSlots.join('\n')}`)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full text-lg font-semibold"
            >
              Booking
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BookingCalendar;
