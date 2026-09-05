"use client";

import { useEffect } from "react";
import { Bell, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getUnreadNotificationCount } from "@/lib/api/notifications";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useNotificationStore } from "@/lib/stores/notification.store";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api/auth";

export default function Navbar() {
  const router = useRouter();

  const accessToken = useAuthStore(
    (state) => state.accessToken
  );

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const clearAuth = useAuthStore(
    (state) => state.clearAuth
  );

  const unreadCount = useNotificationStore(
    (state) => state.unreadCount
  );

  const setUnreadCount = useNotificationStore(
    (state) => state.setUnreadCount
  );

  async function handleLogout() {
    try {
      if (accessToken) {
        await logout(accessToken);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      clearAuth();
      router.push("/login");
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    async function loadUnreadCount() {
      try {
        const response =
          await getUnreadNotificationCount();

        setUnreadCount(
          response.data.unreadCount ??
            response.data.count ??
            0
        );
      } catch {
        setUnreadCount(0);
      }
    }

    loadUnreadCount();
  }, [isAuthenticated, setUnreadCount]);

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
            href="/home"
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
          <Link
            href="/notifications"
            aria-label={
              unreadCount > 0
                ? `${unreadCount} unread notifications`
                : "Notifications"
            }
            className="relative"
          >
            <Bell size={20} />

            {unreadCount > 0 && (
              <span className="absolute -right-2 -top-2 flex min-w-4 h-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>

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

          {/* Temporary logout */}
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} strokeWidth={1.8} />
          </button>
        </div>
      </nav>
    </header>
  );
}