"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Plus, Minus, Navigation, MapPin } from "lucide-react";
import type { Ride } from "./ride-card";

interface HeroMapProps {
  rides?: Ride[];
  from?: string;
  to?: string;
  selectedRideId?: string | null;
  onSelectRide?: (rideId: string) => void;
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
  pune: [73.8567, 18.5204],
  wakad: [73.7868, 18.5987],
  hinjawadi: [73.6993, 18.5912],
  mumbai: [72.8777, 19.0760],
  bkc: [72.8679, 19.0607],
  dadar: [72.8433, 19.0178],
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

export default function HeroMap({
  rides = [],
  from,
  to,
  selectedRideId: externalSelectedRideId,
  onSelectRide,
}: HeroMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  // OSRM route geometry cache for selected ride routes
  const rideRoutesCacheRef = useRef<Map<string, { type?: string; coordinates: [number, number][] }>>(new Map());

  const [isMounted, setIsMounted] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedRideId, setSelectedRideId] = useState<string | null>(
    externalSelectedRideId ?? null
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (externalSelectedRideId !== undefined) {
      setSelectedRideId(externalSelectedRideId);
    }
  }, [externalSelectedRideId]);

  // Active route header badge text
  let routeHeader: string | null = null;
  if (from && to) {
    routeHeader = `${from} → ${to}`;
  } else if (from) {
    routeHeader = `Leaving from ${from}`;
  } else if (to) {
    routeHeader = `Going to ${to}`;
  } else if (rides.length > 0) {
    routeHeader = `${rides[0].from} → ${rides[0].to}`;
  }

  useEffect(() => {
    if (!isMounted || !mapContainerRef.current) return;
    if (mapRef.current) return;

    // Set worker URL explicitly in maplibre-gl config
    if (typeof maplibregl.config === "object" && maplibregl.config !== null) {
      maplibregl.config.WORKER_URL = "/maplibre-gl-worker.mjs";
    }

    const containerEl = mapContainerRef.current;
    const openFreeMapStyle = "https://tiles.openfreemap.org/styles/bright";
    const initialCenter = resolveCoords(
      from ?? rides[0]?.from,
      rides[0]?.sourceLat,
      rides[0]?.sourceLng,
      [76.1206, 11.1198]
    );

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: containerEl,
        style: openFreeMapStyle,
        center: initialCenter,
        zoom: 10,
        attributionControl: false,
      });
      mapRef.current = map;
    } catch (err) {
      console.error("MapLibre map creation error:", err);
      return;
    }

    const handleLoad = () => {
      map.resize();
      setMapLoaded(true);
    };

    const handleError = (e: maplibregl.ErrorEvent) => {
      if (e.error) {
        console.warn("MapLibre error event:", e.error.message || e.error);
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
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      map.off("load", handleLoad);
      map.off("error", handleError);
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, [isMounted]);

  // Helper to render or clear selected ride route layer (Stage 2B)
  function updateSelectedRideRoute(rideId: string | null) {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const sourceId = "selected-ride-route-source";
    const layerId = "selected-ride-route-layer";

    if (!rideId) {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
      return;
    }

    const rideGeometry = rideRoutesCacheRef.current.get(rideId);
    if (!rideGeometry) {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
      return;
    }

    const geoData: GeoJSON.Feature = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: rideGeometry.coordinates,
      },
    };

    const existingSource = map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined;
    if (existingSource) {
      existingSource.setData(geoData);
    } else {
      map.addSource(sourceId, {
        type: "geojson",
        data: geoData,
      });
    }

    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#2E6F40", // Brand Forest Green for selected ride route
          "line-width": 5.5,
          "line-opacity": 0.9,
        },
      });
    }
  }

  // Render/update markers & OSRM road route
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const controller = new AbortController();

    // Clear existing markers & popup
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    // Remove existing layers & sources safely
    if (map.getLayer("route-layer")) {
      map.removeLayer("route-layer");
    }
    if (map.getSource("route-source")) {
      map.removeSource("route-source");
    }
    if (map.getLayer("selected-ride-route-layer")) {
      map.removeLayer("selected-ride-route-layer");
    }
    if (map.getSource("selected-ride-route-source")) {
      map.removeSource("selected-ride-route-source");
    }

    const bounds = new maplibregl.LngLatBounds();
    let primarySrc: [number, number] | null = null;
    let primaryDst: [number, number] | null = null;

    if (rides.length > 0) {
      const coordCounts = new Map<string, number>();

      rides.forEach((ride) => {
        let srcCoords = resolveCoords(
          ride.from,
          ride.sourceLat,
          ride.sourceLng,
          [76.1206, 11.1198]
        );
        const dstCoords = resolveCoords(
          ride.to,
          ride.destLat,
          ride.destLng,
          [76.2254, 10.9760]
        );

        if (!primarySrc) {
          primarySrc = srcCoords;
          primaryDst = dstCoords;
        }

        const coordKey = `${srcCoords[0].toFixed(4)},${srcCoords[1].toFixed(4)}`;
        const count = coordCounts.get(coordKey) ?? 0;
        coordCounts.set(coordKey, count + 1);

        // Apply a subtle offset if multiple rides share identical start coordinates
        if (count > 0) {
          const angle = (count * 2 * Math.PI) / 5;
          srcCoords = [
            srcCoords[0] + 0.0006 * Math.cos(angle),
            srcCoords[1] + 0.0006 * Math.sin(angle),
          ];
        }

        bounds.extend(srcCoords);
        bounds.extend(dstCoords);

        const isSelected = selectedRideId === ride.id;

        // Marker element for ride source
        const el = document.createElement("div");
        el.className = "cursor-pointer group select-none";
        el.innerHTML = `
          <div class="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold shadow-md transition-all duration-200 ${
            isSelected
              ? "border-[#C8522E] bg-[#C8522E] text-white ring-4 ring-[#C8522E]/30 scale-110 z-30"
              : "border-[#EAE6DF] bg-white text-[#1E2022] hover:scale-105 hover:border-[#C8522E]"
          }">
            <span class="h-2.5 w-2.5 rounded-full ${
              isSelected ? "bg-white" : "bg-[#C8522E]"
            }"></span>
            <span>₹${ride.price}</span>
            <span class="${isSelected ? "text-white/60" : "text-slate-300"}">·</span>
            <span class="${isSelected ? "font-bold text-white" : "font-semibold text-slate-700"}">${
              ride.driver.name.split(" ")[0]
            }</span>
          </div>
        `;

        function openRidePopup() {
          const mapInstance = mapRef.current;
          if (!mapInstance) return;

          setSelectedRideId(ride.id);
          if (onSelectRide) {
            onSelectRide(ride.id);
          }

          if (popupRef.current) {
            popupRef.current.remove();
          }

          const popupContent = document.createElement("div");
          popupContent.className = "p-3.5 font-sans text-left max-w-[240px]";
          popupContent.innerHTML = `
            <div class="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#C8522E]">
              <span class="h-1.5 w-1.5 rounded-full bg-[#C8522E]"></span>
              <span>Verified SahaYatri Ride</span>
            </div>
            <div class="mt-1 flex items-baseline justify-between gap-2">
              <span class="font-bold text-sm text-[#1E2022] truncate">${ride.driver.name}</span>
              <span class="font-black text-base text-[#C8522E]">₹${ride.price}</span>
            </div>
            <div class="mt-1 text-xs text-slate-600 font-semibold truncate">
              ${ride.from} → ${ride.to}
            </div>
            <div class="mt-1 text-[11px] font-bold text-slate-400">
              ${ride.time ? `${ride.time} · ` : ""}${ride.date}
            </div>
            <a
              href="/rides/${ride.id}"
              class="mt-3 block w-full rounded-xl bg-[#C8522E] px-3 py-2 text-center text-xs font-bold text-white shadow-xs transition hover:bg-[#B34524]"
            >
              View Ride
            </a>
          `;

          const popup = new maplibregl.Popup({
            offset: 20,
            closeButton: true,
            closeOnClick: true,
            className: "sahayatri-map-popup",
          })
            .setLngLat(srcCoords)
            .setDOMContent(popupContent)
            .addTo(mapInstance);

          popup.on("close", () => {
            setSelectedRideId(null);
            updateSelectedRideRoute(null);
          });

          popupRef.current = popup;

          // Render selected ride route on map (Stage 2B)
          updateSelectedRideRoute(ride.id);

          // Gentle pan to keep popup centered
          mapInstance.easeTo({ center: srcCoords, duration: 300 });
        }

        // Asynchronously fetch OSRM geometry for this ride if not already cached
        const rideSrcCoords = resolveCoords(ride.from, ride.sourceLat, ride.sourceLng);
        const rideDstCoords = resolveCoords(ride.to, ride.destLat, ride.destLng);

        if (!rideRoutesCacheRef.current.has(ride.id)) {
          const osrmRideUrl = `https://router.project-osrm.org/route/v1/driving/${rideSrcCoords[0]},${rideSrcCoords[1]};${rideDstCoords[0]},${rideDstCoords[1]}?overview=full&geometries=geojson`;

          fetch(osrmRideUrl, { signal: controller.signal })
            .then((res) => {
              if (!res.ok) throw new Error(`OSRM ride route error: ${res.status}`);
              return res.json();
            })
            .then((data) => {
              if (controller.signal.aborted) return;
              if (data.code === "Ok" && data.routes?.[0]?.geometry) {
                rideRoutesCacheRef.current.set(ride.id, data.routes[0].geometry);
                // If this ride is currently selected, refresh its map route
                if (selectedRideId === ride.id) {
                  updateSelectedRideRoute(ride.id);
                }
              }
            })
            .catch((err) => {
              if (err.name !== "AbortError") {
                console.warn(`OSRM ride route skipped for ride ${ride.id}:`, err.message);
              }
            });
        }

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          openRidePopup();
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(srcCoords)
          .addTo(map);

        markersRef.current.push(marker);

        if (isSelected) {
          openRidePopup();
        }
      });
    } else if (from || to) {
      // User searched locations even if rides list is empty
      const srcCoords = resolveCoords(from, undefined, undefined, [76.1206, 11.1198]);
      const dstCoords = resolveCoords(to, undefined, undefined, [76.2254, 10.9760]);

      primarySrc = srcCoords;
      primaryDst = to ? dstCoords : null;

      bounds.extend(srcCoords);
      if (to) bounds.extend(dstCoords);

      const el = document.createElement("div");
      el.className = "cursor-pointer group select-none";
      el.innerHTML = `
        <div class="flex items-center gap-1.5 rounded-full border border-[#C8522E] bg-white px-3 py-1.5 text-xs font-bold text-[#1E2022] shadow-md">
          <span class="h-2.5 w-2.5 rounded-full bg-[#C8522E]"></span>
          <span>${from || to}</span>
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(srcCoords)
        .addTo(map);

      markersRef.current.push(marker);
    } else {
      const defaultCenter: [number, number] = [76.1206, 11.1198];
      map.flyTo({ center: defaultCenter, zoom: 10 });
      return;
    }

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 13 });
    }

    // Fetch real road route geometry for searched primary route
    if (primarySrc && primaryDst) {
      const [srcLng, srcLat] = primarySrc;
      const [dstLng, dstLat] = primaryDst;

      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${srcLng},${srcLat};${dstLng},${dstLat}?overview=full&geometries=geojson`;

      fetch(osrmUrl, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error(`OSRM error: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (controller.signal.aborted) return;
          if (data.code !== "Ok" || !data.routes?.[0]?.geometry) return;

          const routeGeometry = data.routes[0].geometry;

          if (map.getLayer("route-layer")) map.removeLayer("route-layer");
          if (map.getSource("route-source")) map.removeSource("route-source");

          map.addSource("route-source", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: routeGeometry,
            },
          });

          map.addLayer({
            id: "route-layer",
            type: "line",
            source: "route-source",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#C8522E", // Brand Terra Cotta for user searched route
              "line-width": 4.5,
              "line-opacity": 0.85,
            },
          });

          // Refresh selected ride route if selected
          if (selectedRideId) {
            updateSelectedRideRoute(selectedRideId);
          }
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.warn("OSRM routing fetch skipped/failed:", err.message);
          }
        });
    }

    return () => {
      controller.abort();
    };
  }, [rides, from, to, mapLoaded, selectedRideId]);

  function handleZoomIn() {
    mapRef.current?.zoomIn();
  }

  function handleZoomOut() {
    mapRef.current?.zoomOut();
  }

  function handleRecenter() {
    if (!mapRef.current) return;
    const center = resolveCoords(
      from ?? rides[0]?.from,
      rides[0]?.sourceLat,
      rides[0]?.sourceLng,
      [76.1206, 11.1198]
    );
    mapRef.current.flyTo({ center, zoom: 10 });
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#EAE6DF] bg-white shadow-xs">
      {/* Route Info Header Bar */}
      {routeHeader && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-2xl bg-white/95 px-4 py-2 text-xs font-bold text-[#1E2022] shadow-md backdrop-blur-md border border-[#EAE6DF]">
          <MapPin size={14} className="text-[#C8522E]" />
          <span>{routeHeader}</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500 font-semibold">{rides.length} available</span>
        </div>
      )}

      {/* Floating Map Controls */}
      <div className="absolute right-4 top-4 z-20 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleZoomIn}
          aria-label="Zoom In"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#EAE6DF] bg-white/95 text-[#1E2022] shadow-md backdrop-blur-md transition hover:bg-[#FAF8F5] active:scale-95"
        >
          <Plus size={16} />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          aria-label="Zoom Out"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#EAE6DF] bg-white/95 text-[#1E2022] shadow-md backdrop-blur-md transition hover:bg-[#FAF8F5] active:scale-95"
        >
          <Minus size={16} />
        </button>
        <button
          type="button"
          onClick={handleRecenter}
          aria-label="Recenter Map"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#EAE6DF] bg-white/95 text-[#1E2022] shadow-md backdrop-blur-md transition hover:bg-[#FAF8F5] active:scale-95"
        >
          <Navigation size={15} />
        </button>
      </div>

      {/* MapLibre WebGL Canvas Container */}
      <div
        ref={mapContainerRef}
        className="h-[320px] sm:h-[400px] w-full bg-[#FAF8F5]"
      />
    </section>
  );
}
