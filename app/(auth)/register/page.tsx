"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { register } from "@/lib/api/auth";
import AuthShell from "@/components/auth/auth-shell";
import GoogleAuthButton from "@/components/auth/google-auth-button";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      await register({
        name,
        email,
        password,
      });

      router.push(
        `/verify-otp?email=${encodeURIComponent(email)}`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create your account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell activePage="register">
      <div>
        {/* Header section */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0EB] text-[#C8522E] text-xs font-semibold tracking-wider uppercase mb-3">
            Get Started
          </div>
          <h1 className="font-sans text-3xl font-extrabold tracking-tight text-[#1E2022]">
            Create your SahaYatri account
          </h1>
          <p className="mt-2 text-sm text-[#5A6068]">
            Join people sharing the same roads and everyday journeys.
          </p>
        </div>

        {/* Google OAuth Option */}
        <div className="space-y-4 mb-5">
          <GoogleAuthButton label="Sign up with Google" />

          <div className="relative flex items-center justify-center pt-1">
            <div className="w-full border-t border-[#EBE6DE]" />
            <span className="absolute bg-[#FAF8F5] px-3 font-sans text-xs font-semibold uppercase tracking-wider text-[#8C929A]">
              or register with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-xs font-bold uppercase tracking-wider text-[#1E2022]"
            >
              Full Name
            </label>
            <div className="relative mt-1.5">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C929A] pointer-events-none" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                autoComplete="name"
                className="w-full rounded-2xl border border-[#EBE6DE] bg-white pl-11 pr-4 py-3.5 text-sm text-[#1E2022] placeholder-[#9CA3AF] outline-none transition focus:border-[#C8522E] focus:ring-2 focus:ring-[#C8522E]/10"
                placeholder="e.g. Aayush Sharma"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold uppercase tracking-wider text-[#1E2022]"
            >
              Email address
            </label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C929A] pointer-events-none" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-2xl border border-[#EBE6DE] bg-white pl-11 pr-4 py-3.5 text-sm text-[#1E2022] placeholder-[#9CA3AF] outline-none transition focus:border-[#C8522E] focus:ring-2 focus:ring-[#C8522E]/10"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-wider text-[#1E2022]"
            >
              Password
            </label>
            <div className="relative mt-1.5">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C929A] pointer-events-none" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="new-password"
                className="w-full rounded-2xl border border-[#EBE6DE] bg-white pl-11 pr-11 py-3.5 text-sm text-[#1E2022] placeholder-[#9CA3AF] outline-none transition focus:border-[#C8522E] focus:ring-2 focus:ring-[#C8522E]/10"
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C727A] hover:text-[#1E2022] p-1.5 rounded-lg focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 p-3.5 text-sm text-red-700 flex items-start gap-2.5">
              <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-[#C8522E] px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#B04322] focus:outline-none focus:ring-2 focus:ring-[#C8522E] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Creating account...
              </span>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#EBE6DE] text-center">
          <p className="text-sm text-[#5A6068]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-[#C8522E] hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}