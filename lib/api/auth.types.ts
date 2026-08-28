export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  role: "user" | "admin";
  isVerified: boolean;
  profilePic?: string;

  vehicle?: {
    type: string;
    brand: string;
    model: string;
    number: string;
    seats: number;
  };

  trustedContact?: {
    name: string;
    phone: string;
    relationship: string;
  };

  safetyPreferences?: {
    womenOnlyRides: boolean;
    verifiedOnlyRides: boolean;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
  currentLocation?: {
    name: string;
    lat: number;
    lng: number;
  };
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  password: string;
}