import RideCard, { type Ride } from "./ride-card";
import { SearchX } from "lucide-react";

interface RideFeedProps {
  rides: Ride[];
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

export default function RideFeed({
  rides,
  page,
  totalPages,
  searchParams,
}: RideFeedProps) {
  function getPageUrl(
    paramsObj: Record<string, string | undefined>,
    targetPage: number
  ) {
    const params = new URLSearchParams();

    Object.entries(paramsObj).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    params.set("page", String(targetPage));

    return `/home?${params.toString()}`;
  }

  if (rides.length === 0) {
    return (
      <div className="rounded-3xl border border-[#EAE6DF] bg-white p-12 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF8F5] text-slate-400">
          <SearchX size={28} />
        </div>
        <h3 className="mt-4 font-sans text-lg font-bold text-[#1E2022]">
          No rides matching your search
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Try broadening your departure time, location, or price filters to see available journeys.
        </p>
      </div>
    );
  }

  return (
    <section className="mt-4 space-y-4">
      {rides.map((ride) => (
        <RideCard
          key={ride.id}
          ride={ride}
        />
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          {page > 1 ? (
            <a
              href={getPageUrl(searchParams, page - 1)}
              className="rounded-xl border border-[#EAE6DF] bg-white px-4 py-2.5 text-xs font-bold text-[#1E2022] transition hover:border-[#1E2022] hover:bg-[#FAF8F5]"
            >
              ← Previous Page
            </a>
          ) : (
            <div />
          )}

          <span className="text-xs font-semibold text-slate-400">
            Page {page} of {totalPages}
          </span>
        
          {page < totalPages ? (
            <a
              href={getPageUrl(searchParams, page + 1)}
              className="rounded-xl bg-[#C8522E] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#B34524]"
            >
              Next Page →
            </a>
          ) : (
            <div />
          )}
        </div>
      )}
    </section>
  );
}