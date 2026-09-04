import { apiFetch } from "./client";

export interface Notification {
  _id: string;
  type?: string;
  title?: string;
  message?: string;
  read: boolean;
  createdAt?: string;
  data?: Record<string, unknown>;
}

interface NotificationsResponse {
  success: boolean;
  message: string;
  data: {
    notifications: Notification[];
    unreadCount?: number;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: {
    unreadCount?: number;
    count?: number;
  };
}

export function getNotifications(
  page = 1,
  limit = 20
) {
  return apiFetch<NotificationsResponse>(
    `/notifications?page=${page}&limit=${limit}`
  );
}

export function getUnreadNotificationCount() {
  return apiFetch<UnreadCountResponse>(
    "/notifications/unread-count"
  );
}

export function markNotificationRead(
  notificationId: string
) {
  return apiFetch(
    `/notifications/${notificationId}/read`,
    {
      method: "PATCH",
    }
  );
}

export function markAllNotificationsRead() {
  return apiFetch(
    "/notifications/read-all",
    {
      method: "PATCH",
    }
  );
}