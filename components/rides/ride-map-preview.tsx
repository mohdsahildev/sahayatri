"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface LocationCoords {
  name: string;
  lat?: number;
  lng?: number;
}

interface RideMapPreviewProps {
  source: LocationCoords;
  destination: LocationCoords;
}

const CITY_COORDINATES: Record<string, [number, number]> = {
  manjeri: [76.1206, 11.1198],
  malappuram: [76.0740, 11.0734],
  perinthalmanna: [76.2254, 10.9760],
  kozhikode: [75.7804, 11.2588],
  calicut: [75.7804, 11.2588],
  kochi: [76.2673, 9.9312],
  cochin: [76.2673, 9.9312],
  trivandrum: [76.9366, 8.5241],
  thiruvananthapuram: [76.9366, 8.5241],
  thrissur: [76.2144, 10.5276],
  palakkad: [76.6548, 10.7867],
  kannur: [75.3704, 11.8745],
  kottayam: [76.5222, 9.5916],
  alappuzha: [76.3388, 9.4981],
  kollam: [76.6034, 8.8932],
  kasaragod: [74.9896, 12.5102],
  wayanad: [76.1320, 11.6854],
  pune: [73.8567, 18.5204],
  wakad: [73.7868, 18.5987],
  hinjawadi: [73.6993, 18.5912],
  mumbai: [72.8777, 19.0760],
  bkc: [72.8679, 19.0607],
  dadar: [72.8433, 19.0178],
  thane: [72.9781, 19.2183],
  navi_mumbai: [73.0297, 19.0330],
  panvel: [73.1090, 18.9894],
  lonavala: [73.4072, 18.7557],
};

function resolveCoords(
  locationName?: string,
  lat?: number,
  lng?: number,
  fallback: [number, number] = [76.1206, 11.1198]
): [number, number] {
  if (
    typeof lng === "number" &&
    typeof lat === "number" &&
    Number.isFinite(lng) &&
    Number.isFinite(lat) &&
    lng !== 0 &&
    lat !== 0
  ) {
    return [lng, lat];
  }

  if (locationName) {
    const lower = locationName.toLowerCase();
    for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
      if (lower.includes(city)) {
        return coords;
      }
    }
  }

  return fallback;
}

