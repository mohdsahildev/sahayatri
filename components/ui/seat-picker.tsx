"use client";

import { useState, useRef, useEffect, useId } from "react";
import { Users, Minus, Plus, ChevronDown } from "lucide-react";

interface SeatPickerProps {
  value: string | number;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  id?: string;
  disabled?: boolean;
}

export default function SeatPicker({
  value,
  onChange,
  min = 1,
  max = 8,
  placeholder = "Select seats",
  className = "",
  buttonClassName = "",
  id,
  disabled = false,
}: SeatPickerProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentCount = parseInt(String(value), 10) || min;

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

  function handleDecrement() {
    if (currentCount > min) {
      onChange(String(currentCount - 1));
    }
  }

  function handleIncrement() {
    if (currentCount < max) {
      onChange(String(currentCount + 1));
    }
  }

  function handleSelect(num: number) {
    onChange(String(num));
  }

  const quickPillCounts = [1, 2, 3, 4, 5, 6];

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
          <Users
            size={16}
            className="text-slate-400 shrink-0 group-hover:text-[#C8522E]"
          />
          <span className="font-sans text-xs sm:text-sm font-semibold text-[#1E2022] truncate">
            {currentCount ? `${currentCount} ${currentCount === 1 ? "Seat" : "Seats"}` : placeholder}
          </span>
        </div>
        <ChevronDown size={14} className="text-slate-400 shrink-0" />
      </button>

      {/* Popover Selection Box */}
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 top-full z-50 mt-2 w-[260px] rounded-2xl border border-[#EAE6DF] bg-white p-4 shadow-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EAE6DF]/70">
            <div>
              <h4 className="font-sans text-xs font-black text-[#1E2022] uppercase tracking-wider">
                Passengers
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Seats needed for this ride
              </p>
            </div>
            <span className="text-xs font-black text-[#C8522E] bg-[#FAF0EB] px-2.5 py-0.5 rounded-md">
              {currentCount} {currentCount === 1 ? "Seat" : "Seats"}
            </span>
          </div>

          {/* Stepper Counter */}
          <div className="flex items-center justify-between bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl p-2 mb-3">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={currentCount <= min}
              aria-label="Decrease seat count"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-[#EAE6DF] text-[#1E2022] shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Minus size={14} />
            </button>

            <span className="font-sans text-base font-black text-[#1E2022]">
              {currentCount}
            </span>

            <button
              type="button"
              onClick={handleIncrement}
              disabled={currentCount >= max}
              aria-label="Increase seat count"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-[#EAE6DF] text-[#1E2022] shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Quick Select Number Pills */}
          <div>
            <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">
              Quick Select
            </span>
            <div className="grid grid-cols-6 gap-1.5">
              {quickPillCounts.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleSelect(num)}
                  className={`flex h-8 w-full items-center justify-center rounded-lg font-sans text-xs font-bold transition ${
                    currentCount === num
                      ? "bg-[#C8522E] text-white shadow-xs"
                      : "bg-[#FAF8F5] border border-[#EAE6DF] text-[#1E2022] hover:bg-[#FAF0EB] hover:text-[#C8522E]"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
