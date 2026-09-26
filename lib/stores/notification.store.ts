import { create } from "zustand";
import type { Notification } from "@/lib/api/notifications";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;

  setNotifications: (notifications: Notification[]) => void;
  setUnreadCount: (count: number) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) =>
    set({
      notifications: notifications.map((n) => {
        const isRead = n.isRead !== undefined ? Boolean(n.isRead) : Boolean(n.read);
        return {
          ...n,
          read: isRead,
          isRead: isRead,
        };
      }),
    }),

  setUnreadCount: (unreadCount) =>
    set({ unreadCount }),

  addNotification: (notification) =>
    set((state) => {
      // Prevent duplicates if the same notification arrives again.
      if (
        state.notifications.some(
          (item) => item._id === notification._id
        )
      ) {
        return state;
      }

      const isRead =
        notification.isRead !== undefined
          ? Boolean(notification.isRead)
          : Boolean(notification.read);

      const normalized: Notification = {
        ...notification,
        read: isRead,
        isRead: isRead,
      };

      return {
        notifications: [
          normalized,
          ...state.notifications,
        ],
        unreadCount: normalized.read
          ? state.unreadCount
          : state.unreadCount + 1,
      };
    }),

  markAsRead: (notificationId) =>
    set((state) => {
      const notification = state.notifications.find(
        (item) => item._id === notificationId
      );

      const isAlreadyRead = notification
        ? (notification.isRead !== undefined ? Boolean(notification.isRead) : Boolean(notification.read))
        : false;

      if (!notification || isAlreadyRead) {
        return state;
      }

      return {
        notifications: state.notifications.map((item) =>
          item._id === notificationId
            ? { ...item, read: true, isRead: true }
            : item
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map(
        (notification) => ({
          ...notification,
          read: true,
          isRead: true,
        })
      ),
      unreadCount: 0,
    })),

  clearNotifications: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),
}));