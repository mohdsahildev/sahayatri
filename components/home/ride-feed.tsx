import RideCard, { type Ride } from "./ride-card";

interface RideFeedProps {
  rides: Ride[];
}

export default function RideFeed({ rides }: RideFeedProps) {
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
    </section>
  );
}