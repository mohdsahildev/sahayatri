"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { Search, MessageSquare, ShieldCheck, CheckCheck } from "lucide-react";
import { getChats, type Chat } from "@/lib/api/chat";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/lib/stores/auth.store";
import Navbar from "@/components/layout/navbar";

export default function ChatsPage() {
  const user = useAuthStore((state) => state.user);

  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "unread">("all");

  useEffect(() => {
    async function loadChats() {
      setLoading(true);
      try {
        const response = await getChats();
        const loadedChats = response.data?.chats ?? [];

        const chatsWithLocalReadState = loadedChats.map((chat) => {
          const wasRead = sessionStorage.getItem(`chat-read-${chat._id}`);

          if (wasRead === "true") {
            sessionStorage.removeItem(`chat-read-${chat._id}`);
            return {
              ...chat,
              unreadCount: 0,
            };
          }

          return chat;
        });

        setChats(chatsWithLocalReadState);
      } catch (error) {
        console.error("Unable to load chats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadChats();
  }, []);

  useEffect(() => {
    const socket = getSocket();

    const handleNotification = (payload: {
      notification?: {
        type?: string;
        entityId?: string;
        body?: string;
        createdAt?: string;
      };
    }) => {
      const notification = payload.notification;

      if (!notification || notification.type !== "chat_message") {
        return;
      }

      const chatId = notification.entityId;
      if (!chatId) return;

      const now = notification.createdAt ?? new Date().toISOString();

      setChats((current) => {
        const index = current.findIndex((chat) => chat._id === chatId);

        if (index === -1) return current;

        const chat = current[index];

        const updatedChat: Chat = {
          ...chat,
          unreadCount: (chat.unreadCount ?? 0) + 1,
          updatedAt: now,
          lastMessage: {
            _id: `live-${Date.now()}`,
            text: notification.body ?? "New message",
            createdAt: now,
          },
        };

        return [
          updatedChat,
          ...current.filter((_, chatIndex) => chatIndex !== index),
        ];
      });
    };

    socket.on("notification:new", handleNotification);

    return () => {
      socket.off("notification:new", handleNotification);
    };
  }, []);

  function getOtherParticipant(chat: Chat) {
    return (chat.participants ?? []).find(
      (participant) => participant._id !== user?._id
    );
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

  const totalUnread = useMemo(() => {
    return chats.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
  }, [chats]);

  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      const participant = getOtherParticipant(chat);
      const participantName = participant?.name ?? "SahaYatri user";
      const messageText = chat.lastMessage?.text ?? "";

      const matchesSearch =
        participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        messageText.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTab =
        filterTab === "all" || (filterTab === "unread" && (chat.unreadCount ?? 0) > 0);

      return matchesSearch && matchesTab;
    });
  }, [chats, searchQuery, filterTab, user?._id]);

  return (
    <>
      <Navbar />

      <main className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8">
        {/* Top Tag & Title Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C8522E]">
              ● RIDE COORDINATION
            </span>
            <h1 className="mt-1 font-sans text-3xl font-black tracking-tight text-[#1E2022] sm:text-4xl">
              Messages
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Your direct ride coordination with hosts and co-travelers.
            </p>
          </div>

          {totalUnread > 0 && (
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D0E5D5] bg-[#EAF4ED] px-4 py-1.5 text-xs font-bold text-[#2E6F40]">
              <span className="h-2 w-2 rounded-full bg-[#2E6F40] animate-pulse" />
              <span>{totalUnread} unread transit update{totalUnread > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-[#EAE6DF] bg-white p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-[#FAF8F5] px-3.5 py-2.5">
            <Search size={17} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations by name or route..."
              className="w-full bg-transparent text-sm font-semibold text-[#1E2022] outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                filterTab === "all"
                  ? "bg-[#1E2022] text-white"
                  : "bg-[#FAF8F5] text-slate-600 hover:bg-slate-100"
              }`}
            >
              All
            </button>

            <button
              type="button"
              onClick={() => setFilterTab("unread")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                filterTab === "unread"
                  ? "bg-[#C8522E] text-white"
                  : "bg-[#FAF8F5] text-slate-600 hover:bg-slate-100"
              }`}
            >
              Unread ({totalUnread})
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="mt-6">
          {loading ? (
            <div className="rounded-3xl border border-[#EAE6DF] bg-white p-12 text-center shadow-xs">
              <p className="text-sm font-semibold text-slate-500">
                Loading conversations...
              </p>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="rounded-3xl border border-[#EAE6DF] bg-white p-12 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF8F5] text-slate-400">
                <MessageSquare size={28} />
              </div>
              <h3 className="mt-4 font-sans text-lg font-bold text-[#1E2022]">
                No conversations found
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {searchQuery || filterTab === "unread"
                  ? "Try adjusting your search or filter tab."
                  : "Your active ride conversations will appear here as soon as you connect with another traveler."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredChats.map((chat) => {
                const participant = getOtherParticipant(chat);
                const unread = chat.unreadCount ?? 0;

                return (
                  <div
                    key={chat._id}
                    className="relative flex items-center justify-between gap-4 rounded-2xl border border-[#EAE6DF] bg-white p-5 shadow-xs transition hover:border-[#C8522E]/40 hover:shadow-md"
                  >
                    {/* Main Chat Navigation Overlay */}
                    <Link
                      href={`/chats/${chat._id}`}
                      className="absolute inset-0 z-0 rounded-2xl"
                      aria-label={`Open conversation with ${participant?.name ?? "SahaYatri User"}`}
                    />

                    <div className="relative z-10 flex min-w-0 items-center gap-4 pointer-events-none">
                      {/* Avatar with status dot */}
                      {participant?._id ? (
                        <Link
                          href={`/profile/${participant._id}`}
                          className="pointer-events-auto relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FAF8F5] border border-[#EAE6DF] font-sans font-bold text-[#1E2022] transition hover:opacity-90"
                        >
                          {participant.profilePic ? (
                            <img
                              src={participant.profilePic}
                              alt=""
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            participant.name?.charAt(0).toUpperCase() ?? "S"
                          )}
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#2E6F40]" />
                        </Link>
                      ) : (
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FAF8F5] border border-[#EAE6DF] font-sans font-bold text-[#1E2022]">
                          {participant?.name?.charAt(0).toUpperCase() ?? "S"}
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#2E6F40]" />
                        </div>
                      )}

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {participant?._id ? (
                            <Link
                              href={`/profile/${participant._id}`}
                              className="pointer-events-auto font-sans font-bold text-[#1E2022] truncate text-base hover:text-[#C8522E] transition"
                            >
                              {participant.name ?? "SahaYatri User"}
                            </Link>
                          ) : (
                            <h2 className="font-sans font-bold text-[#1E2022] truncate text-base">
                              {participant?.name ?? "SahaYatri User"}
                            </h2>
                          )}

                          <span className="rounded-full bg-[#EAF4ED] px-2.5 py-0.5 text-[10px] font-bold text-[#2E6F40]">
                            Verified Match
                          </span>
                        </div>

                        <p
                          className={`mt-1 truncate text-xs ${
                            unread ? "font-bold text-[#1E2022]" : "text-slate-500"
                          }`}
                        >
                          &ldquo;{chat.lastMessage?.text ?? "No messages yet"}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Right Meta (Timestamp & Unread Badge) */}
                    <div className="relative z-10 flex shrink-0 flex-col items-end gap-1.5 pointer-events-none">
                      <span className="text-[11px] font-semibold text-slate-400">
                        {formatRelativeTime(chat.updatedAt)}
                      </span>

                      {unread > 0 ? (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C8522E] px-1.5 text-[11px] font-black text-white shadow-xs">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      ) : (
                        <CheckCheck size={16} className="text-slate-300" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Ride Communication Guidelines Box */}
        <div className="mt-10 rounded-3xl border border-[#EAE6DF] bg-[#FAF8F5] p-8 text-center shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-[#EAE6DF] text-[#C8522E]">
            <MessageSquare size={22} />
          </div>

          <h3 className="mt-4 font-sans text-lg font-bold text-[#1E2022]">
            Ride Communication Guidelines
          </h3>

          <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-slate-600">
            Chat is enabled strictly for coordinating pickup spots, delays, and passenger
            convenience along verified routes. Your ride conversations will appear here as soon as you connect with another traveler.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-[11px] font-bold text-slate-500 border-t border-[#EAE6DF] pt-5">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#2E6F40]" />
              <span>End-to-end verified transit profiles</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#2E6F40]" />
              <span>Direct intercity transit dispatch</span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}