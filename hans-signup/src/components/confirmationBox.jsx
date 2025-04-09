import React from 'react';
import Select from 'react-select';
import { useFormData } from './FormDataContext';
import moment from 'moment-timezone';

const dayLabels = {
  1: "Sun",
  2: "Mon",
  3: "Tue",
  4: "Wed",
  5: "Thu",
  6: "Fri",
  7: "Sat",
};

const formatTime = (time) => {
  if (!time) return "";
  const [hourStr, minutes] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour.toString().padStart(2, '0')} : ${minutes} ${suffix}`;
};

const ConfirmationBox = () => {
  const { formData, setFormData } = useFormData();
  const { availability = [], timezone } = formData;

  const timeOptions = moment.tz.names().map((tz) => ({
    value: tz,
    label: `🌍 ${tz} (GMT ${moment.tz(tz).format("Z")})`,
  }));

  const selectedTime = timezone
    ? {
        value: timezone,
        label: `🌍 ${timezone} (GMT ${moment.tz(timezone).format("Z")})`,
      }
    : null;

  const handleTimeZoneChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      timezone: selectedOption.value,
    }));
  };

  return (
    <div className="max-w-xl mx-auto p-4 mt-6 text-center text-base">
      <h3 className="text-black font-semibold text-lg mb-4">
        When would you like to take your lessons?
      </h3>

      <div className="w-full max-w-md mx-auto mb-6">
        <Select
          options={timeOptions}
          value={selectedTime}
          onChange={handleTimeZoneChange}
          isSearchable
          placeholder="Search your timezone..."
          className="custom-select"
          styles={{
            control: (base) => ({
              ...base,
              borderColor: "#D1D5DB",
              borderRadius: "0.5rem",
              fontSize: "0.95rem",
              padding: "2px",
              color: "black",
            }),
            singleValue: (base) => ({
              ...base,
              color: "black",
              fontWeight: "500",
            }),
            input: (base) => ({
              ...base,
              color: "black",
            }),
          }}
        />
      </div>

      {availability.length > 0 ? (
        <div className="space-y-3">
          {availability.map((slot, index) => (
            <div
              key={index}
              className="flex items-center justify-center gap-4 px-4 py-2 bg-gray-100 rounded-md text-base w-fit mx-auto"
            >
              <span className="bg-white px-4 py-1 rounded-full border font-semibold text-black">
                {dayLabels[slot.day_index]}
              </span>
              <span className="text-green-600 font-semibold">
                {formatTime(slot.start_time)} To {formatTime(slot.end_time)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mt-4">No availability selected.</p>
      )}
    </div>
  );
};

export default ConfirmationBox;
