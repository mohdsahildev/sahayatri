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
    set({ notifications }),

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

      return {
        notifications: [
          notification,
          ...state.notifications,
        ],
        unreadCount: notification.read
          ? state.unreadCount
          : state.unreadCount + 1,
      };
    }),

  markAsRead: (notificationId) =>
    set((state) => {
      const notification = state.notifications.find(
        (item) => item._id === notificationId
      );

      if (!notification || notification.read) {
        return state;
      }

      return {
        notifications: state.notifications.map((item) =>
          item._id === notificationId
            ? { ...item, read: true }
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