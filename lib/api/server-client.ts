import "server-only";

import { cookies } from "next/headers";

type ServerApiFetchOptions = RequestInit & {
  accessToken?: string;
};

export async function serverApiFetch<T>(
  endpoint: string,
  options: ServerApiFetchOptions = {}
): Promise<T> {
  const { accessToken, ...fetchOptions } = options;

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  let token = accessToken;

  // If the caller doesn't already have an access token,
  // use the refresh token to obtain one.
  if (!token && refreshToken) {
    const refreshResponse = await fetch(
      `${process.env.BACKEND_URL}/api/auth/refresh-token`,
      {
        method: "POST",
        headers: {
          Cookie: `refreshToken=${refreshToken}`,
        },
        cache: "no-store",
      }
    );

    if (refreshResponse.ok) {
      const refreshData = await refreshResponse.json();
      token = refreshData.data.accessToken;
    }
  }

  const response = await fetch(
    `${process.env.BACKEND_URL}${endpoint}`,
    {
      ...fetchOptions,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
        ...fetchOptions.headers,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong"
    );
  }

  return data;
}