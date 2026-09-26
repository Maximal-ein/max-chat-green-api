// Date-grouping helpers for the message list.
// Extracted from message-list.tsx to keep that file under 200 lines.

import type { MessageRow } from "@/lib/types";

/** Format a unix-seconds timestamp as a date-separator label. */
export function formatDateLabel(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const that = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today.getTime() - that.getTime()) / 86400000);
  if (diffDays === 0) return "Сегодня";
  if (diffDays === 1) return "Вчера";
  if (diffDays < 7) {
    return d.toLocaleDateString("ru-RU", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: d.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

export interface DateGroup {
  dateKey: string;
  label: string;
  items: MessageRow[];
}

/** Group messages by calendar day, preserving order. */
export function groupMessagesByDay(messages: MessageRow[]): DateGroup[] {
  const groups: DateGroup[] = [];
  for (const m of messages) {
    const d = new Date(m.timestamp * 1000);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const last = groups[groups.length - 1];
    if (last && last.dateKey === key) {
      last.items.push(m);
    } else {
      groups.push({
        dateKey: key,
        label: formatDateLabel(m.timestamp),
        items: [m],
      });
    }
  }
  return groups;
}
