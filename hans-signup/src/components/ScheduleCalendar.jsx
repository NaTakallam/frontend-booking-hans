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
import { useFormData } from './FormDataContext';
import { useLocation } from 'react-router-dom';

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ScheduleCalendar = () => {
  const { formData, setFormData } = useFormData();
  const [sessionType, setSessionType] = useState('Trial'); // default to Trial
  const location = useLocation();
  const { schedule: initialSchedule, allTutors, selectedTutor } = location.state || {};
  const [activeTutor, setActiveTutor] = useState(selectedTutor);
  const [tutorList, setTutorList] = useState(allTutors || []);
  const currentTutor = tutorList.find((t) => t.name === activeTutor);
  const tutorSchedule = currentTutor?.schedule;
  const tutorTimeZone = currentTutor?.time_zone;
  const [convertedSchedule, setConvertedSchedule] = useState({});
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [activeDayIndex, setActiveDayIndex] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const now = new Date();
  const nowPlus24 = addHours(now, 24);

  const timeOptions = moment.tz.names().map((tz) => ({
    value: tz,
    label: `🌍 ${tz} (GMT ${moment.tz(tz).format('Z')})`,
  }));

  const selectedTime = formData.timezone
    ? { value: formData.timezone, label: `🌍 ${formData.timezone} (GMT ${moment.tz(formData.timezone).format('Z')})` }
    : null;

  const handleTimeZoneChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, timezone: selectedOption.value }));
  };

  // const convertSchedule = () => {
  //   if (!tutorSchedule || !tutorTimeZone || !formData.timezone) return;
  //   const newSchedule = {};

  //   for (const [dayIndex, slots] of Object.entries(tutorSchedule)) {
  //     const convertedSlots = slots.map(({ start_time, end_time }) => {
  //       const date = moment().day(parseInt(dayIndex)).startOf('day');
  //       const start = moment.tz(`${date.format('YYYY-MM-DD')}T${start_time}`, tutorTimeZone).tz(formData.timezone);
  //       const end = moment.tz(`${date.format('YYYY-MM-DD')}T${end_time}`, tutorTimeZone).tz(formData.timezone);

  //       return {
  //         start_time: start.format('HH:mm:ss'),
  //         end_time: end.format('HH:mm:ss'),
  //       };
  //     });
  //     newSchedule[dayIndex] = convertedSlots;
  //   }
  //   setConvertedSchedule(newSchedule);
  // };

    useEffect(() => {
      if (!currentTutor?.schedule || !currentTutor.time_zone || !formData.timezone) return;
      const newSchedule = {};

      for (const [dayIndex, slots] of Object.entries(currentTutor.schedule)) {
        const convertedSlots = slots.map(({ start_time, end_time }) => {
          const date = moment().day(parseInt(dayIndex)).startOf('day');
          const start = moment.tz(`${date.format('YYYY-MM-DD')}T${start_time}`, currentTutor.time_zone).tz(formData.timezone);
          const end = moment.tz(`${date.format('YYYY-MM-DD')}T${end_time}`, currentTutor.time_zone).tz(formData.timezone);

          return {
            start_time: start.format('HH:mm:ss'),
            end_time: end.format('HH:mm:ss'),
          };
        });
        newSchedule[dayIndex] = convertedSlots;
      }
      setConvertedSchedule(newSchedule);
    }, [currentTutor, formData.timezone]);

  useEffect(() => {
    let found = false;
    for (let i = 0; i < 7 && !found; i++) {
      const date = addDays(weekStart, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const periods = convertedSchedule[i + 1] || [];

      for (let period of periods) {
        const hour = parseInt(period.start_time.split(':')[0]);
        const slotDate = new Date(`${dateStr}T${hour.toString().padStart(2, '0')}:00:00`);
        if (slotDate.getTime() >= nowPlus24.getTime()) {
          setActiveDayIndex(i);
          found = true;
          break;
        }
      }
    }
  }, [convertedSchedule, weekStart]);

  const generateTimeSlots = (start, end) => {
    const slots = [];
    let h1 = parseInt(start.split(':')[0]);
    let h2 = parseInt(end.split(':')[0]);
    for (let i = h1; i < h2; i++) {
      slots.push({ from: `${i.toString().padStart(2, '0')}:00`, to: `${(i + 1).toString().padStart(2, '0')}:00` });
    }
    return slots;
  };

  const toggleSlot = (date, slot) => {
    const id = `${date}|${slot}`;

    if (sessionType === 'Trial') {
      // If already selected, unselect; otherwise replace selection with this one
      setSelectedSlots((prev) =>
        prev.includes(id) ? [] : [id]
      );
    } else {
      // Multiple session logic
      setSelectedSlots((prev) =>
        prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
      );
    }
  };

  const renderTimeSlots = (type) => {
    if (activeDayIndex === null) return null;
    const day = activeDayIndex;
    const dateObj = addDays(weekStart, day);
    const dateStr = format(dateObj, 'yyyy-MM-dd');
    const periods = convertedSchedule[day + 1] || [];
    const filtered = periods.filter((p) => {
      const hour = parseInt(p.start_time.split(':')[0]);
      return type === 'morning' ? hour < 12 : hour >= 12;
    });

    return (
      <div className="grid grid-cols-3 gap-3 my-3">
        {filtered.flatMap((period, i) =>
          generateTimeSlots(period.start_time, period.end_time).map(({ from, to }, j) => {
            const slot = `${from} - ${to}`;
            const id = `${dateStr}|${slot}`;
            const selected = selectedSlots.includes(id);

            return (
              <button
                key={`${i}-${j}`}
                onClick={() => toggleSlot(dateStr, slot)}
                className={`text-sm px-3 py-2 rounded-full border transition-all duration-200 ease-in-out ${
                  selected ? 'bg-secondary text-white border-secondary' : 'bg-white text-secondary border-secondary hover:bg-secondary'
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

  const changeWeek = (dir) => {
    setWeekStart(addDays(weekStart, dir === 'next' ? 7 : -7));
  };

  return (
  <div className="font-fellix">
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap sm:flex-nowrap gap-4 mb-6">
        {/* Session Type Select */}
        <div className="w-full sm:w-1/3">
          <label className="block text-gray-700 font-medium mb-2">Session Type</label>
          <Select
            options={[
              { value: 'Trial', label: 'Trial Session - 1 Hour' },
              { value: 'Multiple', label: 'Multiple Sessions' }
            ]}
            value={{ value: sessionType, label: sessionType === 'Trial' ? 'Trial Session - 1 Hour' : 'Multiple Sessions' }}
            onChange={(option) => setSessionType(option.value)}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {/* Time Zone Select */}
        <div className="w-full sm:w-1/3">
          <label className="block text-gray-700 font-medium mb-2">Time Zone</label>
          <Select
            options={timeOptions}
            value={selectedTime}
            onChange={handleTimeZoneChange}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {/* Language Partner Select with photo */}
        <div className="w-full sm:w-1/3">
          <label className="block text-gray-700 font-medium mb-2">Language Partner</label>
          <Select
            options={tutorList.map((t) => ({
              value: t.name,
              label: t.name,
              image: t.image
            }))}
            value={{
              value: activeTutor,
              label: activeTutor,
              image: tutorList.find(t => t.name === activeTutor)?.image
            }}
            onChange={(option) => setActiveTutor(option.value)}
            formatOptionLabel={({ label, image }) => (
              <div className="flex items-center gap-2">
                <img src={image} alt={label} className="w-6 h-6 rounded-full object-cover" />
                <span>{label}</span>
              </div>
            )}
            className="react-select-container"
            classNamePrefix="react-select"
            isSearchable
          />
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeWeek('prev')} className="text-xl px-3 py-1 text-secondary border border-secondary rounded-full">←</button>
        <h2 className="text-lg font-semibold">{format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}</h2>
        <button onClick={() => changeWeek('next')} className="text-xl px-3 py-1 text-secondary border border-secondary rounded-full">→</button>
      </div>

      {/* Days grid */}
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
                !isTodayOrLater ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : isSelected ? 'bg-secondary text-white' : 'hover:bg-secondary'
              }`}
            >
              <span className="text-sm">{day}</span>
              <span className="font-bold">{format(date, 'd')}</span>
            </button>
          );
        })}
      </div>

      {/* Time slots */}
      {activeDayIndex !== null && (
        <>
          <h3 className="text-md font-semibold mb-2">🌅 Morning</h3>
          {renderTimeSlots('morning')}

          <h3 className="text-md font-semibold mt-6 mb-2">🌞 Afternoon</h3>
          {renderTimeSlots('afternoon')}

          <div className="flex justify-center mt-8">
            <button
              onClick={() => alert(`Booking sessions:\n${selectedSlots.join('\n')}`)}
              className="bg-secondary hover:bg-secondary text-white px-6 py-3 rounded-full text-lg font-semibold"
            >
              Booking
            </button>
          </div>
        </>
      )}
    </div>
  </div>
);
};
export default ScheduleCalendar;