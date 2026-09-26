"use client";

import { useState, useRef, useEffect, useId } from "react";
import { Clock, ChevronDown, Check } from "lucide-react";

interface TimePickerProps {
  value: string; // "HH:MM" (24hr format)
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  id?: string;
  disabled?: boolean;
}

const COMMON_PRESETS = [
  { label: "Morning (07:00 AM)", value: "07:00" },
  { label: "Morning (08:30 AM)", value: "08:30" },
  { label: "Midday (12:00 PM)", value: "12:00" },
  { label: "Afternoon (02:30 PM)", value: "14:30" },
  { label: "Evening (05:30 PM)", value: "17:30" },
  { label: "Night (08:00 PM)", value: "20:00" },
];

function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

function formatDisplayTime(timeString: string): string {
  if (!timeString) return "";
  const [hStr, mStr] = timeString.split(":");
  const hour = parseInt(hStr, 10);
  const minute = mStr || "00";

  if (Number.isNaN(hour)) return timeString;

  const ampm = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minute} ${ampm}`;
}

export default function TimePicker({
  value,
  onChange,
  placeholder = "Select departure time",
  className = "",
  buttonClassName = "",
  id,
  disabled = false,
}: TimePickerProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derive 12hr parts directly from value prop
  const [valH, valM] = (value || "08:00").split(":");
  const parsedHour = parseInt(valH, 10);
  const validHour = Number.isNaN(parsedHour) ? 8 : parsedHour;
  const selectedHour12 = validHour % 12 || 12;
  const selectedMinute = valM || "00";
  const selectedPeriod: "AM" | "PM" = validHour >= 12 ? "PM" : "AM";

  // Click outside and escape listener
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

  function emitTime(h12: number, min: string, period: "AM" | "PM") {
    let h24 = h12 % 12;
    if (period === "PM") {
      h24 += 12;
    }
    const finalTime = `${padZero(h24)}:${min}`;
    onChange(finalTime);
  }

  function handleSelectPreset(presetValue: string) {
    onChange(presetValue);
    setIsOpen(false);
  }

  const hoursList = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutesList = Array.from({ length: 60 }, (_, i) => padZero(i));

  const selectedHourRef = useRef<HTMLButtonElement | null>(null);
  const selectedMinuteRef = useRef<HTMLButtonElement | null>(null);

  // Auto-scroll selected hour and minute into view when popover opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        selectedHourRef.current?.scrollIntoView({
          block: "center",
          behavior: "smooth",
        });
        selectedMinuteRef.current?.scrollIntoView({
          block: "center",
          behavior: "smooth",
        });
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
          <Clock
            size={16}
            className="text-slate-400 shrink-0 group-hover:text-[#C8522E]"
          />
          {value ? (
            <span className="font-sans text-xs sm:text-sm font-semibold text-[#1E2022] truncate">
              {formatDisplayTime(value)}
            </span>
          ) : (
            <span className="font-sans text-xs sm:text-sm font-semibold text-slate-400 truncate">
              {placeholder}
            </span>
          )}
        </div>
        <ChevronDown size={14} className="text-slate-400 shrink-0" />
      </button>

      {/* Popover Selection Box */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-auto top-full z-50 mt-2 w-[290px] sm:w-[310px] rounded-2xl border border-[#EAE6DF] bg-white p-4 shadow-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EAE6DF]/70">
            <span className="font-sans text-xs font-black text-[#1E2022] uppercase tracking-wider">
              Select Time
            </span>
            <span className="text-xs font-black text-[#C8522E] bg-[#FAF0EB] px-2.5 py-0.5 rounded-md">
              {formatDisplayTime(value || `${padZero(selectedHour12)}:${selectedMinute}`)}
            </span>
          </div>

          {/* 12hr, Minute & AM/PM Selectors */}
          <div className="grid grid-cols-3 gap-2 py-2">
            {/* Hour column */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 text-center">
                Hour
              </label>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                {hoursList.map((h) => {
                  const isSelected = selectedHour12 === h;
                  return (
                    <button
                      key={h}
                      ref={isSelected ? selectedHourRef : null}
                      type="button"
                      onClick={() => emitTime(h, selectedMinute, selectedPeriod)}
                      className={`w-full py-1 text-center font-sans text-xs font-bold rounded-lg transition ${
                        isSelected
                          ? "bg-[#C8522E] text-white"
                          : "text-[#1E2022] hover:bg-[#FAF0EB] hover:text-[#C8522E]"
                      }`}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minute column */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 text-center">
                Min
              </label>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                {minutesList.map((m) => {
                  const isSelected = selectedMinute === m;
                  return (
                    <button
                      key={m}
                      ref={isSelected ? selectedMinuteRef : null}
                      type="button"
                      onClick={() => emitTime(selectedHour12, m, selectedPeriod)}
                      className={`w-full py-1 text-center font-sans text-xs font-bold rounded-lg transition ${
                        isSelected
                          ? "bg-[#C8522E] text-white"
                          : "text-[#1E2022] hover:bg-[#FAF0EB] hover:text-[#C8522E]"
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AM/PM toggle */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 text-center">
                Period
              </label>
              <div className="space-y-1.5">
                {(["AM", "PM"] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => emitTime(selectedHour12, selectedMinute, period)}
                    className={`w-full py-2 text-center font-sans text-xs font-bold rounded-lg transition ${
                      selectedPeriod === period
                        ? "bg-[#1E2022] text-white"
                        : "bg-[#FAF8F5] border border-[#EAE6DF] text-slate-600 hover:text-[#1E2022]"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Presets Strip */}
          <div className="pt-3 mt-3 border-t border-[#EAE6DF]/70">
            <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">
              Popular Departure Times
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {COMMON_PRESETS.slice(0, 4).map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handleSelectPreset(preset.value)}
                  className="px-2 py-1 text-left text-[11px] font-semibold text-slate-600 rounded-lg hover:bg-[#FAF0EB] hover:text-[#C8522E] transition truncate"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Done Button */}
          <div className="pt-3 mt-3 border-t border-[#EAE6DF]/70 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-[#C8522E] text-white text-xs font-bold shadow-xs hover:bg-[#B34524] transition"
            >
              <Check size={12} strokeWidth={3} />
              <span>Done</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
