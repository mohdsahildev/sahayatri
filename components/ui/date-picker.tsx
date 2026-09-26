"use client";

import { useState, useRef, useEffect, useId } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface DatePickerProps {
  value: string; // "YYYY-MM-DD" format
  onChange: (value: string) => void;
  minDate?: string; // "YYYY-MM-DD"
  maxDate?: string; // "YYYY-MM-DD"
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

function formatDateToIso(date: Date): string {
  return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(
    date.getDate()
  )}`;
}

function parseIsoToDate(isoString: string): Date | null {
  if (!isoString) return null;
  const [year, month, day] = isoString.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export default function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "Select date",
  className = "",
  buttonClassName = "",
  id,
  disabled = false,
  allowClear = false,
}: DatePickerProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value or fallback to today for view navigation
  const selectedDate = parseIsoToDate(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // User navigation month override (null means follow selectedDate / today)
  const [navYear, setNavYear] = useState<number | null>(null);
  const [navMonth, setNavMonth] = useState<number | null>(null);

  const viewYear =
    navYear ??
    (selectedDate ? selectedDate.getFullYear() : today.getFullYear());
  const viewMonth =
    navMonth ??
    (selectedDate ? selectedDate.getMonth() : today.getMonth());

  // Click outside and escape key handling
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const min = minDate ? parseIsoToDate(minDate) : null;
  if (min) min.setHours(0, 0, 0, 0);

  const max = maxDate ? parseIsoToDate(maxDate) : null;
  if (max) max.setHours(0, 0, 0, 0);

  function handlePrevMonth() {
    if (viewMonth === 0) {
      setNavMonth(11);
      setNavYear(viewYear - 1);
    } else {
      setNavMonth(viewMonth - 1);
      setNavYear(viewYear);
    }
  }

  function handleNextMonth() {
    if (viewMonth === 11) {
      setNavMonth(0);
      setNavYear(viewYear + 1);
    } else {
      setNavMonth(viewMonth + 1);
      setNavYear(viewYear);
    }
  }

  function handleSelectDate(day: number) {
    const chosen = new Date(viewYear, viewMonth, day);
    const iso = formatDateToIso(chosen);
    onChange(iso);
    setNavYear(null);
    setNavMonth(null);
    setIsOpen(false);
  }

  function handleQuickSelect(type: "today" | "tomorrow" | "weekend") {
    const target = new Date();
    target.setHours(0, 0, 0, 0);

    if (type === "tomorrow") {
      target.setDate(target.getDate() + 1);
    } else if (type === "weekend") {
      const currentDay = target.getDay(); // 0 is Sun, 6 is Sat
      const daysUntilSaturday = currentDay === 6 ? 0 : (6 - currentDay + 7) % 7;
      target.setDate(target.getDate() + (daysUntilSaturday === 0 ? 0 : daysUntilSaturday));
    }

    onChange(formatDateToIso(target));
    setNavYear(null);
    setNavMonth(null);
    setIsOpen(false);
  }

  // Calculate calendar grid days
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 (Sun) to 6 (Sat)
  // Convert so Monday is 0, Sunday is 6
  const startDayOffset = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Format label for display on the trigger button
  function formatDisplayDate(isoString: string): string {
    const date = parseIsoToDate(isoString);
    if (!date) return "";

    const dateWithoutTime = new Date(date);
    dateWithoutTime.setHours(0, 0, 0, 0);

    const timeDiff = dateWithoutTime.getTime() - today.getTime();
    const dayDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));

    if (dayDiff === 0) {
      return `Today, ${date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })}`;
    }

    if (dayDiff === 1) {
      return `Tomorrow, ${date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })}`;
    }

    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year:
        date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        id={inputId}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2 text-left transition outline-none cursor-pointer ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <CalendarIcon
            size={16}
            className="text-slate-400 shrink-0 group-hover:text-[#C8522E]"
          />
          {value ? (
            <span className="font-sans text-xs sm:text-sm font-semibold text-[#1E2022] truncate">
              {formatDisplayDate(value)}
            </span>
          ) : (
            <span className="font-sans text-xs sm:text-sm font-semibold text-slate-400 truncate">
              {placeholder}
            </span>
          )}
        </div>

        {allowClear && value && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="p-1 rounded-full text-slate-400 hover:text-[#1E2022] hover:bg-slate-100 transition"
            aria-label="Clear date"
          >
            <X size={13} />
          </button>
        )}
      </button>

      {/* Popover Calendar Modal */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-auto top-full z-50 mt-2 w-[310px] rounded-2xl border border-[#EAE6DF] bg-white p-4 shadow-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Quick Shortcuts */}
          <div className="flex items-center gap-1.5 pb-3 mb-3 border-b border-[#EAE6DF]/70">
            <button
              type="button"
              onClick={() => handleQuickSelect("today")}
              className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] text-[11px] font-bold text-slate-600 hover:bg-[#FAF0EB] hover:text-[#C8522E] hover:border-[#C8522E]/40 transition"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect("tomorrow")}
              className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] text-[11px] font-bold text-slate-600 hover:bg-[#FAF0EB] hover:text-[#C8522E] hover:border-[#C8522E]/40 transition"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect("weekend")}
              className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#EAE6DF] text-[11px] font-bold text-slate-600 hover:bg-[#FAF0EB] hover:text-[#C8522E] hover:border-[#C8522E]/40 transition"
            >
              Weekend
            </button>
          </div>

          {/* Month & Year Navigation Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <h4 className="font-sans text-sm font-black text-[#1E2022]">
              {MONTHS[viewMonth]} {viewYear}
            </h4>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-[#FAF8F5] hover:text-[#1E2022] transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-[#FAF8F5] hover:text-[#1E2022] transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 text-center mb-1">
            {WEEKDAYS.map((wd) => (
              <span
                key={wd}
                className="text-[11px] font-bold uppercase text-slate-400 py-1"
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Previous Month trailing days */}
            {Array.from({ length: startDayOffset }).map((_, idx) => {
              const dayNum = daysInPrevMonth - startDayOffset + idx + 1;
              return (
                <div
                  key={`prev-${idx}`}
                  className="flex h-8 items-center justify-center text-xs font-semibold text-slate-300"
                >
                  {dayNum}
                </div>
              );
            })}

            {/* Current Month days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const currentDate = new Date(viewYear, viewMonth, dayNum);
              currentDate.setHours(0, 0, 0, 0);

              const isPast = min ? currentDate < min : false;
              const isFuture = max ? currentDate > max : false;
              const isDisabled = isPast || isFuture;

              const isSelected =
                selectedDate &&
                selectedDate.getFullYear() === viewYear &&
                selectedDate.getMonth() === viewMonth &&
                selectedDate.getDate() === dayNum;

              const isToday =
                today.getFullYear() === viewYear &&
                today.getMonth() === viewMonth &&
                today.getDate() === dayNum;

              return (
                <button
                  key={`cur-${dayNum}`}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDate(dayNum)}
                  className={`flex h-8 w-full items-center justify-center rounded-lg font-sans text-xs font-bold transition ${
                    isSelected
                      ? "bg-[#C8522E] text-white shadow-xs"
                      : isToday
                      ? "border border-[#C8522E] text-[#C8522E] hover:bg-[#FAF0EB]"
                      : isDisabled
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-[#1E2022] hover:bg-[#FAF0EB] hover:text-[#C8522E]"
                  }`}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
