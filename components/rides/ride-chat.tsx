"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
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
      
        const loadedMessages =
          response.data.messages ?? [];
      
        setMessages(loadedMessages);
      
        const incomingMessages =
          loadedMessages.filter((message) => {
            const senderId =
              typeof message.sender === "string"
                ? message.sender
                : message.sender?._id;
          
            return (
              senderId &&
              senderId !== user?._id
            );
          });
      
        await Promise.all(
          incomingMessages.map((message) =>
            markMessageSeen(message._id).catch(
              (error) => {
                console.error(
                  "Unable to mark message as seen:",
                  error
                );
              }
            )
          )
        );
      } catch (error) {
        console.error(
          "Unable to load messages:",
          error
        );
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
        (response: {
          ok: boolean;
          chatId?: string;
          message?: string;
        }) => {
          if (!response?.ok) {
            console.error(
              "Unable to join chat:",
              response?.message
            );
          }
        }
      );
    };

    const handleMessage = (payload: {
      chatId: string;
      message: Message;
    }) => {
      if (payload.chatId !== chatId) return;

      setMessages((current) => {
        if (
          current.some(
            (item) => item._id === payload.message._id
          )
        ) {
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
      const response = await sendMessage(
        chatId,
        content
      );

      const newMessage = response.data.message;

      setMessages((current) => {
        if (
          current.some(
            (message) => message._id === newMessage._id
          )
        ) {
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

  return (
    <div className="flex h-[520px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <h2 className="font-bold text-secondary">
          Chat with{" "}
          {receiverId ? (
            <Link
              href={`/profile/${receiverId}`}
              className="transition hover:text-primary"
            >
              {receiverName}
            </Link>
          ) : (
            receiverName
          )}
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Keep your ride coordination here.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <p className="text-center text-sm text-slate-500">
            Loading messages...
          </p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-slate-500">
            No messages yet. Say hello!
          </p>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const mine =
                getSenderId(message) === user?._id;

              return (
                <div
                  key={message._id}
                  className={`flex ${
                    mine
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      mine
                        ? "rounded-br-md bg-primary text-white"
                        : "rounded-bl-md bg-neutral text-secondary"
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

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-slate-200 p-3"
      >
        <input
          value={text}
          onChange={(event) =>
            setText(event.target.value)
          }
          placeholder="Type a message..."
          disabled={sending}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary"
        />

        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  );
}