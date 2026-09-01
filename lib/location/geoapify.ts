export interface Location {
  name: string;
  lat: number;
  lng: number;
}

interface GeoapifyFeature {
  properties?: {
    name?: string;
    formatted?: string;
    lat?: number;
    lon?: number;
  };
}

interface GeoapifyResponse {
  features?: GeoapifyFeature[];
}

const API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

export async function searchLocations(
  query: string
): Promise<Location[]> {
  if (!query.trim() || !API_KEY) {
    return [];
  }

  const params = new URLSearchParams({
    text: query,
    apiKey: API_KEY,
    limit: "5",
  });

  const response = await fetch(
    `https://api.geoapify.com/v1/geocode/autocomplete?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to search locations");
  }

  const data: GeoapifyResponse =
    await response.json();

  return (data.features ?? [])
    .map((feature) => {
      const properties = feature.properties;

      if (
        !properties?.lat ||
        !properties?.lon
      ) {
        return null;
      }

      return {
        name:
          properties.formatted ??
          properties.name ??
          "",
        lat: properties.lat,
        lng: properties.lon,
      };
    })
    .filter(
      (location): location is Location =>
        location !== null &&
        location.name.length > 0
    );
}