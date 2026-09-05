"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  CheckCheck,
} from "lucide-react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useNotificationStore } from "@/lib/stores/notification.store";

function formatTime(date?: string) {
  if (!date) return "";

  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const notifications = useNotificationStore(
    (state) => state.notifications
  );

  const setNotifications = useNotificationStore(
    (state) => state.setNotifications
  );

  const markAsRead = useNotificationStore(
    (state) => state.markAsRead
  );

  const markAllAsRead = useNotificationStore(
    (state) => state.markAllAsRead
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function loadNotifications() {
      try {
        setError("");

        const response = await getNotifications();

        setNotifications(
          response.data.notifications ?? []
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load notifications"
        );
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, [isAuthenticated, setNotifications]);

  async function handleRead(
    notificationId: string
  ) {
    try {
      await markNotificationRead(notificationId);

      markAsRead(notificationId);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to mark notification as read"
      );
    }
  }

  async function handleReadAll() {
    try {
      await markAllNotificationsRead();

      markAllAsRead();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to mark notifications as read"
      );
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="mx-auto w-full max-w-[900px] px-5 py-10 sm:px-8">
        <h1 className="text-2xl font-bold text-secondary">
          Notifications
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Please log in to view your notifications.
        </p>

        <Link
          href="/login"
          className="mt-5 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white"
        >
          Log in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[900px] px-5 py-8 sm:px-8">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 text-sm font-semibold text-secondary"
        >
          <ArrowLeft size={16} />
          Back
        </Link>

        {notifications.some(
          (notification) => !notification.read
        ) && (
          <button
            type="button"
            onClick={handleReadAll}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            <CheckCheck size={16} />
            Mark all read
          </button>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
          <Bell
            size={21}
            className="text-primary"
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-secondary">
            Notifications
          </h1>

          <p className="text-sm text-slate-500">
            Stay updated on your rides and requests.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-slate-500">
          Loading notifications...
        </p>
      ) : notifications.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <Bell
            size={28}
            className="mx-auto text-slate-300"
          />

          <p className="mt-3 text-sm font-semibold text-secondary">
            No notifications yet
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Ride requests and updates will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {notifications.map((notification) => (
            <button
              key={notification._id}
              type="button"
              onClick={() =>
                !notification.read &&
                handleRead(notification._id)
              }
              className={`w-full rounded-2xl border p-4 text-left transition ${
                notification.read
                  ? "border-slate-200 bg-white"
                  : "border-primary/20 bg-primary/5"
              }`}
            >
              <div className="flex gap-3">
                <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold text-secondary">
                      {notification.title ??
                        "Notification"}
                    </p>

                    {!notification.read && (
                      <span className="shrink-0 text-[10px] font-bold uppercase text-primary">
                        New
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm leading-5 text-slate-600">
                    {notification.message ??
                      "You have a new update."}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {formatTime(notification.createdAt)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}