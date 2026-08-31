import "server-only";

import { serverApiFetch } from "@/lib/api/server-client";
import type { Ride } from "@/components/home/ride-card";

export interface RideLocation {
  name: string;
  lat?: number;
  lng?: number;
}

export interface ApiRide {
  _id: string;

  driver: string;

  driverInfo?: {
    _id: string;
    name: string;
    profilePic?: string;
    rating: number;
    rideCount: number;
    isVerified: boolean;
  };

  source: RideLocation;
  destination: RideLocation;
  departureTime: string;
  duration?: number;
  seatsAvailable: number;
  price: number;
  description?: string;
  status?: string;
}

interface RideListData {
  rides: ApiRide[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface RideListResponse {
  success: boolean;
  message: string;
  data: RideListData;
}

export interface RideSearchParams {
  from?: string;
  to?: string;
  date?: string;
  timeFrom?: string;
  timeTo?: string;
  minPrice?: string;
  maxPrice?: string;
  minSeats?: string;
  vehicleType?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

export async function getRides(params: RideSearchParams = {}) {
  const query = new URLSearchParams();

  query.set("page", params.page ?? "1");
  query.set("limit", params.limit ?? "10");

  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.date) query.set("date", params.date);
  if (params.timeFrom) query.set("timeFrom", params.timeFrom);
  if (params.timeTo) query.set("timeTo", params.timeTo);
  if (params.minPrice) query.set("minPrice", params.minPrice);
  if (params.maxPrice) query.set("maxPrice", params.maxPrice);
  if (params.minSeats) query.set("minSeats", params.minSeats);
  if (params.vehicleType) query.set("vehicleType", params.vehicleType);
  if (params.sort) query.set("sort", params.sort);

  const response = await serverApiFetch<RideListResponse>(
    `/api/rides?${query.toString()}`
  );

  return response.data;
}

export function mapApiRideToRide(ride: ApiRide): Ride {
  const departure = new Date(ride.departureTime);

  return {
    id: ride._id,

    driver: {
      name: ride.driverInfo?.name ?? "SahaYatri user",
      rating: ride.driverInfo?.rating ?? 0,
      rides: ride.driverInfo?.rideCount ?? 0,
      verified: ride.driverInfo?.isVerified ?? false,
    },

    from: ride.source.name,
    to: ride.destination.name,

    date: departure.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    }),

    time: departure.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    }),

    seatsAvailable: ride.seatsAvailable,
    price: ride.price,
    description: ride.description,
  };
}