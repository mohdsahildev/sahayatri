"use client";

import { useEffect } from "react";
import { apiFetch } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/auth.store";

interface MeResponse {
  success: boolean;
  message: string;
  data: {
    user: {
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
    };
  };
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setAuth = useAuthStore(
    (state) => state.setAuth
  );

  const setHydrated = useAuthStore(
    (state) => state.setHydrated
  );

  useEffect(() => {
    async function restoreSession() {
      try {
        const storedToken =
          useAuthStore.getState().accessToken;
    
        let token: string;
    
        if (storedToken) {
          token = storedToken;
        } else {
          const refreshResponse = await fetch(
            "/api/backend/auth/refresh-token",
            {
              method: "POST",
              credentials: "include",
            }
          );
      
          if (!refreshResponse.ok) {
            return;
          }
      
          const refreshData =
            await refreshResponse.json();
      
          token = refreshData.data.accessToken;
        }
    
        const response =
          await apiFetch<MeResponse>(
            "/auth/me",
            {
              accessToken: token,
            }
          );
      
        setAuth(
          response.data.user,
          token
        );
      } catch {
        useAuthStore.getState().clearAuth();
      } finally {
        setHydrated();
      }
    }

    restoreSession();
  }, [setAuth, setHydrated]);

  return children;
}