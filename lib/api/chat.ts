import { apiFetch } from "@/lib/api/client";

export interface ChatUser {
  _id: string;
  name?: string;
  profilePic?: string;
}

export interface Chat {
  _id: string;
  ride?: string | { _id?: string };
  participants?: ChatUser[];
  lastMessage?: Message | null;
  updatedAt?: string;
  unreadCount?: number;
}

export interface Message {
  _id: string;
  chat?: string | { _id?: string };
  sender?: string | ChatUser;
  receiver?: string | ChatUser;
  text?: string;
  type?: string;
  createdAt?: string;
  isDeleted?: boolean;
}

export async function getChats() {
  return apiFetch<{
    success: boolean;
    data: {
      chats: Chat[];
      count: number;
    };
  }>("/chats");
}

export async function getRideChat(
  rideId: string,
  userId: string
) {
  return apiFetch<{
    success: boolean;
    data: {
      chat: Chat;
    };
  }>(`/chats/ride/${rideId}/user/${userId}`, {
    method: "POST",
  });
}

export async function getMessages(chatId: string) {
  return apiFetch<{
    success: boolean;
    data: {
      messages: Message[];
      total: number;
      page: number;
      limit: number;
    };
  }>(`/chats/${chatId}/messages`);
}

export async function sendMessage(
  chatId: string,
  text: string
) {
  return apiFetch<{
    success: boolean;
    data: {
      message: Message;
    };
  }>("/messages", {
    method: "POST",
    body: JSON.stringify({
      chatId,
      text,
    }),
  });
}

export async function markMessageSeen(
  messageId: string
) {
  return apiFetch<{
    success: boolean;
  }>(`/messages/${messageId}/seen`, {
    method: "PATCH",
  });
}