export default function RideMapPreview({
  source,
  destination,
}: RideMapPreviewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [isMounted, setIsMounted] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const startCoords = useMemo(
    () => resolveCoords(source?.name, source?.lat, source?.lng, [76.1206, 11.1198]),
    [source?.name, source?.lat, source?.lng]
  );

  const endCoords = useMemo(
    () => resolveCoords(destination?.name, destination?.lat, destination?.lng, [75.7804, 11.2588]),
    [destination?.name, destination?.lat, destination?.lng]
  );

  // 1. Initialize MapLibre map instance ONCE when component is mounted
  useEffect(() => {
    if (!isMounted || !mapContainerRef.current) return;
    if (mapRef.current) return;

    if (typeof maplibregl.config === "object" && maplibregl.config !== null) {
      maplibregl.config.WORKER_URL = "/maplibre-gl-worker.mjs";
    }

    const containerEl = mapContainerRef.current;
    const openFreeMapStyle = "https://tiles.openfreemap.org/styles/bright";

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: containerEl,
        style: openFreeMapStyle,
        center: [
          (startCoords[0] + endCoords[0]) / 2,
          (startCoords[1] + endCoords[1]) / 2,
        ],
        zoom: 10,
        attributionControl: false,
      });
      mapRef.current = map;
    } catch (err) {
      console.error("MapLibre map initialization error in RideMapPreview:", err);
      return;
    }

    const handleLoad = () => {
      map.resize();
      setMapLoaded(true);
    };

    const handleError = (e: maplibregl.ErrorEvent) => {
      if (e.error) {
        console.warn("MapLibre error in RideMapPreview:", e.error.message || e.error);
      }
    };

    map.on("load", handleLoad);
    map.on("error", handleError);

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(containerEl);

    return () => {
      resizeObserver.disconnect();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.off("load", handleLoad);
      map.off("error", handleError);
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, [isMounted]);

  // 2. Add Markers and OSRM Road Route once the map style is loaded
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const controller = new AbortController();

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Pickup / Start Marker (Terracotta circular pin)
    const startEl = document.createElement("div");
    startEl.className = "flex items-center justify-center cursor-pointer select-none";
    startEl.innerHTML = `
      <div style="width: 22px; height: 22px; border-radius: 9999px; background: #C8522E; border: 3px solid #FFFFFF; box-shadow: 0 4px 10px rgba(200,82,46,0.45); display: flex; align-items: center; justify-content: center;">
        <div style="width: 6px; height: 6px; border-radius: 9999px; background: #FFFFFF;"></div>
      </div>
    `;
    const startMarker = new maplibregl.Marker({ element: startEl })
      .setLngLat(startCoords)
      .addTo(map);
    markersRef.current.push(startMarker);

    // Destination Marker (Dark Charcoal square pin)
    const endEl = document.createElement("div");
    endEl.className = "flex items-center justify-center cursor-pointer select-none";
    endEl.innerHTML = `
      <div style="width: 20px; height: 20px; border-radius: 6px; background: #1E2022; border: 3px solid #FFFFFF; box-shadow: 0 4px 10px rgba(30,32,34,0.4); display: flex; align-items: center; justify-content: center;">
        <div style="width: 6px; height: 6px; border-radius: 2px; background: #FFFFFF;"></div>
      </div>
    `;
    const endMarker = new maplibregl.Marker({ element: endEl })
      .setLngLat(endCoords)
      .addTo(map);
    markersRef.current.push(endMarker);

    const bounds = new maplibregl.LngLatBounds();
    bounds.extend(startCoords);
    bounds.extend(endCoords);

    // Fetch live OSRM driving route
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?overview=full&geometries=geojson`;

    fetch(osrmUrl, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        const currentMap = mapRef.current;
        if (!currentMap) return;

        if (data.code === "Ok" && data.routes?.[0]?.geometry) {
          const geometry = data.routes[0].geometry as GeoJSON.LineString;

          const sourceId = "ride-preview-route-source";
          const layerId = "ride-preview-route-layer";

          const geoData: GeoJSON.Feature = {
            type: "Feature",
            properties: {},
            geometry,
          };

          const existingSource = currentMap.getSource(sourceId) as maplibregl.GeoJSONSource | undefined;
          if (existingSource) {
            existingSource.setData(geoData);
          } else {
            currentMap.addSource(sourceId, {
              type: "geojson",
              data: geoData,
            });
          }

          if (!currentMap.getLayer(layerId)) {
            currentMap.addLayer({
              id: layerId,
              type: "line",
              source: sourceId,
              layout: {
                "line-join": "round",
                "line-cap": "round",
              },
              paint: {
                "line-color": "#C8522E",
                "line-width": 4.5,
                "line-opacity": 0.9,
              },
            });
          }

          // Extend bounds to encompass all route curvature points
          if (Array.isArray(geometry.coordinates)) {
            geometry.coordinates.forEach((coord) => {
              if (Array.isArray(coord) && coord.length >= 2) {
                bounds.extend([coord[0], coord[1]]);
              }
            });
          }
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.warn("OSRM road route skipped in RideMapPreview:", err.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted && mapRef.current) {
          mapRef.current.fitBounds(bounds, {
            padding: { top: 48, bottom: 48, left: 48, right: 48 },
            maxZoom: 14,
            duration: 600,
          });
        }
      });

    return () => {
      controller.abort();
    };
  }, [mapLoaded, startCoords, endCoords]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5]">
      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="h-[320px] sm:h-[360px] w-full"
      />

      {/* Floating Waypoint Chips Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#1E2022] shadow-sm backdrop-blur-sm border border-[#EAE6DF]">
            <span className="h-2 w-2 rounded-full bg-[#C8522E]" />
            <span className="truncate max-w-[130px] sm:max-w-[200px]">{source?.name || "Pickup"}</span>
          </div>

          <span className="text-xs font-bold text-[#C8522E]">→</span>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#1E2022] shadow-sm backdrop-blur-sm border border-[#EAE6DF]">
            <span className="h-2 w-2 rounded-sm bg-[#1E2022]" />
            <span className="truncate max-w-[130px] sm:max-w-[200px]">{destination?.name || "Destination"}</span>
          </div>
        </div>

        {/* OpenFreeMap / OSM Attribution */}
        <div className="rounded-md bg-white/80 px-2 py-0.5 text-[9px] font-medium text-slate-500 backdrop-blur-xs border border-[#EAE6DF]/60 pointer-events-auto">
          Map © OpenFreeMap · Data © OpenStreetMap
        </div>
      </div>
    </div>
  );
}
