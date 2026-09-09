"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, ShieldCheck, ArrowRight, Lock } from "lucide-react";
import {
  getMessages,
  sendMessage,
  markMessageSeen,
  type Message,
} from "@/lib/api/chat";
import { getSocket } from "@/lib/socket";
import { useAuthStore } from "@/lib/stores/auth.store";

interface RideChatProps {
  chatId: string;
  receiverId: string;
  receiverName: string;
}

export default function RideChat({
  chatId,
  receiverId,
  receiverName,
}: RideChatProps) {
  const user = useAuthStore((state) => state.user);

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadMessages() {
      try {
        const response = await getMessages(chatId);
        const loadedMessages = response.data.messages ?? [];

        setMessages(loadedMessages);

        const incomingMessages = loadedMessages.filter((message) => {
          const senderId =
            typeof message.sender === "string"
              ? message.sender
              : message.sender?._id;

          return senderId && senderId !== user?._id;
        });

        await Promise.all(
          incomingMessages.map((message) =>
            markMessageSeen(message._id).catch((error) => {
              console.error("Unable to mark message as seen:", error);
            })
          )
        );
      } catch (error) {
        console.error("Unable to load messages:", error);
      } finally {
        setLoading(false);
      }
    }

    loadMessages();
  }, [chatId, user?._id]);

  // Join chat room + listen for live messages
  useEffect(() => {
    const socket = getSocket();

    const joinChat = () => {
      socket.emit(
        "join_chat",
        { chatId },
        (response: { ok: boolean; chatId?: string; message?: string }) => {
          if (!response?.ok) {
            console.error("Unable to join chat:", response?.message);
          }
        }
      );
    };

    const handleMessage = (payload: { chatId: string; message: Message }) => {
      if (payload.chatId !== chatId) return;

      setMessages((current) => {
        if (current.some((item) => item._id === payload.message._id)) {
          return current;
        }

        return [...current, payload.message];
      });
    };

    socket.on("receive_message", handleMessage);

    if (socket.connected) {
      joinChat();
    } else {
      socket.once("connect", joinChat);
    }

    return () => {
      socket.off("receive_message", handleMessage);
      socket.off("connect", joinChat);

      if (socket.connected) {
        socket.emit("leave_chat", { chatId });
      }
    };
  }, [chatId]);

  // Scroll to newest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const content = text.trim();

    if (!content || sending) return;

    setSending(true);

    try {
      const response = await sendMessage(chatId, content);
      const newMessage = response.data.message;

      setMessages((current) => {
        if (current.some((message) => message._id === newMessage._id)) {
          return current;
        }

        return [...current, newMessage];
      });

      setText("");
    } catch (error) {
      console.error("Unable to send message:", error);
    } finally {
      setSending(false);
    }
  }

  function getSenderId(message: Message) {
    if (typeof message.sender === "string") {
      return message.sender;
    }

    return message.sender?._id;
  }

  function formatMessageTime(dateStr?: string) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-4">
      {/* Participant Header Card */}
      <div className="flex flex-col gap-4 rounded-3xl border border-[#EAE6DF] bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-[#1E2022] font-sans text-base font-bold text-white shadow-xs">
            {receiverName.charAt(0).toUpperCase()}
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#2E6F40]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-sans text-xl font-bold text-[#1E2022]">
                {receiverName}
              </h2>
              <span className="rounded-full bg-[#EAF4ED] px-2.5 py-0.5 text-[10px] font-bold text-[#2E6F40]">
                Verified Match
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Community Co-Traveler · Verified Identity
            </p>
          </div>
        </div>

        {receiverId && (
          <Link
            href={`/profile/${receiverId}`}
            className="inline-flex items-center gap-1.5 self-start rounded-xl border border-[#EAE6DF] bg-[#FAF8F5] px-4 py-2.5 text-xs font-bold text-[#1E2022] transition hover:border-slate-300 hover:bg-slate-100 sm:self-auto"
          >
            <span>View Profile</span>
            <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {/* Main Chat Conversation Container */}
      <div className="flex h-[520px] flex-col overflow-hidden rounded-3xl border border-[#EAE6DF] bg-white shadow-xs">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* Date Indicator Pill */}
          <div className="my-3 text-center">
            <span className="inline-block rounded-full bg-[#FAF8F5] border border-[#EAE6DF] px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Transit Conversation
            </span>
          </div>

          {/* System Coordination Banner */}
          <div className="my-5 flex items-start gap-3 rounded-2xl border border-[#D0E5D5] bg-[#EAF4ED] p-4 text-xs text-[#2E6F40]">
            <ShieldCheck size={18} className="shrink-0 text-[#2E6F40] mt-0.5" />
            <div>
              <span className="font-bold block">Transit Coordination Active</span>
              <span>
                Booking confirmed. Chat opened strictly for pickup spots, departure timing, and trip coordination.
              </span>
            </div>
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm font-semibold text-slate-500">
              Loading message history...
            </p>
          ) : messages.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-slate-600">
                No messages yet in this conversation.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Say hello to start coordinating your pickup!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const mine = getSenderId(message) === user?._id;

                return (
                  <div
                    key={message._id}
                    className={`flex flex-col ${
                      mine ? "items-end" : "items-start"
                    }`}
                  >
                    {/* Sender & Timestamp Header */}
                    <div className="mb-1 text-[11px] font-semibold text-slate-400 px-1">
                      {mine ? (
                        <span>{formatMessageTime(message.createdAt)} · You</span>
                      ) : (
                        <span>
                          {receiverName} · {formatMessageTime(message.createdAt)}
                        </span>
                      )}
                    </div>

                    {/* Right-aligned or Left-aligned Natural Width Message Bubble */}
                    <div
                      className={`w-fit max-w-[75%] rounded-2xl px-5 py-3 text-sm leading-relaxed break-words ${
                        mine
                          ? "rounded-tr-xs bg-[#C8522E] text-white shadow-xs"
                          : "rounded-tl-xs bg-[#FAF8F5] border border-[#EAE6DF] text-[#1E2022]"
                      }`}
                    >
                      {message.text ?? ""}
                    </div>
                  </div>
                );
              })}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Message Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-[#EAE6DF] bg-[#FAF8F5] p-3 sm:p-4"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={`Type your message to ${receiverName}...`}
              disabled={sending}
              className="min-w-0 flex-1 rounded-2xl border border-[#EAE6DF] bg-white px-5 py-3.5 text-sm font-semibold text-[#1E2022] outline-none placeholder:text-slate-400 focus:border-[#C8522E]"
            />

            <button
              type="submit"
              disabled={!text.trim() || sending}
              className="flex items-center gap-2 rounded-2xl bg-[#C8522E] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#B34524] disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
            >
              <span>{sending ? "Sending..." : "Send"}</span>
              <Send size={15} />
            </button>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="flex items-center gap-1">
              <Lock size={12} className="text-[#2E6F40]" />
              For ride and pickup coordination with verified travelers.
            </span>
            <span className="hidden sm:inline">Press Enter to send</span>
          </div>
        </form>
      </div>
    </div>
  );
}