import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import moment from 'moment-timezone';
import {
  format,
  addDays,
  startOfWeek,
  isBefore,
  addHours,
} from 'date-fns';
import { useFormData } from './FormDataContext'; // ✅ Adjust path as needed

const dayNames = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const DEFAULT_TIMEZONE = 'Asia/Beirut';

const ScheduleCalendar = ({ schedule }) => {
  const { formData, setFormData } = useFormData();
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [activeDayIndex, setActiveDayIndex] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);

  const now = new Date();
  const nowPlus24 = addHours(now, 24);

  // Ensure default timezone is set in formData
  useEffect(() => {
    if (!formData.timezone) {
      setFormData((prev) => ({ ...prev, timezone: DEFAULT_TIMEZONE }));
    }
  }, []);

  // Timezone dropdown options
  const timeOptions = moment.tz.names().map((tz) => ({
    value: tz,
    label: `🌍 ${tz} (GMT ${moment.tz(tz).format('Z')})`,
  }));

  const selectedTime = formData.timezone
    ? {
        value: formData.timezone,
        label: `🌍 ${formData.timezone} (GMT ${moment.tz(formData.timezone).format('Z')})`,
      }
    : null;

  const handleTimeZoneChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      timezone: selectedOption.value,
    }));
  };

  // Convert schedule time to selected timezone
  const generateTimeSlots = (start, end, dateStr, userTz) => {
    const slots = [];
    let startHour = parseInt(start.split(":")[0]);
    let endHour = parseInt(end.split(":")[0]);

    for (let hour = startHour; hour < endHour; hour++) {
      const original = moment.tz(`${dateStr} ${hour}:00:00`, DEFAULT_TIMEZONE);
      const converted = original.clone().tz(userTz);
      const from = converted.format("HH:00");
      const to = converted.clone().add(1, 'hour').format("HH:00");
      slots.push({ from, to });
    }

    return slots;
  };

  // Auto-select a valid day and slot at least 24h from now
  useEffect(() => {
    if (!formData.timezone) return;

    let validDayFound = false;

    for (let i = 0; i < 7 && !validDayFound; i++) {
      const date = addDays(weekStart, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const periods = schedule[i + 1] || [];

      for (let period of periods) {
        const slots = generateTimeSlots(
          period.start_time,
          period.end_time,
          dateStr,
          formData.timezone
        );

        for (let { from } of slots) {
          const slotStart = new Date(`${dateStr}T${from}:00`);
          if (slotStart.getTime() >= nowPlus24.getTime()) {
            setActiveDayIndex(i);
            validDayFound = true;
            break;
          }
        }

        if (validDayFound) break;
      }
    }
  }, [weekStart, formData.timezone]);

  const changeWeek = (direction) => {
    const shift = direction === 'next' ? 7 : -7;
    setWeekStart(addDays(weekStart, shift));
    setActiveDayIndex(null);
  };

  const toggleSlot = (date, slot) => {
    const id = `${date}|${slot}`;
    setSelectedSlots((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const renderTimeSlots = (type) => {
    if (activeDayIndex === null || !formData.timezone) return null;

    const day = activeDayIndex;
    const dateObj = addDays(weekStart, day);
    const dateStr = format(dateObj, 'yyyy-MM-dd');
    const periods = schedule[day + 1] || [];

    const filtered = periods.filter((p) => {
      const hour = parseInt(p.start_time.split(':')[0]);
      return type === 'morning' ? hour < 12 : hour >= 12;
    });

    const isThisWeek =
      format(weekStart, 'yyyy-MM-dd') ===
      format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

    return (
      <div className="grid grid-cols-3 gap-3 my-3">
        {filtered.flatMap((period, i) =>
          generateTimeSlots(
            period.start_time,
            period.end_time,
            dateStr,
            formData.timezone
          ).map(({ from, to }, j) => {
            const slot = `${from} - ${to}`;
            const slotDateTime = new Date(`${dateStr}T${from}:00`);
            const shouldHideSlot =
              isThisWeek && slotDateTime.getTime() < nowPlus24.getTime();

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
      {/* 🌍 Timezone Selector */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Select your timezone
        </label>
        <Select
          options={timeOptions}
          value={selectedTime}
          onChange={handleTimeZoneChange}
          className="max-w-md"
          styles={{
            control: (base) => ({
              ...base,
              borderColor: '#D1D5DB',
              color: 'black',
            }),
            singleValue: (base) => ({ ...base, color: 'black' }),
          }}
        />
      </div>

      {/* Week Navigation */}
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

      {/* Day Selection */}
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

      {/* Time Slots */}
      {activeDayIndex !== null && (
        <>
          <h3 className="text-md font-semibold mb-2">🌅 Morning</h3>
          {renderTimeSlots('morning')}

          <h3 className="text-md font-semibold mt-6 mb-2">🌞 Afternoon</h3>
          {renderTimeSlots('afternoon')}

          <div className="flex justify-center mt-8">
            <button
              onClick={() =>
                alert(`Booking sessions:\n${selectedSlots.join('\n')}`)
              }
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

export default ScheduleCalendar;
