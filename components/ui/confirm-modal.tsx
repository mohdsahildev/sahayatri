"use client";

import { useEffect } from "react";
import { X, Loader2, AlertCircle, AlertTriangle } from "lucide-react";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "warning" | "dark";
  icon?: React.ReactNode;
  category?: string;
  error?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Keep Ride",
  variant = "primary",
  icon,
  category,
  error,
}: ConfirmModalProps) {
  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const isDanger = variant === "danger";
  const isWarning = variant === "warning";
  const isDark = variant === "dark";

  const iconContainerClass = isDanger
    ? "bg-[#FFF1F0] border-[#FADBD8] text-[#C8522E]"
    : isWarning
    ? "bg-[#FFFBF0] border-amber-200 text-amber-600"
    : isDark
    ? "bg-[#FAF8F5] border-[#EAE6DF] text-[#1E2022]"
    : "bg-[#FAF0EB] border-[#C8522E]/20 text-[#C8522E]";

  const categoryTextClass = isDanger
    ? "text-[#C8522E]"
    : isWarning
    ? "text-amber-600"
    : isDark
    ? "text-slate-500"
    : "text-[#C8522E]";

  const confirmBtnClass = isDanger
    ? "bg-[#C8522E] hover:bg-[#B34524] text-white"
    : isWarning
    ? "bg-amber-600 hover:bg-amber-700 text-white"
    : isDark
    ? "bg-[#1E2022] hover:bg-slate-800 text-white"
    : "bg-[#C8522E] hover:bg-[#B34524] text-white";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-md rounded-3xl border border-[#EAE6DF] bg-white p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          aria-label="Close modal"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-[#FAF8F5] hover:text-[#1E2022] transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <X size={18} />
        </button>

        {/* Icon & Title Header */}
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${iconContainerClass}`}
          >
            {icon || (isDanger ? <AlertCircle size={24} /> : isWarning ? <AlertTriangle size={24} /> : <AlertCircle size={24} />)}
          </div>

          <div className="flex-1 pr-6">
            {category && (
              <span className={`text-[10px] font-black uppercase tracking-wider ${categoryTextClass}`}>
                {category}
              </span>
            )}
            <h2
              id="confirm-modal-title"
              className="mt-0.5 font-sans text-xl font-black tracking-tight text-[#1E2022]"
            >
              {title}
            </h2>
          </div>
        </div>

        {/* Description Body */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {description}
        </p>

        {/* Error Feedback */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700 animate-in fade-in duration-150">
            <AlertCircle size={16} className="shrink-0 text-rose-500 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Action failed</span>
              <span className="text-rose-600">{error}</span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex h-11 w-full sm:flex-1 items-center justify-center rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-4 font-sans text-xs font-bold text-slate-700 transition hover:bg-white hover:border-[#1E2022] active:scale-98 disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex h-11 w-full sm:flex-1 items-center justify-center gap-2 rounded-xl px-4 font-sans text-xs font-bold shadow-xs transition active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed ${confirmBtnClass}`}
          >
            {isLoading && <Loader2 size={14} className="animate-spin" />}
            <span>{isLoading ? "Processing..." : confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

