"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  LogOut,
  ChevronRight,
  CheckCheck,
  Car,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useNotificationStore } from "@/lib/stores/notification.store";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/api/auth";
import { getChats } from "@/lib/api/chat";
import { getSocket } from "@/lib/socket";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
} from "@/lib/api/notifications";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

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

  const notifications = useNotificationStore(
    (state) => state.notifications
  );

  const unreadCount = useNotificationStore(
    (state) => state.unreadCount
  );

  const setNotifications = useNotificationStore(
    (state) => state.setNotifications
  );

  const setUnreadCount = useNotificationStore(
    (state) => state.setUnreadCount
  );

  const markAsRead = useNotificationStore(
    (state) => state.markAsRead
  );

  const markAllAsRead = useNotificationStore(
    (state) => state.markAllAsRead
  );

  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const notificationDropdownRef = useRef<HTMLDivElement>(null);

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

  // Load chat unread count and listen for realtime updates
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    async function loadChatUnreadCount() {
      try {
        const response = await getChats();
        if (isMounted) {
          const count = (response.data.chats ?? []).reduce(
            (total, chat) =>
              total + (chat.unreadCount ?? 0),
            0
          );
          setChatUnreadCount(count);
        }
      } catch (error) {
        console.error(
          "Unable to load chat unread count:",
          error
        );
      }
    }

    loadChatUnreadCount();

    const socket = getSocket();

    const handleNewNotification = (payload: { notification?: { type?: string } }) => {
      if (payload?.notification?.type === "chat_message" || payload?.notification?.type === "chat") {
        setChatUnreadCount((prev) => prev + 1);
      }
    };

    socket.on("notification:new", handleNewNotification);

    return () => {
      isMounted = false;
      socket.off("notification:new", handleNewNotification);
    };
  }, [isAuthenticated, pathname]);

  // Load initial notification data
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadInitialNotifications() {
      try {
        const [countRes, listRes] = await Promise.all([
          getUnreadNotificationCount().catch(() => null),
          getNotifications(1, 5).catch(() => null),
        ]);

        if (countRes?.data) {
          const count =
            countRes.data.unreadCount ?? countRes.data.count ?? 0;
          setUnreadCount(count);
        }

        if (listRes?.data?.notifications) {
          setNotifications(listRes.data.notifications);
        }
      } catch (err) {
        console.error("Unable to load initial notifications:", err);
      }
    }

    loadInitialNotifications();
  }, [isAuthenticated, setNotifications, setUnreadCount]);

  // Close dropdown on outside click or escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotificationDropdown(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowNotificationDropdown(false);
      }
    }

    if (showNotificationDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNotificationDropdown]);

  const prevPathnameRef = useRef(pathname);
  // Close dropdown when route changes
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      setShowNotificationDropdown(false);
    }
  }, [pathname]);

  // Handle opening notification dropdown
  async function toggleNotificationDropdown() {
    const nextState = !showNotificationDropdown;
    setShowNotificationDropdown(nextState);

    if (nextState && isAuthenticated) {
      try {
        setLoadingNotifications(true);
        const [countRes, listRes] = await Promise.all([
          getUnreadNotificationCount().catch(() => null),
          getNotifications(1, 5).catch(() => null),
        ]);

        if (countRes?.data) {
          const count =
            countRes.data.unreadCount ?? countRes.data.count ?? 0;
          setUnreadCount(count);
        }

        if (listRes?.data?.notifications) {
          setNotifications(listRes.data.notifications);
        }
      } catch (err) {
        console.error("Unable to refresh notifications:", err);
      } finally {
        setLoadingNotifications(false);
      }
    }
  }

  // Handle Mark All as Read
  async function handleMarkAllAsRead() {
    try {
      await markAllNotificationsRead();
      markAllAsRead();
    } catch (err) {
      console.error("Unable to mark all as read:", err);
    }
  }

  function isNotificationRead(item: Notification): boolean {
    return item.isRead !== undefined ? Boolean(item.isRead) : Boolean(item.read);
  }

  function formatRelativeTime(dateStr?: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  }

  function getNotificationDestination(item: Notification): string {
    const raw = item as unknown as Record<string, unknown>;
    const data = (item.data ?? {}) as Record<string, unknown>;
    const metadata = (raw.metadata ?? {}) as Record<string, unknown>;
    const t = (item.type ?? "").toLowerCase();

    if (typeof raw.url === "string" && raw.url.startsWith("/")) {
      return raw.url;
    }

    const chatId = (
      data.chatId ||
      data.chat ||
      metadata.chatId ||
      metadata.chat ||
      (raw.entityType === "chat" || t === "chat_message" || t === "chat"
        ? raw.entityId
        : undefined)
    ) as string | undefined;

    if (chatId) return `/chats/${chatId}`;

    const rideId = (
      data.rideId ||
      data.ride ||
      metadata.rideId ||
      metadata.ride ||
      (raw.entityType === "ride" ||
      t.includes("ride") ||
      t.includes("request") ||
      t.includes("booking")
        ? raw.entityId
        : undefined)
    ) as string | undefined;

    if (rideId) return `/rides/${rideId}`;

    const userId = (
      data.userId ||
      data.user ||
      metadata.userId ||
      metadata.user ||
      (raw.entityType === "user" ||
      t.includes("review") ||
      t.includes("rating") ||
      t.includes("profile")
        ? raw.entityId
        : undefined)
    ) as string | undefined;

    if (userId && (t === "review" || t === "rating" || t === "profile")) {
      return `/profile/${userId}`;
    }

    if (t === "chat_message" || t === "chat") return "/chats";
    if (t.includes("ride") || t.includes("request")) return "/my-rides";

    return "/notifications";
  }

  async function handleNotificationItemClick(item: Notification) {
    const isRead = isNotificationRead(item);
    if (!isRead) {
      try {
        await markNotificationRead(item._id);
        markAsRead(item._id);
      } catch (err) {
        console.error("Unable to mark as read:", err);
      }
    }
    setShowNotificationDropdown(false);
    const dest = getNotificationDestination(item);
    router.push(dest);
  }

  function getNotificationIcon(type?: string) {
    const t = (type ?? "").toLowerCase();
    if (t === "chat_message" || t === "chat") {
      return <MessageSquare size={14} className="text-[#C8522E]" />;
    }
    if (t.includes("ride") || t.includes("request") || t.includes("booking")) {
      return <Car size={14} className="text-[#C8522E]" />;
    }
    if (t.includes("verify") || t.includes("shield")) {
      return <ShieldCheck size={14} className="text-[#2E6F40]" />;
    }
    return <Sparkles size={14} className="text-[#C8522E]" />;
  }

  const navLinks = [
    {
      label: "Find a Ride",
      href: "/home",
      isActive:
        pathname === "/home" ||
        pathname === "/" ||
        pathname.startsWith("/rides"),
    },
    {
      label: "Offer a Ride",
      href: "/post-ride",
      isActive: pathname.startsWith("/post-ride"),
    },
    {
      label: "My Rides",
      href: "/my-rides",
      isActive: pathname.startsWith("/my-rides"),
    },
    {
      label: "Messages",
      href: "/chats",
      isActive: pathname.startsWith("/chats"),
      unreadBadge: chatUnreadCount > 0,
      ariaLabel:
        chatUnreadCount > 0
          ? `${chatUnreadCount} unread chats`
          : "Messages",
    },
  ];

  const isNotificationsActive = pathname.startsWith("/notifications");
  const isProfileActive = pathname.startsWith("/profile");

  const recentNotifications = notifications.slice(0, 5);

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
        <div className="hidden h-full items-center gap-8 md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.isActive ? "page" : undefined}
              aria-label={item.ariaLabel}
              className={`relative flex h-full items-center gap-2 font-sans text-sm transition-colors ${
                item.isActive
                  ? "font-bold text-[#C8522E]"
                  : "font-semibold text-slate-600 hover:text-[#C8522E]"
              }`}
            >
              <span>{item.label}</span>

              {item.unreadBadge && (
                <span className="flex h-2 w-2 rounded-full bg-[#C8522E]" />
              )}

              {item.isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#C8522E]" />
              )}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications Trigger & Dropdown Container */}
          <div className="relative" ref={notificationDropdownRef}>
            <button
              type="button"
              onClick={toggleNotificationDropdown}
              aria-expanded={showNotificationDropdown}
              aria-haspopup="true"
              aria-label={
                unreadCount > 0
                  ? `${unreadCount} unread notifications`
                  : "Notifications"
              }
              className={`relative flex h-10 w-10 items-center justify-center rounded-full transition ${
                showNotificationDropdown || isNotificationsActive
                  ? "bg-[#FAF8F5] text-[#C8522E] ring-1 ring-[#C8522E]/30"
                  : "text-slate-600 hover:bg-[#FAF8F5] hover:text-[#C8522E]"
              }`}
            >
              <Bell size={19} />

              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C8522E] px-1 text-[9px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Popup */}
            {showNotificationDropdown && (
              <div className="absolute right-0 top-full mt-2.5 w-80 sm:w-96 z-50 rounded-2xl border border-[#EAE6DF] bg-white shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAE6DF] bg-[#FAF8F5]/80">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-xs font-bold text-[#1E2022]">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-[#C8522E] px-2 py-0.5 text-[10px] font-bold text-white">
                        {unreadCount} new
                      </span>
                    )}
                  </div>

                  {isAuthenticated && unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C8522E] hover:underline"
                    >
                      <CheckCheck size={13} />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                {/* Body */}
                <div className="max-h-[340px] overflow-y-auto">
                  {!isAuthenticated ? (
                    <div className="p-6 text-center space-y-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] mx-auto text-[#C8522E]">
                        <Bell size={18} />
                      </div>
                      <p className="text-xs font-bold text-[#1E2022]">
                        Sign in to view notifications
                      </p>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                        Stay updated on ride confirmations, co-traveler messages, and booking updates.
                      </p>
                      <Link
                        href="/login"
                        onClick={() => setShowNotificationDropdown(false)}
                        className="inline-flex items-center justify-center rounded-xl bg-[#C8522E] px-4 py-2 font-sans text-xs font-bold text-white shadow-xs transition hover:bg-[#B34524]"
                      >
                        Sign In to SahaYatri
                      </Link>
                    </div>
                  ) : loadingNotifications && recentNotifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-xs font-semibold text-slate-500">
                        Loading notifications...
                      </p>
                    </div>
                  ) : recentNotifications.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FAF8F5] border border-[#EAE6DF] mx-auto text-slate-400">
                        <Bell size={18} />
                      </div>
                      <p className="text-xs font-bold text-[#1E2022]">
                        No notifications yet
                      </p>
                      <p className="text-[11px] text-slate-500">
                        When you get booking updates or messages, they will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#EAE6DF]/60">
                      {recentNotifications.map((item) => {
                        const isRead = isNotificationRead(item);

                        return (
                          <button
                            key={item._id}
                            type="button"
                            onClick={() => handleNotificationItemClick(item)}
                            className={`w-full text-left p-3.5 flex items-start gap-3 transition hover:bg-[#FAF8F5] ${
                              !isRead ? "bg-[#FAF8F5]/60" : "bg-white"
                            }`}
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white border border-[#EAE6DF] shadow-2xs">
                              {getNotificationIcon(item.type)}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline justify-between gap-1.5">
                                <h4
                                  className={`text-xs truncate ${
                                    !isRead
                                      ? "font-bold text-[#1E2022]"
                                      : "font-semibold text-slate-700"
                                  }`}
                                >
                                  {item.title || "Notification"}
                                </h4>
                                <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                                  {formatRelativeTime(item.createdAt)}
                                </span>
                              </div>

                              {item.message && (
                                <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                  {item.message}
                                </p>
                              )}
                            </div>

                            {!isRead && (
                              <span className="h-2 w-2 rounded-full bg-[#C8522E] shrink-0 mt-1.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer: See All Link */}
                <div className="p-2 border-t border-[#EAE6DF] bg-[#FAF8F5]/50">
                  <Link
                    href="/notifications"
                    onClick={() => setShowNotificationDropdown(false)}
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl font-sans text-xs font-bold text-[#C8522E] hover:bg-[#C8522E]/10 transition"
                  >
                    <span>See All Notifications</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Badge / Profile */}
          <Link
            href="/profile"
            aria-current={isProfileActive ? "page" : undefined}
            aria-label="Profile"
            className={`flex items-center gap-2 rounded-full border p-1.5 pr-3 transition ${
              isProfileActive
                ? "border-[#C8522E] bg-[#FAF8F5] ring-2 ring-[#C8522E]/20"
                : "border-[#EAE6DF] bg-[#FAF8F5] hover:border-slate-300"
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center border border-[#EAE6DF] overflow-hidden rounded-full bg-[#1E2022] font-sans text-xs font-bold text-white">
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