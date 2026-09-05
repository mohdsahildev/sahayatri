"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { refreshToken, getMe } from "@/lib/api/auth";
import {
  connectSocket,
  disconnectSocket,
} from "@/lib/socket";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isRestoring, setIsRestoring] = useState(true);

  const accessToken = useAuthStore(
    (state) => state.accessToken
  );

  const setAuth = useAuthStore(
    (state) => state.setAuth
  );

  const clearAuth = useAuthStore(
    (state) => state.clearAuth
  );

  useEffect(() => {
    async function restoreSession() {
      try {
        const refreshResponse = await refreshToken();

        const token =
          refreshResponse.data.accessToken;

        const meResponse = await getMe(token);

        setAuth(
          meResponse.data.user,
          token
        );
      } catch {
        clearAuth();
      } finally {
        setIsRestoring(false);
      }
    }

    restoreSession();
  }, [setAuth, clearAuth]);

  useEffect(() => {
    if (!accessToken) {
      disconnectSocket();
      return;
    }

    connectSocket(accessToken);

    return () => {
      disconnectSocket();
    };
  }, [accessToken]);

  if (isRestoring) {
    return null;
  }

  return children;
}