"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { refreshToken, getMe } from "@/lib/api/auth";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isRestoring, setIsRestoring] = useState(true);

  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    async function restoreSession() {
      try {
        const refreshResponse = await refreshToken();

        const accessToken =
          refreshResponse.data.accessToken;

        const meResponse = await getMe(accessToken);

        setAuth(
          meResponse.data.user,
          accessToken
        );
      } catch {
        clearAuth();
      } finally {
        setIsRestoring(false);
      }
    }

    restoreSession();
  }, [setAuth, clearAuth]);

  if (isRestoring) {
    return null;
  }

  return children;
}