import RideCard, { type Ride } from "./ride-card";

const mockRides: Ride[] = [
  {
    id: "ride-1",
    driver: {
      name: "Arjun",
      rating: 4.8,
      rides: 24,
      verified: true,
    },
    from: "Kochi",
    to: "Bangalore",
    date: "Tomorrow",
    time: "7:30 AM",
    seatsAvailable: 3,
    price: 450,
    description:
      "Heading to Bangalore for work. Small luggage is okay.",
  },
  {
    id: "ride-2",
    driver: {
      name: "Meera",
      rating: 4.9,
      rides: 18,
      verified: true,
    },
    from: "Kozhikode",
    to: "Kochi",
    date: "Today",
    time: "5:00 PM",
    seatsAvailable: 2,
    price: 250,
    description: "Leaving early to avoid traffic. Happy to share the ride.",
  },
  {
    id: "ride-3",
    driver: {
      name: "Rahul",
      rating: 4.7,
      rides: 31,
      verified: false,
    },
    from: "Thrissur",
    to: "Bangalore",
    date: "Sunday",
    time: "6:30 AM",
    seatsAvailable: 1,
    price: 500,
    description: "One seat available. Prefer light luggage.",
  },
];

export default function RideFeed() {
  return (
    <section className="mt-6">
      <div className="grid gap-4">
        {mockRides.map((ride) => (
          <RideCard key={ride.id} ride={ride} />
        ))}
      </div>
    </section>
  );
}