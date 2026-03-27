/**
 * formatDateTime.ts
 * IST timestamp formatter for WhatsApp order messages.
 *
 * Always converts to Indian Standard Time (UTC+5:30),
 * regardless of where the server or customer device is located.
 *
 * Output format: DD/MM/YY, H:MM AM/PM
 * Examples: 27/03/26, 9:00 AM | 01/04/26, 12:30 PM
 */

/**
 * Formats a Unix millisecond timestamp into IST local time.
 *
 * @param timestamp - Unix ms (from Convex Date.now() — server time)
 * @returns Formatted string e.g. "27/03/26, 9:00 AM"
 */
export function formatOrderDateTime(timestamp: number): string {
  const date = new Date(timestamp);

  // Shift to IST: UTC + 5h 30m
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(date.getTime() + IST_OFFSET_MS);

  const day = String(istDate.getUTCDate()).padStart(2, "0");
  const month = String(istDate.getUTCMonth() + 1).padStart(2, "0");
  const year = String(istDate.getUTCFullYear()).slice(-2);

  let hours = istDate.getUTCHours();
  const minutes = String(istDate.getUTCMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // 0 → 12

  return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`;
}

/**
 * Formats only the time portion (H:MM AM/PM) for per-order labels
 * in Pay at Last final bill headers.
 *
 * @param timestamp - Unix ms (from session order.timestamp — server time)
 * @returns e.g. "9:15 AM"
 */
export function formatOrderTime(timestamp: number): string {
  const date = new Date(timestamp);
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(date.getTime() + IST_OFFSET_MS);

  let hours = istDate.getUTCHours();
  const minutes = String(istDate.getUTCMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${ampm}`;
}
