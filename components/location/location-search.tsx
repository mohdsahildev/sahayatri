"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import {
  searchLocations,
  type Location,
} from "@/lib/location/geoapify";

interface LocationSearchProps {
  value?: Location | string | null;
  onSelect: (location: Location) => void;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

export default function LocationSearch({
  value,
  onSelect,
  onChangeText,
  placeholder = "Search location",
  className,
  icon,
}: LocationSearchProps) {
  const initialName =
    typeof value === "string" ? value : value?.name ?? "";

  const [query, setQuery] = useState(initialName);

  const [suggestions, setSuggestions] =
    useState<Location[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [showSuggestions, setShowSuggestions] =
    useState(false);

  const containerRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentName =
      typeof value === "string" ? value : value?.name ?? "";
    setQuery(currentName);
  }, [value]);

  useEffect(() => {
    const trimmedQuery = query.trim();
    const selectedName =
      typeof value === "string" ? value : value?.name;

    if (!trimmedQuery || selectedName === query) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const results =
          await searchLocations(trimmedQuery);

        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error(
          "Location search failed:",
          error
        );

        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [query, value]);

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  function handleSelect(location: Location) {
    setQuery(location.name);
    setSuggestions([]);
    setShowSuggestions(false);

    onSelect(location);
  }

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <div
        className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 focus-within:border-primary ${
          className ?? ""
        }`}
      >
        {icon ?? (
          <MapPin
            size={19}
            strokeWidth={1.8}
            className="shrink-0 text-primary"
          />
        )}

        <input
          type="text"
          value={query}
          onChange={(event) => {
            const val = event.target.value;
            setQuery(val);
            onChangeText?.(val);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-secondary outline-none placeholder:text-slate-400"
        />

        {loading && (
          <Loader2
            size={16}
            className="shrink-0 animate-spin text-primary"
          />
        )}
      </div>

      {showSuggestions &&
        suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            {suggestions.map((location) => (
              <button
                key={`${location.lat}-${location.lng}-${location.name}`}
                type="button"
                onClick={() =>
                  handleSelect(location)
                }
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-neutral"
              >
                <MapPin
                  size={16}
                  className="mt-0.5 shrink-0 text-primary"
                />

                <span className="text-sm text-secondary">
                  {location.name}
                </span>
              </button>
            ))}
          </div>
        )}
    </div>
  );
}