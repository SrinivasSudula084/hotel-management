// src/components/RoomCalendar.jsx
import React, { useState } from "react";
import { DateRange } from "react-date-range";
import "./RoomCalendar.css";

export default function RoomCalendar({ bookedRanges = [], onSelect }) {
  // ensure we always start with valid Date objects (react-date-range dislikes null)
  const today = new Date();
  const [range, setRange] = useState([
    { startDate: today, endDate: today, key: "selection" },
  ]);

  // convert a Date returned by react-date-range into a local-day Date (midnight local)
  // Explanation: react-date-range can return a Date that's interpreted relative to UTC.
  // To convert safely to the actual local day clicked we adjust by the timezone offset.
  const toLocalMidnight = (d) => {
    if (!d) return null;
    // Add timezone offset (subtract because getTimezoneOffset() = UTC - local in minutes)
    const localMs = d.getTime() - d.getTimezoneOffset() * 60000;
    const local = new Date(localMs);
    // Normalize to midnight local (remove hours)
    return new Date(local.getFullYear(), local.getMonth(), local.getDate());
  };

  // build disabled dates array (normalized to local midnight)
  const disabledDates = [];
  bookedRanges.forEach((b) => {
    let current = new Date(b.start);
    const end = new Date(b.end);
    current.setHours(0, 0, 0, 0);
    while (current <= end) {
      disabledDates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  });

  // handle selection from the calendar
  const handleSelect = (item) => {
    // item.selection.startDate / endDate are Date objects from the picker
    const start = toLocalMidnight(item.selection.startDate || today);
    const end = toLocalMidnight(item.selection.endDate || item.selection.startDate || today);

    const fixed = [
      {
        startDate: start,
        endDate: end,
        key: "selection",
      },
    ];

    setRange(fixed);

    // debug: inspect what we are sending to parent
    // open your browser console to check these logs when selecting a date
    console.log("RoomCalendar selection (local):", {
      startDateISO: start?.toISOString(),
      endDateISO: end?.toISOString(),
      startDateLocal: start?.toString(),
      endDateLocal: end?.toString(),
    });

    // notify parent with local-midnight dates
    if (typeof onSelect === "function") {
      onSelect({ startDate: start, endDate: end });
    }
  };

  return (
    <div className="cal-wrapper">
      <DateRange
        ranges={range}
        onChange={handleSelect}
        minDate={today}
        disabledDates={disabledDates}
        moveRangeOnFirstSelection={false}
        rangeColors={["#ff6b88"]}
        showDateDisplay={false}
        months={2}
        direction="horizontal"
      />
    </div>
  );
}
