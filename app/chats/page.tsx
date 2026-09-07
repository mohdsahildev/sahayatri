"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { getChats, type Chat } from "@/lib/api/chat";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/lib/stores/auth.store";

export default function ChatsPage() {
  const user = useAuthStore((state) => state.user);

  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChats() {
      try {
        const response = await getChats();
        const loadedChats = response.data.chats ?? [];

        const chatsWithLocalReadState = loadedChats.map(
          (chat) => {
            const wasRead = sessionStorage.getItem(
              `chat-read-${chat._id}`
            );
          
            if (wasRead === "true") {
              sessionStorage.removeItem(
                `chat-read-${chat._id}`
              );
            
              return {
                ...chat,
                unreadCount: 0,
              };
            }
          
            return chat;
          }
        );
        
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

      if (!notification) return;

      if (notification.type !== "chat_message") {
        return;
      }

      const chatId = notification.entityId;

      if (!chatId) return;

      const now =
        notification.createdAt ??
        new Date().toISOString();

      setChats((current) => {
        const index = current.findIndex(
          (chat) => chat._id === chatId
        );

        if (index === -1) {
          return current;
        }

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
          ...current.filter(
            (_, chatIndex) => chatIndex !== index
          ),
        ];
      });
    };

    socket.on(
      "notification:new",
      handleNotification
    );

    return () => {
      socket.off(
        "notification:new",
        handleNotification
      );
    };
  }, []);

  function getOtherParticipant(chat: Chat) {
    return (chat.participants ?? []).find(
      (participant) => participant._id !== user?._id
    );
  }
  function formatTime(date?: string) {
    if (!date) return "";
    
    return new Date(date).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <main className="mx-auto w-full max-w-[900px] px-5 py-8 sm:px-8">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="text-primary" size={24} />

          <h1 className="text-2xl font-bold text-secondary">
            Chats
          </h1>
        </div>

        <p className="mt-1 text-sm text-slate-500">
          Your ride conversations
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">
          Loading chats...
        </p>
      ) : chats.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <MessageCircle
            className="mx-auto text-slate-400"
            size={32}
          />

          <h2 className="mt-3 font-semibold text-secondary">
            No chats yet
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your ride conversations will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {chats.map((chat) => {
            const participant = getOtherParticipant(chat);
            const unread = chat.unreadCount ?? 0;

            return (
              <Link
                key={chat._id}
                href={`/chats/${chat._id}`}
                className="flex items-center gap-4 border-b border-slate-100 p-4 transition hover:bg-slate-50 last:border-b-0"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral font-semibold text-secondary">
                  {participant?.profilePic ? (
                    <img
                      src={participant.profilePic}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    participant?.name?.charAt(0).toUpperCase() ??
                    "?"
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h2
                      className={`truncate ${
                        unread
                          ? "font-bold text-secondary"
                          : "font-semibold text-secondary"
                      }`}
                    >
                      {participant?.name ?? "SahaYatri user"}
                    </h2>

                    <span className="shrink-0 text-xs text-slate-400">
                      {formatTime(chat.updatedAt)}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-2">
                    <p
                      className={`min-w-0 flex-1 truncate text-sm ${
                        unread
                          ? "font-semibold text-secondary"
                          : "text-slate-500"
                      }`}
                    >
                      {chat.lastMessage?.text ?? "No messages yet"}
                    </p>

                    {unread > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-white">
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}