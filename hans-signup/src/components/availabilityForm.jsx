import { useState, useEffect } from "react";
import moment from "moment-timezone";
import Select from "react-select";
import { FaSun, FaMoon, FaRegSun } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import YourCalendarComponent from "./YourCalendarComponent";
import { useFormData } from "./FormDataContext";

export default function AvailabilityForm({ currentStep, setCurrentStep }) {
  const { formData, setFormData } = useFormData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWeekdays, setSelectedWeekdays] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [customSlots, setCustomSlots] = useState([{ days: [], from: "", to: "" }]);

  const timeOptions = moment.tz.names().map((tz) => ({
    value: tz,
    label: `🌍${tz} (GMT ${moment.tz(tz).format("Z")})`,
  }));

  const timeDropdownOptions = Array.from({ length: 24 }, (_, index) => {
    const hour = index < 10 ? `0${index}` : `${index}`;
    return {
      value: `${hour}:00:00`,
      label: `${hour}:00:00`,
    };
  });

  const daysOptions = [
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
    { value: "6", label: "Saturday" },
    { value: "7", label: "Sunday" },
    { value: "Every Day", label: "Every Day" },
  ];

  useEffect(() => {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!formData.timezone) {
      setFormData((prev) => ({ ...prev, timezone: userTimezone }));
    }
  }, []);

  const selectedTime = formData.timezone
    ? {
        value: formData.timezone,
        label: `🌍${formData.timezone} (GMT ${moment.tz(formData.timezone).format("Z")})`,
      }
    : null;

  const handleTimeZoneChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      timezone: selectedOption.value,
    }));
  };

  const toggleTimeSlot = (slot) => {
    setSelectedTimeSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleConfirm = () => {
    const validSlots = customSlots.filter(
      (slot) => slot.days.length && slot.from && slot.to
    );

    if (validSlots.length === 0) {
      alert("Please complete at least one valid availability entry.");
      return;
    }

    const formattedAvailability = [];
    validSlots.forEach((slot) => {
      slot.days.forEach((day) => {
        formattedAvailability.push({
          day_index: parseInt(day.value),
          start_time: slot.from,
          end_time: slot.to,
        });
      });
    });

    setFormData((prev) => ({
      ...prev,
      availability: formattedAvailability,
      selectedWeekdays: [],
      selectedTimeSlots: [],
    }));

    setIsModalOpen(false);

    if (typeof setCurrentStep === "function") {
      setCurrentStep(currentStep + 1);
    }
  };

  const closeModal = () => setIsModalOpen(false);

  const handleOpenModal = () => {
    if (formData.availability?.length > 0) {
      const mapped = formData.availability.reduce((acc, curr) => {
        const existing = acc.find(
          (s) => s.from === curr.start_time && s.to === curr.end_time
        );
        const dayOption = daysOptions.find((d) => d.value === String(curr.day_index));
        if (existing && dayOption) {
          existing.days.push(dayOption);
        } else if (dayOption) {
          acc.push({
            days: [dayOption],
            from: curr.start_time,
            to: curr.end_time,
          });
        }
        return acc;
      }, []);
      setCustomSlots(mapped);
    } else {
      setCustomSlots([{ days: [], from: "", to: "" }]);
    }
    setIsModalOpen(true);
  };

  useEffect(() => {
    const slotMap = {
      "6-9 AM": { from: "06:00:00", to: "09:00:00" },
      "9-12 PM": { from: "09:00:00", to: "12:00:00" },
      "12-3 PM": { from: "12:00:00", to: "15:00:00" },
      "3-6 PM": { from: "15:00:00", to: "18:00:00" },
      "6-9 PM": { from: "18:00:00", to: "21:00:00" },
      "9-12 AM": { from: "21:00:00", to: "00:00:00" },
      "12-3 AM": { from: "00:00:00", to: "03:00:00" },
      "3-6 AM": { from: "03:00:00", to: "06:00:00" },
    };

    const selectedDayIndices = selectedWeekdays.map((d) => parseInt(d));

    setFormData((prev) => {
      const existing = prev.availability || [];

      const cleaned = existing.filter((entry) => {
        const dayStillSelected = selectedDayIndices.includes(entry.day_index);
        const timeStillSelected = selectedTimeSlots.some((label) => {
          const range = slotMap[label];
          return range && range.from === entry.start_time && range.to === entry.end_time;
        });
        return dayStillSelected && timeStillSelected;
      });

      selectedDayIndices.forEach((day) => {
        selectedTimeSlots.forEach((label) => {
          const range = slotMap[label];
          if (!range) return;

          const alreadyExists = cleaned.some(
            (entry) =>
              entry.day_index === day &&
              entry.start_time === range.from &&
              entry.end_time === range.to
          );

          if (!alreadyExists) {
            cleaned.push({
              day_index: day,
              start_time: range.from,
              end_time: range.to,
            });
          }
        });
      });

      return {
        ...prev,
        availability: cleaned,
        selectedWeekdays,
        selectedTimeSlots,
      };
    });
  }, [selectedWeekdays, selectedTimeSlots]);

  return (
    <div>
      <div className="availabilty-form bg-white p-8 rounded-lg text-center shadow-xl mt-8 text-black">
        <div className="text-left mb-6">
          <label className="block text-gray-700 font-medium mb-2 input-label">
            When would you like to take your lessons?
          </label>
          <Select
            options={timeOptions}
            value={selectedTime}
            onChange={handleTimeZoneChange}
            isSearchable
            placeholder="Search your timezone..."
            className="mb-6 custom-select"
            styles={{
              control: (base) => ({ ...base, borderColor: "#D1D5DB", color: "black" }),
              singleValue: (base) => ({ ...base, color: "black" }),
              input: (base) => ({ ...base, color: "black" }),
            }}
          />
        </div>

        <div className="grid grid-cols-7 gap-2 mb-6">
          {[{ label: "Sun", value: "7" }, { label: "Mon", value: "1" }, { label: "Tue", value: "2" },
            { label: "Wed", value: "3" }, { label: "Thu", value: "4" }, { label: "Fri", value: "5" },
            { label: "Sat", value: "6" }].map((day) => {
            const isSelected = selectedWeekdays.includes(day.value);
            return (
              <button
                key={day.value}
                onClick={() =>
                  setSelectedWeekdays((prev) =>
                    prev.includes(day.value)
                      ? prev.filter((d) => d !== day.value)
                      : [...prev, day.value]
                  )
                }
                className={`px-2 py-2 rounded-full border transition duration-150 m-0 ${
                  isSelected
                    ? "bg-secondary text-white"
                    : "border-secondary text-gray-700"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>

        <div className="flex justify-center gap-8 mt-4">
          <div className="px-4 py-2 bg-gray-200 rounded-full flex items-center gap-2 w-full justify-center">
            <FaSun className="text-yellow-500" /> Morning
          </div>
          <div className="px-4 py-2 bg-gray-200 rounded-full flex items-center gap-2 w-full justify-center">
            <FaRegSun className="text-orange-500" /> Afternoon
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 justify-center w-full mt-4">
          {["6-9 AM", "9-12 PM", "12-3 PM", "3-6 PM"].map((slot) => (
            <button
              key={slot}
              onClick={() => toggleTimeSlot(slot)}
              className={`m-0 px-2 py-2 rounded-full border text-sm transition ${
                selectedTimeSlots.includes(slot)
                  ? "bg-secondary text-white"
                  : "border-secondary text-gray-700"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-8 mt-4">
          <div className="px-4 py-2 bg-gray-200 rounded-full flex items-center gap-2 w-full justify-center">
            <FaMoon className="text-purple-500" /> Evening
          </div>
          <div className="px-4 py-2 bg-gray-200 rounded-full flex items-center gap-2 w-full justify-center">
            <FaMoon className="text-blue-500" /> Night
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 justify-center w-full mt-4">
          {["6-9 PM", "9-12 AM", "12-3 AM", "3-6 AM"].map((slot) => (
            <button
              key={slot}
              onClick={() => toggleTimeSlot(slot)}
              className={`m-0 px-2 py-2 rounded-full border text-sm transition ${
                selectedTimeSlots.includes(slot)
                  ? "bg-secondary text-white"
                  : "border-secondary text-gray-700"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm text-gray-600">
          Prefer a custom time?{" "}
          <button onClick={handleOpenModal} className="text-green-600 underline">
            Set your availability
          </button>
          <button
            onClick={() => setShowCalendar(true)}
            className="text-blue-600 underline mt-2 block"
          >
            📅 Open Calendar View
          </button>
        </p>
        {showCalendar && (
          <div className="mt-6 border rounded shadow-lg p-4 bg-white">
            <YourCalendarComponent
              onClose={() => setShowCalendar(false)}
              onSubmit={(timeRanges) => {
                setFormData((prev) => ({
                  ...prev,
                  availability: timeRanges,
                }));
                setShowCalendar(false);

                // ✅ Move to ConfirmationBox
                if (typeof setCurrentStep === "function") {
                  setCurrentStep((prev) => prev + 1);
                }
              }}
            />
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white text-black rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Set your custom availability</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-red-500">
                <AiOutlineClose size={24} />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              Set your custom availability by selecting the days and specific
              time ranges that best fit your schedule.
            </p>

            {customSlots.map((slot, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center mb-4">
                <div className="col-span-4">
                  <p className="text-xs font-medium text-gray-600 mb-1">Day</p>
                  <Select
                    options={daysOptions}
                    isMulti
                    value={slot.days}
                    onChange={(selected) => {
                      if (selected?.some((opt) => opt.value === "Every Day")) {
                        selected = daysOptions.slice(0, 7);
                      }
                      setCustomSlots((prev) =>
                        prev.map((s, i) =>
                          i === index ? { ...s, days: selected } : s
                        )
                      );
                    }}
                  />
                </div>
                <div className="col-span-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">From</p>
                  <Select
                    options={timeDropdownOptions}
                    value={slot.from ? { value: slot.from, label: slot.from } : null}
                    onChange={(e) =>
                      setCustomSlots((prev) =>
                        prev.map((s, i) =>
                          i === index ? { ...s, from: e?.value || "" } : s
                        )
                      )
                    }
                  />
                </div>
                <div className="col-span-3">
                  <p className="text-xs font-medium text-gray-600 mb-1">To</p>
                  <Select
                    options={timeDropdownOptions}
                    value={slot.to ? { value: slot.to, label: slot.to } : null}
                    onChange={(e) =>
                      setCustomSlots((prev) =>
                        prev.map((s, i) =>
                          i === index ? { ...s, to: e?.value || "" } : s
                        )
                      )
                    }
                  />
                </div>
                <div className="col-span-2 text-right">
                  <button
                    onClick={() => {
                      setCustomSlots((prev) => {
                        const updated = prev.filter((_, i) => i !== index);
                        if (updated.length === 0) {
                          setFormData((prev) => ({ ...prev, availability: [] }));
                        }
                        return updated;
                      });
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}

            <div className="mb-6">
              <button
                onClick={() =>
                  setCustomSlots((prev) => [...prev, { days: [], from: "", to: "" }])
                }
                className="text-green-600 hover:underline text-sm flex items-center gap-1"
              >
                <span className="text-lg">＋</span> Add new available time
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <button
                onClick={closeModal}
                className="border border-red-700 text-red-700 py-2 rounded w-full hover:bg-red-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="bg-red-700 text-white py-2 rounded w-full hover:bg-red-800"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
