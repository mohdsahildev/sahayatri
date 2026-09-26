"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { getChats, type Chat } from "@/lib/api/chat";
import { useAuthStore } from "@/lib/stores/auth.store";
import RideChat from "@/components/rides/ride-chat";
import Navbar from "@/components/layout/navbar";

interface ChatPageProps {
  params: Promise<{
    chatId: string;
  }>;
}

export default function ChatPage({ params }: ChatPageProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [chatId, setChatId] = useState("");
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    async function loadChat() {
      try {
        const { chatId: id } = await params;
        setChatId(id);

        const response = await getChats();
        const currentChat = response.data.chats.find((item) => item._id === id);

        setChat(currentChat ?? null);
      } catch (error) {
        console.error("Unable to load chat:", error);
      } finally {
        setLoading(false);
      }
    }

    loadChat();
  }, [params, isAuthenticated]);

  const otherParticipant = chat?.participants?.find(
    (participant) => participant._id !== user?._id
  );

  return (
    <>
      <Navbar />

      <main className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8">
        {!isAuthenticated ? (
          <div className="rounded-3xl border border-[#EAE6DF] bg-white p-10 sm:p-12 text-center shadow-xs space-y-4 my-8">
            <h1 className="font-sans text-2xl font-bold text-[#1E2022]">
              Authentication Required
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Please sign in to access this conversation.
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
            {/* Back Bar & Status Pill */}
            <div className="flex items-center justify-between">
              <Link
                href="/chats"
                onClick={() => {
                  if (chatId) {
                    sessionStorage.setItem(`chat-read-${chatId}`, "true");
                  }
                }}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 transition hover:text-[#C8522E]"
              >
                <ArrowLeft size={16} />
                <span>Back to Messages</span>
              </Link>

              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D0E5D5] bg-[#EAF4ED] px-3.5 py-1 text-[11px] font-bold text-[#2E6F40]">
                <ShieldCheck size={13} />
                <span>Secure Transit Channel</span>
              </div>
            </div>

            <div className="mt-6">
              {loading ? (
                <div className="rounded-3xl border border-[#EAE6DF] bg-white p-12 text-center shadow-xs">
                  <p className="text-sm font-semibold text-slate-500">
                    Loading conversation...
                  </p>
                </div>
              ) : !chat || !otherParticipant ? (
                <div className="rounded-3xl border border-[#EAE6DF] bg-white p-12 text-center shadow-xs">
                  <h1 className="font-sans text-lg font-bold text-[#1E2022]">
                    Conversation not found
                  </h1>
                  <p className="mt-1 text-xs text-slate-500">
                    This conversation may no longer be available.
                  </p>
                </div>
              ) : (
                <RideChat
                  chatId={chatId}
                  receiverId={otherParticipant._id}
                  receiverName={otherParticipant.name ?? "SahaYatri User"}
                />
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}