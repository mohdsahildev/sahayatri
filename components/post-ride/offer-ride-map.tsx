"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Location } from "@/lib/location/geoapify";

interface OfferRideMapProps {
  source: Location | null;
  destination: Location | null;
}

export default function OfferRideMap({
  source,
  destination,
}: OfferRideMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [isMounted, setIsMounted] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const hasValidCoords = Boolean(
    source &&
    destination &&
    typeof source.lng === "number" &&
    typeof source.lat === "number" &&
    typeof destination.lng === "number" &&
    typeof destination.lat === "number" &&
    Number.isFinite(source.lng) &&
    Number.isFinite(source.lat) &&
    Number.isFinite(destination.lng) &&
    Number.isFinite(destination.lat)
  );

  const startCoords: [number, number] = useMemo(() => {
    if (source && typeof source.lng === "number" && typeof source.lat === "number") {
      return [source.lng, source.lat];
    }
    return [73.8567, 18.5204]; // Fallback
  }, [source]);

  const endCoords: [number, number] = useMemo(() => {
    if (destination && typeof destination.lng === "number" && typeof destination.lat === "number") {
      return [destination.lng, destination.lat];
    }
    return [72.8777, 19.076]; // Fallback
  }, [destination]);

  // Initialize MapLibre instance
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
        zoom: 9,
        attributionControl: false,
      });
      mapRef.current = map;
    } catch (err) {
      console.error("MapLibre initialization error:", err);
      return;
    }

    const handleLoad = () => {
      map.resize();
      setMapLoaded(true);
    };

    map.on("load", handleLoad);

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(containerEl);

    return () => {
      resizeObserver.disconnect();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.off("load", handleLoad);
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, [isMounted]);

  // Update markers and route when coordinates change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !hasValidCoords) return;

    const controller = new AbortController();

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Start Marker (Terracotta circular pin)
    const startEl = document.createElement("div");
    startEl.className = "flex items-center justify-center select-none";
    startEl.innerHTML = `
      <div style="width: 20px; height: 20px; border-radius: 9999px; background: #C8522E; border: 3px solid #FFFFFF; box-shadow: 0 4px 10px rgba(200,82,46,0.45); display: flex; align-items: center; justify-content: center;">
        <div style="width: 5px; height: 5px; border-radius: 9999px; background: #FFFFFF;"></div>
      </div>
    `;
    const startMarker = new maplibregl.Marker({ element: startEl })
      .setLngLat(startCoords)
      .addTo(map);
    markersRef.current.push(startMarker);

    // End Marker (Charcoal square pin)
    const endEl = document.createElement("div");
    endEl.className = "flex items-center justify-center select-none";
    endEl.innerHTML = `
      <div style="width: 18px; height: 18px; border-radius: 5px; background: #1E2022; border: 3px solid #FFFFFF; box-shadow: 0 4px 10px rgba(30,32,34,0.4); display: flex; align-items: center; justify-content: center;">
        <div style="width: 5px; height: 5px; border-radius: 2px; background: #FFFFFF;"></div>
      </div>
    `;
    const endMarker = new maplibregl.Marker({ element: endEl })
      .setLngLat(endCoords)
      .addTo(map);
    markersRef.current.push(endMarker);

    const bounds = new maplibregl.LngLatBounds();
    bounds.extend(startCoords);
    bounds.extend(endCoords);

    // Fetch OSRM road geometry
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
          const sourceId = "offer-ride-route-source";
          const layerId = "offer-ride-route-layer";

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
                "line-width": 4,
                "line-opacity": 0.9,
              },
            });
          }

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
          console.warn("OSRM route preview skipped:", err.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted && mapRef.current) {
          mapRef.current.fitBounds(bounds, {
            padding: { top: 32, bottom: 32, left: 32, right: 32 },
            maxZoom: 13,
            duration: 500,
          });
        }
      });

    return () => {
      controller.abort();
    };
  }, [mapLoaded, hasValidCoords, startCoords, endCoords]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[#EAE6DF] bg-[#FAF8F5]">
      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        className="h-[200px] sm:h-[220px] w-full"
      />

      {/* Attribution Overlay */}
      <div className="absolute bottom-2 right-2 rounded bg-white/80 px-2 py-0.5 text-[8px] font-medium text-slate-500 backdrop-blur-xs border border-[#EAE6DF]/60">
        Map © OpenFreeMap · Data © OpenStreetMap
      </div>
    </div>
  );
}
