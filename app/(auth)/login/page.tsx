"use client";

import { Suspense, FormEvent, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { login } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth.store";
import AuthShell from "@/components/auth/auth-shell";
import GoogleAuthButton from "@/components/auth/google-auth-button";

function getOAuthErrorMessage(err: string | null): string {
  if (!err) return "";
  if (err === "google_oauth_failed") {
    return "Google sign-in was unsuccessful. Please try again or use your password.";
  }
  if (err === "google_user_missing") {
    return "Unable to retrieve account details from Google. Please try again.";
  }
  return "Authentication failed. Please try again.";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const isVerified = searchParams.get("verified") === "true";
  const oauthError = searchParams.get("error");
  const oauthErrorMessage = getOAuthErrorMessage(oauthError);

  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const activeError = error || oauthErrorMessage;

  useEffect(() => {
    if (initialEmail && !email) {
      setEmail(initialEmail);
    }
  }, [initialEmail, email]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const response = await login({
        email,
        password,
      });

      setAuth(
        response.data.user,
        response.data.accessToken
      );

      router.push("/home");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to log in. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      {/* Header section */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF0EB] text-[#C8522E] text-xs font-semibold tracking-wider uppercase mb-3">
          Welcome Back
        </div>
        <h1 className="font-sans text-3xl font-extrabold tracking-tight text-[#1E2022]">
          Log in to SahaYatri
        </h1>
        <p className="mt-2 text-sm text-[#5A6068]">
          Enter your credentials to continue your journey.
        </p>
      </div>

      {isVerified && (
        <div className="mb-5 rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-sm text-emerald-800 flex items-start gap-3">
          <svg className="h-5 w-5 text-[#2E6F40] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="font-semibold text-emerald-900">Email verified</p>
            <p className="text-xs text-emerald-700 mt-0.5">Your email has been confirmed. You can now log in.</p>
          </div>
        </div>
      )}

      {/* Google OAuth Option */}
      <div className="space-y-4 mb-5">
        <GoogleAuthButton label="Continue with Google" />

        <div className="relative flex items-center justify-center pt-1">
          <div className="w-full border-t border-[#EBE6DE]" />
          <span className="absolute bg-[#FAF8F5] px-3 font-sans text-xs font-semibold uppercase tracking-wider text-[#8C929A]">
            or sign in with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-wider text-[#1E2022]"
            >
              Password
            </label>
          </div>
          <div className="relative mt-1.5">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C929A] pointer-events-none" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-2xl border border-[#EBE6DE] bg-white pl-11 pr-11 py-3.5 text-sm text-[#1E2022] placeholder-[#9CA3AF] outline-none transition focus:border-[#C8522E] focus:ring-2 focus:ring-[#C8522E]/10"
              placeholder="Enter your password"
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

        {activeError && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-3.5 text-sm text-red-700 flex items-start gap-2.5">
            <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{activeError}</span>
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
              Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-[#EBE6DE] text-center">
        <p className="text-sm text-[#5A6068]">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-bold text-[#C8522E] hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthShell activePage="login">
      <Suspense
        fallback={
          <div className="py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#C8522E] border-t-transparent" />
            <p className="mt-4 text-sm text-[#6C727A]">Loading sign in...</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}