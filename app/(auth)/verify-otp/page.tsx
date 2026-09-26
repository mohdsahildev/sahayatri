"use client";

import { Suspense, useState, useRef, useEffect, FormEvent, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyOtp, resendVerificationOtp, refreshToken, getMe } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth.store";
import AuthShell from "@/components/auth/auth-shell";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const setAuth = useAuthStore((state) => state.setAuth);

  const [email] = useState(emailParam);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Focus first input on mount
  useEffect(() => {
    if (email) {
      inputRefs[0].current?.focus();
    }
  }, [email]);

  // Handle countdown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      setDigits(nextDigits);
      return;
    }

    const char = cleaned[cleaned.length - 1];
    const nextDigits = [...digits];
    nextDigits[index] = char;
    setDigits(nextDigits);
    setError("");

    // Auto focus next input
    if (index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const nextDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      nextDigits[i] = pasted[i] || "";
    }
    setDigits(nextDigits);
    setError("");

    const focusIndex = Math.min(pasted.length, 5);
    inputRefs[focusIndex].current?.focus();
  };

  const otpValue = digits.join("");
  const isComplete = otpValue.length === 6;

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!email) {
      setError("Missing email address. Please return to registration.");
      return;
    }
    if (!isComplete) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setError("");
    setResendMessage("");
    setIsLoading(true);

    try {
      const response = await verifyOtp({
        email,
        otp: otpValue,
      });

      // If backend response directly provides session tokens and user
      const responseData = (response as unknown as { data?: { accessToken?: string; user?: any } })?.data;
      if (responseData?.accessToken && responseData?.user) {
        setAuth(responseData.user, responseData.accessToken);
        router.push("/home");
        return;
      }

      // Check if session cookies are present by attempting refresh token
      try {
        const refreshResponse = await refreshToken();
        const token = refreshResponse.data.accessToken;
        if (token) {
          const meResponse = await getMe(token);
          setAuth(meResponse.data.user, token);
          router.push("/home");
          return;
        }
      } catch {
        // If no automatic session, redirect to login with verified notice
        router.push(`/login?email=${encodeURIComponent(email)}&verified=true`);
        return;
      }

      router.push("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email || cooldown > 0 || resendLoading) return;

    setError("");
    setResendMessage("");
    setResendLoading(true);

    try {
      await resendVerificationOtp(email);
      setResendMessage("A fresh verification code has been sent to your email.");
      setCooldown(45);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend verification code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) {
    return (
      <div>
        <div className="rounded-3xl border border-[#EBE6DE] bg-white p-7 sm:p-9 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-[#1E2022]">Email Missing</h1>
          <p className="mt-2 text-sm text-[#6C727A]">
            No email address was provided for verification. Please register or log in first.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              href="/register"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-[#C8522E] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#B04322]"
            >
              Go to Registration
            </Link>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-[#EBE6DE] bg-[#FAF8F5] px-4 py-3 text-sm font-medium text-[#1E2022] hover:bg-[#F2EFE9] transition"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Eyebrow & Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0EB] text-[#C8522E] text-xs font-semibold tracking-wider uppercase mb-3">
          One More Step
        </div>
        <h1 className="font-sans text-3xl font-extrabold tracking-tight text-[#1E2022]">
          Verify your email
        </h1>
        <p className="mt-2 text-sm text-[#5A6068] leading-relaxed">
          Enter the 6-digit code we sent to{" "}
          <span className="font-semibold text-[#1E2022] break-all">{email}</span>
        </p>
      </div>

      {/* OTP Input Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 6 Digit Boxes */}
        <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={isLoading}
              autoComplete="one-time-code"
              className={`h-12 w-11 sm:h-14 sm:w-13 rounded-2xl border text-center text-xl sm:text-2xl font-bold outline-none transition duration-150 ${
                digit
                  ? "border-[#C8522E] bg-white text-[#1E2022] shadow-sm ring-2 ring-[#C8522E]/10"
                  : "border-[#EBE6DE] bg-white text-[#1E2022] focus:border-[#C8522E] focus:ring-2 focus:ring-[#C8522E]/10"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            />
          ))}
        </div>

        {/* Feedback & Errors */}
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-3.5 text-sm text-red-700 flex items-start gap-2.5">
            <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {resendMessage && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-sm text-emerald-700 flex items-start gap-2.5">
            <svg className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{resendMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isComplete || isLoading}
          className="w-full rounded-2xl bg-[#C8522E] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#B04322] focus:outline-none focus:ring-2 focus:ring-[#C8522E] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <span className="inline-flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Verifying...
            </span>
          ) : (
            "Verify email"
          )}
        </button>
      </form>

      {/* Resend Option */}
      <div className="mt-6 pt-5 border-t border-[#EBE6DE] text-center">
        <p className="text-xs text-[#5A6068]">
          Didn&apos;t receive the code?{" "}
          {cooldown > 0 ? (
            <span className="font-semibold text-[#1E2022]">Resend in {cooldown}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendLoading || isLoading}
              className="font-semibold text-[#C8522E] hover:underline disabled:opacity-50 inline-flex items-center cursor-pointer"
            >
              {resendLoading ? "Sending..." : "Resend code"}
            </button>
          )}
        </p>

        <div className="mt-4 flex items-center justify-center gap-4 text-xs font-medium text-[#6C727A]">
          <Link href="/register" className="hover:text-[#1E2022] hover:underline">
            Back to registration
          </Link>
          <span>•</span>
          <Link href="/login" className="hover:text-[#1E2022] hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <AuthShell activePage="verify-otp">
      <Suspense
        fallback={
          <div className="py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#C8522E] border-t-transparent" />
            <p className="mt-4 text-sm text-[#6C727A]">Loading verification...</p>
          </div>
        }
      >
        <VerifyOtpContent />
      </Suspense>
    </AuthShell>
  );
}
