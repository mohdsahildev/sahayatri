import { io, Socket } from "socket.io-client";
import type { Notification } from "@/lib/api/notifications";
import { useNotificationStore } from "@/lib/stores/notification.store";

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io({
      path: "/api/socket.io",
      transports: ["polling"],
      autoConnect: false,
    });

    socket.on("connect", () => {
      console.log(
        "[Socket.IO] CONNECTED:",
        socket?.id
      );
    });

    socket.on("disconnect", (reason) => {
      console.log(
        "[Socket.IO] DISCONNECTED:",
        reason
      );
    });

    socket.on("connect_error", (error) => {
      console.error(
        "[Socket.IO] ERROR:",
        error.message
      );
    });

    socket.on("notification:new", (payload) => {
      console.log(
        "[Socket.IO] notification:new received:",
        payload
      );

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
      console.log(
        "[Socket.IO] unread:count received:",
        payload
      );

      const count = Number(
        payload?.unreadCount
      );

      if (Number.isFinite(count)) {
        useNotificationStore
          .getState()
          .setUnreadCount(count);
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