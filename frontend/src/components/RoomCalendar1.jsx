// src/components/RoomCalendar.jsx
import React, { useState } from "react";
import { Calendar } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

/*
Props:
- bookedRanges: [{ start: "YYYY-MM-DD", end: "YYYY-MM-DD" }]
- onSelect(dateObj)
- readOnly: boolean
- onClickBooked({ start, end, date })
*/

export default function RoomCalendar({
  bookedRanges = [],
  onSelect = () => {},
  onClickBooked = () => {},
  readOnly = false
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // disable booked dates
  const disabledDates = [];
  bookedRanges.forEach(b => {
    const start = new Date(b.start);
    const end = new Date(b.end);
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      disabledDates.push(new Date(d));
    }
  });

  // detect click on booked date
  const handleDayClick = (date) => {
    const iso = date.toISOString().slice(0,10);

    const match = bookedRanges.find(b => iso >= b.start && iso < b.end);

    if (match) {
      onClickBooked({ ...match, date: iso });
      return;
    }

    if (!readOnly) onSelect(date);
  };

  return (
    <div>
      {/* Month Navigation */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 10 }}>
        <button
          onClick={() => {
            const d = new Date(currentDate);
            d.setMonth(d.getMonth() - 1);
            setCurrentDate(d);
          }}
          style={btnStyle}
        >
          ◀ Prev
        </button>

        <button
          onClick={() => {
            const d = new Date(currentDate);
            d.setMonth(d.getMonth() + 1);
            setCurrentDate(d);
          }}
          style={btnStyle}
        >
          Next ▶
        </button>
      </div>

      <Calendar
        date={currentDate}
        onChange={handleDayClick}
        disabledDates={disabledDates}
        color="#4CAF50"
      />
    </div>
  );
}

const btnStyle = {
  padding: "6px 12px",
  background: "#1976d2",
  border: "none",
  color: "#fff",
  borderRadius: 6,
  cursor: "pointer"
};
