import RideCard, { type Ride } from "./ride-card";

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
    searchParams: Record<string, string | undefined>,
    page: number
  ) {
    const params = new URLSearchParams();

    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    params.set("page", String(page));

    return `/?${params.toString()}`;
  }

  if (rides.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <h3 className="font-sans text-base font-bold text-secondary">
          No rides found
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      {rides.map((ride) => (
        <RideCard key={ride.id} ride={ride} />
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          {page > 1 ? (
            <a
              href={getPageUrl(searchParams, page - 1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-secondary transition hover:border-primary hover:text-primary"
            >
              Previous
            </a>
          ) : (
            <div />
          )}

          <span className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
        
          {page < totalPages ? (
            <a
              href={getPageUrl(searchParams, page + 1)}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-secondary"
            >
              Next
            </a>
          ) : (
            <div />
          )}
        </div>
      )}

    </section>
  );
}