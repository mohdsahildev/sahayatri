import { useAuthStore } from "@/lib/stores/auth.store";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

type ApiFetchOptions = RequestInit & {
  accessToken?: string;
  _isRetry?: boolean;
};

export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { accessToken, _isRetry, ...fetchOptions } = options;

  const token = accessToken ?? useAuthStore.getState().accessToken;

  const response = await fetch(`${API_URL}/api${endpoint}`, {
    ...fetchOptions,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...fetchOptions.headers,
    },
  });

  if (response.status === 401 && !_isRetry) {
    const refreshResponse = await fetch(`${API_URL}/api/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();
      const newAccessToken = refreshData.data.accessToken;

      const { user } = useAuthStore.getState();

      if (user) {
        useAuthStore.getState().setAuth(user, newAccessToken);
      }

      return apiFetch<T>(endpoint, {
        ...options,
        accessToken: newAccessToken,
        _isRetry: true,
      });
    }

    useAuthStore.getState().clearAuth();
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}