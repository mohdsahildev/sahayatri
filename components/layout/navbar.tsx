import Image from "next/image";
import Link from "next/link";
import {Bell} from "lucide-react"

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 md:px-8">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="SahaYatri home"
        >
          <Image
            src="/logo/SahaYatri-logo.svg"
            alt=""
            width={60}
            height={60}
            priority
          />

          <span className="font-sans text-xl font-bold tracking-tight text-secondary">
            SahaYatri
          </span>
        </Link>

        {/* Main navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="font-sans text-sm font-semibold text-secondary"
          >
            Home
          </Link>

          <Link
            href="/my-rides"
            className="font-sans text-sm font-semibold text-slate-600 transition hover:text-primary"
          >
            My Rides
          </Link>

          <Link
            href="/chat"
            className="font-sans text-sm font-semibold text-slate-600 transition hover:text-primary"
          >
            Chat
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-full text-secondary transition hover:bg-neutral hover:text-primary"
          >
            <Bell size={20} strokeWidth={1.8} />
          </button>

          <Link
            href="/profile"
            aria-label="Profile"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary font-sans text-sm font-bold text-white transition hover:bg-primary"
          >
            S
          </Link>

          <Link
            href="/post-ride"
            className="hidden rounded-xl bg-primary px-5 py-2.5 font-sans text-sm font-bold text-white transition hover:bg-secondary sm:block"
          >
            + Post Ride
          </Link>
        </div>
      </nav>
    </header>
  );
}