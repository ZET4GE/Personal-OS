// ─────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────

export const NOTIFICATION_TYPES = ['deadline', 'payment', 'habit_streak', 'system'] as const
export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export const NOTIFICATION_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const
export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number]

// ─────────────────────────────────────────────────────────────
// Core entity
// ─────────────────────────────────────────────────────────────

export interface Notification {
  id:           string
  user_id:      string
  type:         NotificationType
  title:        string
  message:      string | null
  link:         string | null
  related_id:   string | null
  related_type: string | null
  priority:     NotificationPriority
  is_read:      boolean
  read_at:      string | null   // ISO 8601
  created_at:   string
}

// ─────────────────────────────────────────────────────────────
// Priority visuals
// ─────────────────────────────────────────────────────────────

export const PRIORITY_BORDER: Record<NotificationPriority, string> = {
  low:    '',
  normal: '',
  high:   'border-l-2 border-orange-400',
  urgent: 'border-l-2 border-red-500',
}

export const PRIORITY_DOT: Record<NotificationPriority, string> = {
  low:    'bg-slate-400',
  normal: 'bg-accent-500',
  high:   'bg-orange-400',
  urgent: 'bg-red-500',
}

// ─────────────────────────────────────────────────────────────
// Create input
// ─────────────────────────────────────────────────────────────

export interface CreateNotificationInput {
  type:         NotificationType
  title:        string
  message?:     string | null
  link?:        string | null
  related_id?:  string | null
  related_type?: string | null
  priority?:    NotificationPriority
}
