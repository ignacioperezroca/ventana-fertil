import { addDays, formatDateInput, formatMonthLabel, parseDate, startOfMonth } from "@/lib/cycle";

export interface CalendarCell {
  date: Date;
  iso: string;
  inCurrentMonth: boolean;
}

export const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function buildMonthGrid(anchorMonth: string | Date) {
  const monthDate = typeof anchorMonth === "string" ? parseDate(anchorMonth) ?? new Date() : anchorMonth;
  const monthStart = startOfMonth(monthDate);
  const mondayIndex = (monthStart.getDay() + 6) % 7;
  const gridStart = addDays(monthStart, -mondayIndex);

  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(gridStart, index);
    return {
      date,
      iso: formatDateInput(date),
      inCurrentMonth: date.getMonth() === monthStart.getMonth(),
    } satisfies CalendarCell;
  });
}

export function isSameDay(left: string | Date, right: string | Date) {
  const leftDate = typeof left === "string" ? parseDate(left) : left;
  const rightDate = typeof right === "string" ? parseDate(right) : right;
  if (!leftDate || !rightDate) return false;
  return leftDate.getFullYear() === rightDate.getFullYear() && leftDate.getMonth() === rightDate.getMonth() && leftDate.getDate() === rightDate.getDate();
}

export function isSameMonth(left: string | Date, right: string | Date) {
  const leftDate = typeof left === "string" ? parseDate(left) : left;
  const rightDate = typeof right === "string" ? parseDate(right) : right;
  if (!leftDate || !rightDate) return false;
  return leftDate.getFullYear() === rightDate.getFullYear() && leftDate.getMonth() === rightDate.getMonth();
}

export function shiftMonth(anchorMonth: string | Date, delta: number) {
  const base = typeof anchorMonth === "string" ? parseDate(anchorMonth) ?? new Date() : anchorMonth;
  return new Date(base.getFullYear(), base.getMonth() + delta, 1);
}

export { formatMonthLabel };
