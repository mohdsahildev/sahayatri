"use client";

import { useEffect, useState } from "react";
import { Bell, LogOut, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getUnreadNotificationCount } from "@/lib/api/notifications";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useNotificationStore } from "@/lib/stores/notification.store";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api/auth";
import { getChats } from "@/lib/api/chat";

export default function Navbar() {
  const router = useRouter();

  const accessToken = useAuthStore(
    (state) => state.accessToken
  );

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const user = useAuthStore(
    (state) => state.user
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

  const [chatUnreadCount, setChatUnreadCount] = useState(0);

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
      setChatUnreadCount(0);
      return;
    }

    async function loadChatUnreadCount() {
      try {
        const response = await getChats();

        const count = (response.data.chats ?? []).reduce(
          (total, chat) =>
            total + (chat.unreadCount ?? 0),
          0
        );

        setChatUnreadCount(count);
      } catch (error) {
        console.error(
          "Unable to load chat unread count:",
          error
        );
      }
    }

    loadChatUnreadCount();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setChatUnreadCount(0);
      return;
    }

    async function loadChatUnreadCount() {
      try {
        const response = await fetch("/api/chats");

        if (!response.ok) return;

        const result = await response.json();

        const count = (result.data?.chats ?? []).reduce(
          (total: number, chat: { unreadCount?: number }) =>
            total + (chat.unreadCount ?? 0),
          0
        );

        setChatUnreadCount(count);
      } catch (error) {
        console.error(
          "Unable to load chat unread count:",
          error
        );
      }
    }

    loadChatUnreadCount();
  }, [isAuthenticated]);

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
            href="/chats"
            aria-label={
              chatUnreadCount > 0
                ? `${chatUnreadCount} unread chats`
                : "Chats"
            }
            className="relative flex items-center gap-2 font-sans text-sm font-semibold text-slate-600 transition hover:text-primary"
          >
            <MessageCircle size={18} />
          
            <span>Chats</span>
          
            {chatUnreadCount > 0 && (
              <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                {chatUnreadCount > 99
                  ? "99+"
                  : chatUnreadCount}
              </span>
            )}
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
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-secondary font-sans text-sm font-bold text-white transition hover:bg-primary"
          >
            {user?.profilePic ? (
              <img
                src={user.profilePic}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              user?.name?.charAt(0).toUpperCase() ?? "S"
            )}
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