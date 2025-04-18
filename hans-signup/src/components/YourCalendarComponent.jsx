import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { useFormData } from './FormDataContext';
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

// ✅ Add this above your component function
const generateTimeOptions = () => {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, "0");
      const minute = m.toString().padStart(2, "0");
      times.push(`${hour}:${minute}`);
    }
  }
  return times.map((time) => (
    <option key={time} value={time}>
      {moment(time, "HH:mm").format("hh:mm A")}
    </option>
  ));
};

const YourCalendarComponent = ({ onClose, onSubmit }) => {
  const { formData } = useFormData();
  const [events, setEvents] = useState([]);
  const [pendingSlot, setPendingSlot] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (formData.availability?.length > 0) {
      const restoredEvents = formData.availability.map((slot) => {
        const now = moment().startOf('week').add(slot.day_index, 'days'); // Rough placement in current week
        const start = moment(`${now.format("YYYY-MM-DD")}T${slot.start_time}`);
        const end = moment(`${now.format("YYYY-MM-DD")}T${slot.end_time}`);
        return {
          title: "Available",
          start: start.toDate(),
          end: end.toDate(),
          allDay: false,
        };
      });
      setEvents(restoredEvents);
    }
  }, []);

  const handleSelectSlot = ({ start, end }) => {
    const overlap = events.some(
      (e) =>
        (start >= e.start && start < e.end) ||
        (end > e.start && end <= e.end) ||
        (start <= e.start && end >= e.end)
    );
    if (!overlap) {
      const dayIndex = moment(start).isoWeekday();
      setPendingSlot({
        start,
        end,
        dayIndex,
        allDay: false,
      });

      // Default tooltip position (can be made smarter later)
      setTooltipPosition({ top: 100, left: 300 });
    } else {
      alert("This time slot overlaps with an existing one.");
    }
  };

  const handleSelectEvent = (eventToDelete) => {
    const confirmed = window.confirm("Remove this availability?");
    if (confirmed) {
      setEvents((prev) => prev.filter((event) => event !== eventToDelete));
    }
  };

  const handleSave = () => {
    if (events.length === 0) {
      alert("Please select at least one available time before saving.");
      return;
    }
    const formatted = events.map((event) => {
      const startMoment = moment(event.start);
      const endMoment = moment(event.end);
      return {
        day_index: startMoment.isoWeekday(),
        start_time: event.allDay ? "00:00:00" : startMoment.format("HH:mm:ss"),
        end_time: event.allDay ? "23:59:59" : endMoment.format("HH:mm:ss"),
      };
    });
    setFormData((prev) => ({ ...prev, availability: formatted }));
    onSubmit(formatted);
    onClose();
  };

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
      <div className="bg-white text-black rounded-lg shadow-xl p-6 w-full max-w-6xl h-[90vh] overflow-hidden relative">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">Select your availability</h2>
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Confirm
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-red-600 text-lg"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="h-full overflow-hidden">
          <Calendar
            selectable
            localizer={localizer}
            events={[
              ...events,
              ...(pendingSlot
                ? [
                    {
                      title: "New Schedule",
                      start: pendingSlot.start,
                      end: pendingSlot.end,
                      allDay: false,
                    },
                  ]
                : []),
            ]}
            defaultView="week"
            views={["week"]}
            step={30}
            timeslots={2}
            defaultDate={new Date()}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            style={{ height: "calc(100% - 60px)" }}
            eventPropGetter={(event) => {
              const isPending = event.title === "New Schedule";
              return {
                style: {
                  backgroundColor: isPending ? "#1D4ED8" : "#34d399", // blue vs green
                  border: "none",
                  color: "white",
                  fontWeight: "500",
                },
              };
            }}
            components={{
              day: (props) => {
                const { date } = props;
                const dayOfWeek = date.getDay();
                return <span>{dayNames[dayOfWeek]}</span>; // Only display the day name (Mon, Tue, etc.)
              },
            }}
          />
        </div>

        {/* Tooltip Availability Editor */}
        {pendingSlot && (
          <div
            className="absolute bg-white p-5 shadow-xl rounded-lg z-50 border w-[320px]"
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
            }}
          >
            <h2 className="text-base font-semibold mb-1 text-black">Set your availability</h2>
            <p className="text-xs text-gray-500 mb-3">Adjust your time slot</p>

            {/* Day Dropdown */}
            <div className="mb-3">
              <label className="text-xs text-gray-600 block mb-1">Day</label>
              <select
                value={pendingSlot.dayIndex}
                onChange={(e) =>
                  setPendingSlot((prev) => ({
                    ...prev,
                    dayIndex: parseInt(e.target.value),
                  }))
                }
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm appearance-none bg-white"
              >
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                  (label, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* All Day Toggle */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-700">All Day</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pendingSlot.allDay || false}
                  onChange={(e) =>
                    setPendingSlot((prev) => ({
                      ...prev,
                      allDay: e.target.checked,
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-red-600 transition-all duration-300"></div>
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 peer-checked:translate-x-5"></div>
              </label>
            </div>

            {/* Time Selectors (Only if not all day) */}
            {!pendingSlot.allDay && (
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-600 block mb-1">From</label>
                  <select
                    value={moment(pendingSlot.start).format("HH:mm")}
                    onChange={(e) =>
                      setPendingSlot((prev) => ({
                        ...prev,
                        start: moment(prev.start)
                          .set({
                            hour: parseInt(e.target.value.split(":")[0]),
                            minute: parseInt(e.target.value.split(":")[1]),
                          })
                          .toDate(),
                      }))
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm appearance-none bg-white"
                  >
                    {generateTimeOptions()}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="text-xs text-gray-600 block mb-1">To</label>
                  <select
                    value={moment(pendingSlot.end).format("HH:mm")}
                    onChange={(e) =>
                      setPendingSlot((prev) => ({
                        ...prev,
                        end: moment(prev.end)
                          .set({
                            hour: parseInt(e.target.value.split(":")[0]),
                            minute: parseInt(e.target.value.split(":")[1]),
                          })
                          .toDate(),
                      }))
                    }
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm appearance-none bg-white"
                  >
                    {generateTimeOptions()}
                  </select>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between mt-4">
              <button
                className="px-4 py-2 text-sm border border-gray-300 text-gray-800 rounded hover:bg-gray-100"
                onClick={() => setPendingSlot(null)}
              >
                CANCEL
              </button>
              <button
                className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
                onClick={() => {
                  const newStart = moment()
                    .isoWeekday(pendingSlot.dayIndex)
                    .set({
                      hour: moment(pendingSlot.start).hour(),
                      minute: moment(pendingSlot.start).minute(),
                    });

                  const newEnd = moment()
                    .isoWeekday(pendingSlot.dayIndex)
                    .set({
                      hour: moment(pendingSlot.end).hour(),
                      minute: moment(pendingSlot.end).minute(),
                    });

                  setEvents((prev) => [
                    ...prev,
                    {
                      title: "Available",
                      start: newStart.toDate(),
                      end: newEnd.toDate(),
                      allDay: pendingSlot.allDay || false,
                    },
                  ]);
                  setPendingSlot(null);
                }}
              >
                CONFIRM
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YourCalendarComponent;
