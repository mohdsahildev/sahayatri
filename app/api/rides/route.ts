import { NextResponse } from "next/server";
import { serverApiFetch } from "@/lib/api/server-client";
import type { CreateRideRequest } from "@/lib/api/rides";

interface CreateRideResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    status: string;
  };
}

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as CreateRideRequest;

    const response =
      await serverApiFetch<CreateRideResponse>(
        "/api/rides",
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );

    return NextResponse.json(response);
  } catch (error) {
    console.error(
      "Create ride API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create ride",
      },
      { status: 500 }
    );
  }
}