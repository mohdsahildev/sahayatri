"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { getChats, type Chat } from "@/lib/api/chat";
import { useAuthStore } from "@/lib/stores/auth.store";
import RideChat from "@/components/rides/ride-chat";

interface ChatPageProps {
  params: Promise<{
    chatId: string;
  }>;
}

export default function ChatPage({
  params,
}: ChatPageProps) {
  const user = useAuthStore((state) => state.user);

  const [chatId, setChatId] = useState("");
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChat() {
      try {
        const { chatId: id } = await params;

        setChatId(id);

        const response = await getChats();

        const currentChat = response.data.chats.find(
          (item) => item._id === id
        );

        setChat(currentChat ?? null);
      } catch (error) {
        console.error("Unable to load chat:", error);
      } finally {
        setLoading(false);
      }
    }

    loadChat();
  }, [params]);


  if (loading) {
    return (
      <main className="mx-auto w-full max-w-[900px] px-5 py-8 sm:px-8">
        <p className="text-sm text-slate-500">
          Loading chat...
        </p>
      </main>
    );
  }

  if (!chat) {
    return (
      <main className="mx-auto w-full max-w-[900px] px-5 py-8 sm:px-8">
        <Link
          href="/chats"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-primary"
        >
          <ArrowLeft size={16} />
          Back to chats
        </Link>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-lg font-bold text-secondary">
            Chat not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            This conversation may no longer be available.
          </p>
        </div>
      </main>
    );
  }

  const otherParticipant = chat.participants?.find(
    (participant) => participant._id !== user?._id
  );

  if (!otherParticipant) {
    return (
      <main className="mx-auto w-full max-w-[900px] px-5 py-8 sm:px-8">
        <Link
        href="/chats"
        onClick={() => {
          sessionStorage.setItem(
            `chat-read-${chatId}`,
            "true"
          );
        }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-primary"
        >
          <ArrowLeft size={16} />
          Back to chats
        </Link>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-lg font-bold text-secondary">
            Unable to open conversation
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[900px] px-5 py-8 sm:px-8">
      <Link
        href="/chats"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-primary"
      >
        <ArrowLeft size={16} />
        Back to chats
      </Link>

      <div className="mt-6">
        <RideChat
          chatId={chatId}
          receiverId={otherParticipant._id}
          receiverName={otherParticipant.name ?? "SahaYatri user"}
        />
      </div>
    </main>
  );
}