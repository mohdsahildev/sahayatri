import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error("BACKEND_URL is not configured");
}

async function proxy(request: NextRequest) {
  const backendUrl = new URL(
    "/socket.io/",
    BACKEND_URL
  );

  request.nextUrl.searchParams.forEach(
    (value, key) => {
      backendUrl.searchParams.append(key, value);
    }
  );

  const headers = new Headers();

  const contentType =
    request.headers.get("content-type");

  if (contentType) {
    headers.set("content-type", contentType);
  }

  const body =
    request.method === "GET" ||
    request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const response = await fetch(backendUrl, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
  });

  const responseHeaders = new Headers();

  const responseContentType =
    response.headers.get("content-type");

  if (responseContentType) {
    responseHeaders.set(
      "content-type",
      responseContentType
    );
  }

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;