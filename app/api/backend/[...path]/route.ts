import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error("BACKEND_URL is not configured");
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;

  const backendUrl = new URL(
    `/api/${path.join("/")}`,
    BACKEND_URL
  );

  request.nextUrl.searchParams.forEach((value, key) => {
    backendUrl.searchParams.append(key, value);
  });

  const headers = new Headers();

  // Forward headers that are relevant to the backend.
  const authorization = request.headers.get("authorization");
  const contentType = request.headers.get("content-type");
  const cookie = request.headers.get("cookie");

  if (authorization) {
    headers.set("authorization", authorization);
  }

  if (contentType) {
    headers.set("content-type", contentType);
  }

  if (cookie) {
    headers.set("cookie", cookie);
  }

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const backendResponse = await fetch(backendUrl, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });

  const responseHeaders = new Headers();

  // Forward Set-Cookie from backend → browser.
  const setCookie = backendResponse.headers.get("set-cookie");
  
  if (setCookie) {
    let rewrittenCookie = setCookie
      .replace(/;\s*Path=[^;]*/i, "; Path=/api/backend/auth")
      .replace(/;\s*SameSite=[^;]*/i, "; SameSite=Lax");
  
    if (process.env.NODE_ENV !== "production") {
      rewrittenCookie = rewrittenCookie.replace(/;\s*Secure/gi, "");
    }
  
    responseHeaders.set("set-cookie", rewrittenCookie);
  }
  
  const contentTypeResponse =
    backendResponse.headers.get("content-type");

  if (contentTypeResponse) {
    responseHeaders.set("content-type", contentTypeResponse);
  }

  return new NextResponse(backendResponse.body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;