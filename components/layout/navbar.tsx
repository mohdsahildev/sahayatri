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
    <header className="border-b border-[#EAE6DF] bg-white sticky top-0 z-40">
      <nav className="mx-auto flex h-18 max-w-[1240px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link
          href="/home"
          className="flex items-center gap-2"
          aria-label="SahaYatri home"
        >
          <Image
            src="/logo/SahaYatri-logo.svg"
            alt=""
            width={48}
            height={48}
            priority
          />

          <span className="font-sans text-xl font-bold tracking-tight text-[#1E2022]">
            SahaYatri
          </span>
        </Link>

        {/* Main navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/home"
            className="font-sans text-sm font-bold text-[#C8522E]"
          >
            Find a Ride
          </Link>

          <Link
            href="/post-ride"
            className="font-sans text-sm font-semibold text-slate-600 transition hover:text-[#C8522E]"
          >
            Offer a Ride
          </Link>

          <Link
            href="/my-rides"
            className="font-sans text-sm font-semibold text-slate-600 transition hover:text-[#C8522E]"
          >
            My Rides
          </Link>

          <Link
            href="/chats"
            aria-label={
              chatUnreadCount > 0
                ? `${chatUnreadCount} unread chats`
                : "Messages"
            }
            className="relative flex items-center gap-2 font-sans text-sm font-semibold text-slate-600 transition hover:text-[#C8522E]"
          >
            <span>Messages</span>
          
            {chatUnreadCount > 0 && (
              <span className="flex h-2 w-2 rounded-full bg-[#C8522E]" />
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
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 hover:bg-[#FAF8F5] transition"
          >
            <Bell size={19} />

            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C8522E] px-1 text-[9px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>

          {/* User Badge / Profile */}
          <Link
            href="/profile"
            aria-label="Profile"
            className="flex items-center gap-2 rounded-full border border-[#EAE6DF] bg-[#FAF8F5] p-1.5 pr-3 transition hover:border-slate-300"
          >
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#1E2022] font-sans text-xs font-bold text-white">
              {user?.profilePic ? (
                <img
                  src={user.profilePic}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.name?.charAt(0).toUpperCase() ?? "S"
              )}
            </div>

            <div className="hidden text-left sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#1E2022]">
                  {user?.name ?? "SahaYatri User"}
                </span>
                <span className="text-[10px] font-bold text-[#2E6F40]">✓ Verified</span>
              </div>
            </div>
          </Link>

          {/* Logout */}
          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={16} strokeWidth={1.8} />
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}