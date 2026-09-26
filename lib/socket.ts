import { io, Socket } from "socket.io-client";
import type { Notification } from "@/lib/api/notifications";
import { useNotificationStore } from "@/lib/stores/notification.store";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    const SOCKET_URL =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://sahayatri-p95g.onrender.com";

    socket = io(SOCKET_URL, {
      transports: ["polling"],
      autoConnect: false,
    });

    socket.on("connect", () => { });

    socket.on("disconnect", () => { });

    socket.on("connect_error", (error) => {
      console.error(
        "[Socket.IO] ERROR:",
        error.message
      );
    });

    socket.on("notification:new", (payload) => {
      const incoming = payload?.notification;

      if (!incoming?._id) {
        return;
      }

      const notification: Notification = {
        _id: incoming._id,
        type: incoming.type,
        title: incoming.title,
        message:
          incoming.body ?? incoming.message,
        read:
          incoming.isRead ??
          incoming.read ??
          false,
        createdAt: incoming.createdAt,
        data:
          incoming.metadata ??
          incoming.data,
      };

      useNotificationStore
        .getState()
        .addNotification(notification);
    });

    socket.on("unread:count", (payload) => {
      const count = Number(
        payload?.unreadCount
      );

      if (Number.isFinite(count)) {
        useNotificationStore
          .getState()
          .setUnreadCount(count);
      }
    });

    socket.on("notification:read", (payload) => {
      if (payload?.all) {
        useNotificationStore.getState().markAllAsRead();
      } else if (payload?.notificationId) {
        useNotificationStore.getState().markAsRead(payload.notificationId);
      }
    });
  }

  return socket;
}

export function connectSocket(
  accessToken: string
) {
  const currentSocket = getSocket();

  currentSocket.auth = {
    token: accessToken,
  };

  if (!currentSocket.connected) {
    currentSocket.connect();
  }

  return currentSocket;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}