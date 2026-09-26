"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [isRestoring, setIsRestoring] = useState(true);
  const authInitiatedRef = useRef(false);

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
    if (authInitiatedRef.current) {
      return;
    }
    authInitiatedRef.current = true;

    async function initializeSession() {
      // 1. Check if OAuth redirect provided token in URL query
      if (typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);
        const oauthToken = searchParams.get("token");

        if (oauthToken) {
          try {
            const meResponse = await getMe(oauthToken);
            if (meResponse?.data?.user) {
              setAuth(meResponse.data.user, oauthToken);

              // Strip token from browser URL without leaving JWT in history
              if (window.history.replaceState) {
                const cleanUrl = new URL(window.location.href);
                cleanUrl.searchParams.delete("token");
                cleanUrl.searchParams.delete("name");
                cleanUrl.searchParams.delete("profilePic");
                window.history.replaceState(
                  {},
                  "",
                  cleanUrl.pathname === "/"
                    ? "/home"
                    : cleanUrl.pathname + cleanUrl.search
                );
              }

              router.replace("/home");
              return;
            }
          } catch (error) {
            console.error("OAuth token verification failed:", error);
            clearAuth();
            router.replace("/login?error=google_oauth_failed");
            return;
          } finally {
            setIsRestoring(false);
          }
        }
      }

      // 2. Standard session restoration via refresh-token cookie
      try {
        const refreshResponse = await refreshToken();
        const token = refreshResponse.data?.accessToken;

        if (token) {
          const meResponse = await getMe(token);
          if (meResponse?.data?.user) {
            setAuth(meResponse.data.user, token);
          }
        }
      } catch {
        clearAuth();
      } finally {
        setIsRestoring(false);
      }
    }

    initializeSession();
  }, [setAuth, clearAuth, router]);

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