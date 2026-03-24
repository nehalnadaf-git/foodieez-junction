import type { OfferType } from "@/data/menuData";

export interface WhatsAppLineItem {
  itemId: string;
  name: string;
  quantity: number;
  billedQuantity: number;
  size: "small" | "large" | "single";
  finalPrice: number;
  originalPrice: number;
  itemTotal: number;
  savings: number;
  offerType: OfferType;
  offerPercentage?: number;
}

export interface BuildWhatsAppMessageInput {
  orderId: string;
  items: WhatsAppLineItem[];
  subtotal: number;
  totalSavings: number;
  totalAmount: number;
  customerName: string;
  orderType: "dine-in" | "takeaway";
  tableNumber: string | null;
  scannedTableNumber: string | null;
  paymentMethod: "cash" | "upi";
  estimatedTime: string;
  upiId: string;
  restaurantName: string;
  specialInstructions?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const D = "--------------------";
const d = "--------------------";

function rs(n: number): string {
  return `Rs.${Math.round(n)}`;
}

function sizeTag(size: WhatsAppLineItem["size"]): string {
  if (size === "small") return " (S)";
  if (size === "large") return " (L)";
  return "";
}

/**
 * Two-line item format — clean and readable on mobile.
 *
 *   1. Chicken Momos (Small)
 *      x2  |  BOGO Free  |  Rs.90
 *
 *   2. Veg Spring Roll
 *      x1  |  20% Off  |  Rs.64
 *
 *   3. Nachos
 *      x3  |  Rs.360
 */
function formatItem(item: WhatsAppLineItem, idx: number): string[] {
  const name = `${idx + 1}. ${item.name}${sizeTag(item.size)}`;

  const parts: string[] = [`x${item.quantity}`];

  if (item.offerType === "bogo") {
    parts.push("BOGO Free");
  } else if (item.offerType === "percentage") {
    parts.push(`${Math.round(item.offerPercentage ?? 0)}% Off`);
  }

  parts.push(rs(item.itemTotal));

  return [name, `   ${parts.join("  |  ")}`];
}

// ─── Main builder ─────────────────────────────────────────────────────────────

export function buildWhatsAppMessage(input: BuildWhatsAppMessageInput): string {
  const lines: string[] = [];

  // ── Order header (most important — owner reads this first) ───────────────
  lines.push(D);
  lines.push(input.restaurantName.toUpperCase());
  lines.push(`ORDER : ${input.orderId}`);
  lines.push(D);

  // Type + customer on the same block, keep it easy to read at a glance
  if (input.orderType === "dine-in") {
    const tableStr = input.tableNumber ?? "-";
    const qrTag = input.scannedTableNumber ? " (QR)" : "";
    lines.push(`DINE-IN  |  TABLE ${tableStr}${qrTag}`);
  } else {
    lines.push("TAKEAWAY");
  }
  lines.push(`Customer : ${input.customerName}`);
  lines.push(`Payment  : ${input.paymentMethod === "cash" ? "Cash" : "UPI"}`);

  // ── Items — the most critical section for the owner ──────────────────────
  lines.push(d);
  lines.push("ITEMS");
  lines.push(d);

  input.items.forEach((item, idx) => {
    const itemLines = formatItem(item, idx);
    itemLines.forEach((l) => lines.push(l));
    if (idx < input.items.length - 1) lines.push("");
  });

  // ── Totals ────────────────────────────────────────────────────────────────
  lines.push(d);
  lines.push(`Subtotal  : ${rs(input.subtotal)}`);
  if (input.totalSavings > 0) {
    lines.push(`Savings   : ${rs(input.totalSavings)}`);
  }
  lines.push("");
  lines.push(`TOTAL DUE : ${rs(input.totalAmount)}`);
  lines.push(d);

  // ── UPI link (only for UPI orders, no surrounding instructions) ──────────
  if (input.paymentMethod === "upi") {
    const amount = Math.round(input.totalAmount);
    // Single unbroken line — the only way for WhatsApp to render it tappable
    const upiLink = [
      "upi://pay",
      `?pa=${encodeURIComponent(input.upiId)}`,
      `&pn=${encodeURIComponent(input.restaurantName)}`,
      `&am=${amount}`,
      `&cu=INR`,
      `&tn=${encodeURIComponent(input.orderId)}`,
    ].join("");

    lines.push("PAYTM / UPI PAYMENT");
    lines.push(upiLink);
    lines.push(d);
  }

  // ── Special instructions ─────────────────────────────────────────────────
  if (input.specialInstructions?.trim()) {
    lines.push(`NOTE : ${input.specialInstructions.trim()}`);
    lines.push(d);
  }

  // ── Footer ───────────────────────────────────────────────────────────────
  if (input.estimatedTime) {
    lines.push(`Est. Ready : ${input.estimatedTime}`);
  }
  lines.push(D);

  return lines.join("\n");
}

// ─── URL builder ─────────────────────────────────────────────────────────────

export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const digits = phoneNumber.replace(/\D/g, "");
  const withCountryCode =
    digits.startsWith("91") && digits.length > 10
      ? digits
      : `91${digits}`;

  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}
