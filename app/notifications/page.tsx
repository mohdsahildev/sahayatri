"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  XCircle,
  MessageCircle,
  Star,
  ShieldCheck,
  PlayCircle,
  ChevronRight,
  Users,
  RotateCcw,
  ArrowRight,
  ExternalLink,
  Clock,
  UserPlus,
  Reply,
} from "lucide-react";
import Navbar from "@/components/layout/navbar";
import LandingFooter from "@/components/landing/landing-footer";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type Notification,
} from "@/lib/api/notifications";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useNotificationStore } from "@/lib/stores/notification.store";

export default function NotificationsPage() {
  const router = useRouter();

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const setNotifications = useNotificationStore((state) => state.setNotifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);

  function isNotificationRead(item: Notification): boolean {
    return item.isRead !== undefined ? Boolean(item.isRead) : Boolean(item.read);
  }

  async function loadNotifications() {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await getNotifications(1, 50);
      const rawNotifications = response.data.notifications ?? [];
      const normalized = rawNotifications.map((item) => {
        const isRead = item.isRead !== undefined ? Boolean(item.isRead) : Boolean(item.read);
        return {
          ...item,
          read: isRead,
          isRead: isRead,
        };
      });
      setNotifications(normalized);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, [isAuthenticated]);

  // Comprehensive destination resolver for chats, rides, profiles, etc.
  function getNotificationDestination(item: Notification): string | null {
    const raw = item as unknown as Record<string, unknown>;
    const data = (item.data ?? {}) as Record<string, unknown>;
    const metadata = (raw.metadata ?? {}) as Record<string, unknown>;
    const t = (item.type ?? "").toLowerCase();

    // 1. Direct URL if provided
    if (typeof raw.url === "string" && raw.url.startsWith("/")) {
      return raw.url;
    }

    // 2. Chat ID resolution
    const chatId = (
      data.chatId ||
      data.chat ||
      metadata.chatId ||
      metadata.chat ||
      (raw.entityType === "chat" || t === "chat_message" || t === "chat" ? raw.entityId : undefined)
    ) as string | undefined;

    if (chatId) {
      return `/chats/${chatId}`;
    }

    // 3. Ride ID resolution
    const rideId = (
      data.rideId ||
      data.ride ||
      metadata.rideId ||
      metadata.ride ||
      (raw.entityType === "ride" || t.includes("ride") || t.includes("request") || t.includes("booking") ? raw.entityId : undefined)
    ) as string | undefined;

    if (rideId) {
      return `/rides/${rideId}`;
    }

    // 4. User ID resolution (for reviews / profiles)
    const userId = (
      data.userId ||
      data.user ||
      metadata.userId ||
      metadata.user ||
      (raw.entityType === "user" || t.includes("review") || t.includes("rating") || t.includes("profile") ? raw.entityId : undefined)
    ) as string | undefined;

    if (userId && (t === "review" || t === "rating" || t === "profile")) {
      return `/profile/${userId}`;
    }

    // 5. Fallbacks based on category
    if (t === "chat_message" || t === "chat") {
      return "/chats";
    }

    if (t.includes("ride") || t.includes("request")) {
      return "/my-rides";
    }

    return null;
  }

  async function handleNotificationClick(item: Notification, customTarget?: string) {
    const isRead = isNotificationRead(item);

    // 1. If unread, mark it read
    if (!isRead) {
      try {
        await markNotificationRead(item._id);
        markAsRead(item._id);
      } catch (err) {
        console.error("Unable to mark notification as read:", err);
      }
    }

    // 2. Resolve contextual navigation destination
    const destination = customTarget || getNotificationDestination(item);
    if (destination) {
      router.push(destination);
    }
  }

  async function handleReadAll() {
    if (unreadCount === 0 || markingAll) return;

    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      markAllAsRead();
    } catch (err) {
      console.error("Unable to mark all notifications as read:", err);
    } finally {
      setMarkingAll(false);
    }
  }

  // Friendly relative time formatting
  function formatRelativeTime(dateStr?: string): string {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  }

  // Helper to determine notification icon container
  function getNotificationIcon(type?: string) {
    const t = type?.toLowerCase() ?? "";

    if (t === "chat_message" || t === "chat") {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDF2E9] text-[#C8522E] border border-[#FADBD8]">
          <MessageCircle size={18} />
        </div>
      );
    }

    if (t === "request_accepted" || t === "booking_confirmed" || t === "ride_completed") {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF4ED] text-[#2E6F40] border border-[#D0E5D5]">
          <CheckCircle2 size={18} />
        </div>
      );
    }

    if (t === "passenger_verified" || t === "boarding_verified") {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF4ED] text-[#2E6F40] border border-[#D0E5D5]">
          <ShieldCheck size={18} />
        </div>
      );
    }

    if (t === "request_rejected" || t === "booking_declined" || t === "request_cancelled" || t === "ride_cancelled") {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8FAFC] text-slate-400 border border-slate-200">
          <XCircle size={18} />
        </div>
      );
    }

    if (t === "ride_started" || t === "ride_update") {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F5F9] text-slate-500 border border-slate-200">
          <Clock size={18} />
        </div>
      );
    }

    if (t === "review" || t === "rating") {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FEF9EE] text-[#D97706] border border-[#FDE68A]">
          <Star size={18} />
        </div>
      );
    }

    if (t === "request_received" || t === "ride_request") {
      return (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDF2E9] text-[#C8522E] border border-[#FADBD8]">
          <UserPlus size={18} />
        </div>
      );
    }

    // Default neutral bell
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF8F5] text-slate-500 border border-[#EAE6DF]">
        <Bell size={18} />
      </div>
    );
  }

  // Filtered notifications list
  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "unread") {
      return !isNotificationRead(item);
    }
    return true;
  });

  // Split into Today and Earlier groups
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayNotifications: Notification[] = [];
  const earlierNotifications: Notification[] = [];

  filteredNotifications.forEach((item) => {
    if (!item.createdAt) {
      earlierNotifications.push(item);
      return;
    }

    const itemDate = new Date(item.createdAt);
    const itemDay = new Date(itemDate);
    itemDay.setHours(0, 0, 0, 0);

    if (itemDay.getTime() === today.getTime()) {
      todayNotifications.push(item);
    } else {
      earlierNotifications.push(item);
    }
  });

  const todayUnreadCount = todayNotifications.filter((n) => !isNotificationRead(n)).length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E2022] font-body flex flex-col justify-between selection:bg-[#C8522E] selection:text-white">
      <div>
        <Navbar />

        <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 md:px-8 space-y-6">
          {/* Unauthenticated View */}
          {!isAuthenticated ? (
            <div className="rounded-3xl border border-[#EAE6DF] bg-white p-10 text-center shadow-xs space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] mx-auto text-[#C8522E]">
                <Bell size={22} />
              </div>
              <h1 className="font-sans text-2xl font-black text-[#1E2022]">
                Sign In to View Notifications
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Sign in to SahaYatri to view your booking updates, seat requests, and messages.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl bg-[#C8522E] px-6 py-2.5 font-sans text-xs font-bold text-white shadow-xs transition hover:bg-[#B34524]"
                >
                  Sign In to SahaYatri
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Page Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
                <div>
                  <h1 className="font-sans text-3xl sm:text-4xl font-black tracking-tight text-[#1E2022]">
                    Notifications
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500">
                    Stay updated on your rides, requests and conversations.
                  </p>
                </div>

                {/* Right Header Toolbar: All / Unread pills + Mark all as read */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center rounded-xl bg-[#EFECE6] p-0.5 border border-[#EAE6DF]">
                    <button
                      type="button"
                      onClick={() => setActiveTab("all")}
                      className={`rounded-lg px-3.5 py-1.5 font-sans text-xs font-bold transition ${
                        activeTab === "all"
                          ? "bg-white text-[#1E2022] shadow-xs"
                          : "text-slate-600 hover:text-[#1E2022]"
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("unread")}
                      className={`rounded-lg px-3.5 py-1.5 font-sans text-xs font-bold transition ${
                        activeTab === "unread"
                          ? "bg-white text-[#1E2022] shadow-xs"
                          : "text-slate-600 hover:text-[#1E2022]"
                      }`}
                    >
                      Unread {unreadCount > 0 ? `(${unreadCount})` : ""}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleReadAll}
                    disabled={unreadCount === 0 || markingAll}
                    className={`inline-flex items-center gap-1.5 rounded-xl border border-[#EAE6DF] px-3.5 py-2 font-sans text-xs font-bold transition ${
                      unreadCount > 0
                        ? "bg-[#FAF8F5] text-[#C8522E] shadow-xs hover:bg-[#F3EFEA] hover:border-[#1E2022]/20"
                        : "bg-slate-50 text-slate-400 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <CheckCheck size={14} className={unreadCount > 0 ? "text-[#C8522E]" : "text-slate-400"} />
                    <span>{markingAll ? "Marking..." : "Mark all as read"}</span>
                  </button>
                </div>
              </div>

              {/* Error Message with Retry */}
              {error && (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={loadNotifications}
                    className="inline-flex items-center gap-1 font-bold text-rose-800 underline hover:no-underline"
                  >
                    <RotateCcw size={12} />
                    <span>Retry</span>
                  </button>
                </div>
              )}

              {/* Content / Feed */}
              {loading ? (
                /* Loading Skeleton Cards */
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 rounded-2xl border border-[#EAE6DF] bg-white p-5 sm:p-6 shadow-xs animate-pulse"
                    >
                      <div className="h-10 w-10 rounded-xl bg-slate-100 shrink-0" />
                      <div className="flex-1 space-y-2.5 min-w-0">
                        <div className="h-4 w-1/3 bg-slate-100 rounded" />
                        <div className="h-3 w-2/3 bg-slate-100 rounded" />
                        <div className="h-6 w-28 bg-slate-100 rounded" />
                      </div>
                      <div className="h-3 w-12 bg-slate-100 rounded shrink-0" />
                    </div>
                  ))}
                </div>
              ) : filteredNotifications.length === 0 ? (
                /* Empty States */
                <div className="rounded-3xl border border-[#EAE6DF] bg-white p-12 text-center shadow-xs space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#EAE6DF] mx-auto text-slate-400">
                    <Bell size={22} />
                  </div>

                  {activeTab === "unread" ? (
                    <>
                      <h2 className="font-sans text-base font-bold text-[#1E2022]">
                        No unread notifications
                      </h2>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        You&apos;re all caught up on your ride updates and messages.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="font-sans text-base font-bold text-[#1E2022]">
                        No notifications yet
                      </h2>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Your ride activity, requests, and co-traveler updates will appear here.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                /* Grouped Notification Feed */
                <div className="space-y-8">
                  {/* 1. Today's Notifications */}
                  {todayNotifications.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <h2 className="font-sans text-xs font-black uppercase tracking-wider text-[#1E2022]">
                          Today
                        </h2>
                        {todayUnreadCount > 0 && (
                          <span className="text-[11px] font-bold text-slate-400">
                            {todayUnreadCount} unread
                          </span>
                        )}
                      </div>

                      <div className="space-y-3">
                        {todayNotifications.map((item) => (
                          <NotificationCard
                            key={item._id}
                            item={item}
                            isRead={isNotificationRead(item)}
                            getIcon={getNotificationIcon}
                            onClick={() => handleNotificationClick(item)}
                            onNavigate={(destination) => handleNotificationClick(item, destination)}
                            formatTime={formatRelativeTime}
                            destination={getNotificationDestination(item)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Earlier Notifications */}
                  {earlierNotifications.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <h2 className="font-sans text-xs font-black uppercase tracking-wider text-[#1E2022]">
                          Earlier
                        </h2>
                        <span className="text-[11px] font-bold text-slate-400">
                          {earlierNotifications.length} updates
                        </span>
                      </div>

                      <div className="space-y-3">
                        {earlierNotifications.map((item) => (
                          <NotificationCard
                            key={item._id}
                            item={item}
                            isRead={isNotificationRead(item)}
                            getIcon={getNotificationIcon}
                            onClick={() => handleNotificationClick(item)}
                            onNavigate={(destination) => handleNotificationClick(item, destination)}
                            formatTime={formatRelativeTime}
                            destination={getNotificationDestination(item)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom "You're all caught up" Banner */}
                  <div className="mt-8 flex items-center gap-3 rounded-2xl border border-[#D5E5D8] bg-[#F4F9F5] p-4 text-xs text-slate-700 shadow-xs">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E3F2E6] text-[#2E6F40]">
                      <CheckCircle2 size={16} />
                    </div>
                    <p>
                      <strong className="font-bold text-[#1E2022]">You&apos;re all caught up</strong> — New ride requests, ride updates and messages will appear here.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <LandingFooter />
    </div>
  );
}

// Notification Card Component matching the design reference
interface NotificationCardProps {
  item: Notification;
  isRead: boolean;
  getIcon: (type?: string) => React.ReactNode;
  onClick: () => void;
  onNavigate: (destination: string) => void;
  formatTime: (dateStr?: string) => string;
  destination: string | null;
}

function NotificationCard({
  item,
  isRead,
  getIcon,
  onClick,
  onNavigate,
  formatTime,
  destination,
}: NotificationCardProps) {
  const t = item.type?.toLowerCase() ?? "";
  const data = (item.data ?? {}) as Record<string, unknown>;
  const boardingPin = (data.boardingPin || data.pin || data.boardingCode) as string | undefined;
  const isChat = t === "chat_message" || t === "chat";
  const isRequestReceived = t === "request_received" || t === "ride_request";
  const isAccepted = t === "request_accepted" || t === "booking_confirmed" || t === "ride_completed" || t === "passenger_verified";
  const isReview = t === "review" || t === "rating";
  const isStatusUpdate = t === "ride_started" || t === "ride_update";
  const isCancelled = t === "request_rejected" || t === "booking_declined" || t === "request_cancelled" || t === "ride_cancelled";

  const showMessage = Boolean(item.message && item.message.trim().length > 0 && item.message.trim() !== item.title?.trim());

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl border transition p-5 sm:p-6 shadow-xs ${
        destination || !isRead ? "cursor-pointer" : ""
      } ${
        !isRead
          ? "border-[#EAE6DF] bg-white hover:border-[#1E2022]/30 hover:shadow-sm"
          : "border-[#EAE6DF] bg-white hover:border-slate-300"
      }`}
    >
      {/* Unread Left Dot */}
      {!isRead && (
        <span
          className="absolute left-2.5 top-7 h-2 w-2 rounded-full bg-[#C8522E]"
          title="Unread notification"
        />
      )}

      <div className="flex items-start gap-4 sm:gap-4.5 pl-2 sm:pl-3">
        {/* Icon Container */}
        {getIcon(item.type)}

        {/* Content Body */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-sans text-sm sm:text-base font-bold text-[#1E2022] leading-snug">
              {item.title ?? "Notification"}
            </h3>
            <span className="text-xs font-medium text-slate-400 shrink-0 whitespace-nowrap pt-0.5">
              {formatTime(item.createdAt)}
            </span>
          </div>

          {/* Message Text / Custom Bubble */}
          {isChat && showMessage ? (
            <div className="mt-2.5 rounded-xl bg-[#F8F6F2] border border-[#EFECE6] px-3.5 py-2.5 text-xs text-slate-700 italic font-sans leading-relaxed">
              &ldquo;{item.message}&rdquo;
            </div>
          ) : showMessage ? (
            <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {item.message}
            </p>
          ) : null}

          {/* Boarding PIN Banner if available */}
          {boardingPin && (
            <div className="mt-2.5 inline-flex items-center gap-2 rounded-lg bg-[#F8F6F2] border border-[#EFECE6] px-3 py-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <span className="text-slate-400 font-semibold">BOARDING PIN</span>
              <span className="font-mono text-xs tracking-widest text-[#1E2022] font-black">{boardingPin}</span>
            </div>
          )}

          {/* Seat inventory note for cancelled if appropriate */}
          {isCancelled && !showMessage && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
              <Users size={12} />
              <span>1 seat back in inventory</span>
            </div>
          )}

          {/* Contextual Action Buttons & Links */}
          {isRequestReceived && destination && (
            <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(destination);
                }}
                className="rounded-xl bg-[#C8522E] px-4 py-2 font-sans text-xs font-bold text-white shadow-xs transition hover:bg-[#B34524]"
              >
                Review Request
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(destination);
                }}
                className="rounded-xl bg-[#EFECE6] px-4 py-2 font-sans text-xs font-bold text-[#1E2022] transition hover:bg-[#E5E1D8]"
              >
                Decline
              </button>
            </div>
          )}

          {/* Chat Action Buttons - Direct redirection to the specific chat */}
          {isChat && destination && (
            <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(destination);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#C8522E] px-4 py-2 font-sans text-xs font-bold text-white shadow-xs transition hover:bg-[#B34524]"
              >
                <Reply size={13} />
                <span>Reply</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(destination);
                }}
                className="rounded-xl bg-[#EFECE6] px-4 py-2 font-sans text-xs font-bold text-[#1E2022] transition hover:bg-[#E5E1D8]"
              >
                View Conversation
              </button>
            </div>
          )}

          {isAccepted && destination && (
            <div className="mt-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(destination);
                }}
                className="inline-flex items-center gap-1 font-sans text-xs font-bold text-[#C8522E] hover:underline"
              >
                <span>View Ride Details</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}

          {isReview && destination && (
            <div className="mt-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(destination);
                }}
                className="inline-flex items-center gap-1 font-sans text-xs font-bold text-[#C8522E] hover:underline"
              >
                <span>View Feedback</span>
                <ExternalLink size={13} />
              </button>
            </div>
          )}

          {isStatusUpdate && destination && (
            <div className="mt-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(destination);
                }}
                className="inline-flex items-center gap-1 font-sans text-xs font-bold text-[#C8522E] hover:underline"
              >
                <span>View Ride</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}