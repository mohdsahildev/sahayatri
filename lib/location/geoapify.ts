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

export async function searchLocations(
  query: string
): Promise<Location[]> {
  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

  if (!query.trim() || !apiKey) {
    return [];
  }

  const params = new URLSearchParams({
    text: query,
    apiKey,
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

      const lat = properties?.lat;
      const lng = properties?.lon;

      if (!properties || typeof lat !== "number" || typeof lng !== "number") {
        return null;
      }

      return {
        name:
          properties.formatted ??
          properties.name ??
          "",
        lat,
        lng,
      };
    })
    .filter(
      (location): location is Location =>
        location !== null &&
        location.name.length > 0
    );
}