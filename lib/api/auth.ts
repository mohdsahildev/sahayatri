import { apiFetch } from "./client";
import type {
  ApiResponse,
} from "./types";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
  User,
  VerifyOtpRequest,
} from "./auth.types";

export function register(data: RegisterRequest) {
  return apiFetch<ApiResponse<null>>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function verifyOtp(data: VerifyOtpRequest) {
  return apiFetch<ApiResponse<null>>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function resendVerificationOtp(email: string) {
  return apiFetch<ApiResponse<null>>("/auth/resend-verification-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function login(data: LoginRequest) {
  return apiFetch<ApiResponse<LoginResponse>>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function forgotPassword(data: ForgotPasswordRequest) {
  return apiFetch<ApiResponse<null>>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function resetPassword(data: ResetPasswordRequest) {
  return apiFetch<ApiResponse<null>>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function refreshToken() {
  return apiFetch<ApiResponse<{ accessToken: string }>>(
    "/auth/refresh-token",
    {
      method: "POST",
    }
  );
}

export function getMe(accessToken: string) {
  return apiFetch<ApiResponse<{ user: User }>>("/auth/me", {
    method: "GET",
    accessToken,
  });
}

export function logout(accessToken: string) {
  return apiFetch<ApiResponse<null>>("/auth/logout", {
    method: "POST",
    accessToken,
  });
}