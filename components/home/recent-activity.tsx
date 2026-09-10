"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, MessageSquare, Star, ArrowRight, Bell } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { getNotifications, type Notification } from "@/lib/api/notifications";

export default function RecentActivitySection() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function loadActivity() {
      try {
        const response = await getNotifications(1, 3);
        setNotifications(response.data.notifications ?? []);
      } catch (error) {
        console.error("Unable to load recent activity:", error);
      } finally {
        setLoading(false);
      }
    }

    loadActivity();
  }, [isAuthenticated]);

  function getActivityIcon(type?: string) {
    if (type === "chat_message" || type === "chat") {
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF3EE] text-[#C8522E]">
          <MessageSquare size={18} />
        </div>
      );
    }
    if (type === "review" || type === "rating") {
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFFBF0] text-[#D97706]">
          <Star size={18} />
        </div>
      );
    }
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF4ED] text-[#2E6F40]">
        <CheckCircle2 size={18} />
      </div>
    );
  }

  function getActivityTag(type?: string) {
    if (type === "chat_message" || type === "chat") {
      return "NEW MESSAGE";
    }
    if (type === "review" || type === "rating") {
      return "FEEDBACK";
    }
    return "REQUEST ACCEPTED";
  }

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-xl font-bold tracking-tight text-[#1E2022]">
          Recent Activity
        </h2>

        <Link
          href="/notifications"
          className="inline-flex items-center gap-1 font-sans text-xs font-bold text-[#1E2022] transition hover:text-[#C8522E]"
        >
          <span>View all activity</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {!isAuthenticated ? (
        <div className="mt-4 rounded-3xl border border-[#EAE6DF] bg-white p-6 text-center shadow-xs">
          <p className="font-sans text-sm font-bold text-[#1E2022]">
            Log in to view your real-time ride updates & notifications
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Track ride requests, messages from hosts, and upcoming departures.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#1E2022] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#C8522E]"
          >
            Log In to View Activity
          </Link>
        </div>
      ) : loading ? (
        <div className="mt-4 rounded-3xl border border-[#EAE6DF] bg-white p-8 text-center text-xs font-semibold text-slate-400">
          Loading recent activity...
        </div>
      ) : notifications.length === 0 ? (
        <div className="mt-4 rounded-3xl border border-[#EAE6DF] bg-white p-6 text-center shadow-xs">
          <Bell size={24} className="mx-auto text-slate-300" />
          <p className="mt-2 text-xs font-bold text-[#1E2022]">No recent activity yet</p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Your booking updates and messages will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notifications.map((item) => (
            <div
              key={item._id}
              className="flex flex-col justify-between rounded-2xl border border-[#EAE6DF] bg-white p-4 shadow-xs transition hover:border-slate-300"
            >
              <div className="flex items-start gap-3">
                {getActivityIcon(item.type)}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {getActivityTag(item.type)}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                    </span>
                  </div>

                  <h3 className="mt-1 truncate font-sans text-sm font-bold text-[#1E2022]">
                    {item.title ?? item.message ?? "Activity update"}
                  </h3>

                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                    {item.message ?? ""}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
