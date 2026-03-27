/**
 * WhatsApp pre-filled message generators for Home Delivery orders.
 * Zero emojis. Clean plain text. Rs. format. IST server timestamps.
 */

import type { WhatsAppLineItem } from "@/utils/whatsapp";

const SEP = "--------------------";

function rs(n: number): string {
  return `Rs.${Math.round(n)}`;
}

function sizeTag(size: WhatsAppLineItem["size"]): string {
  if (size === "small") return " (S)";
  if (size === "large") return " (L)";
  return "";
}

function formatItem(item: WhatsAppLineItem, idx: number): string[] {
  const name = `${idx + 1}. ${item.name}${sizeTag(item.size)}`;
  const parts: string[] = [`x${item.quantity}`];
  if (item.offerType === "bogo") parts.push("BOGO Free");
  else if (item.offerType === "percentage")
    parts.push(`${Math.round(item.offerPercentage ?? 0)}% Off`);
  parts.push(rs(item.itemTotal));
  return [name, `   ${parts.join("  |  ")}`];
}

export interface DeliveryMessageInput {
  orderId: string;
  dateTime: string;            // IST formatted — from Convex server
  items: WhatsAppLineItem[];
  subtotal: number;
  totalSavings: number;
  itemsTotal: number;          // grand total of items only (pre-delivery)
  deliveryCharge: number;      // 0 = free delivery
  totalDue: number;            // itemsTotal + deliveryCharge - savings
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;     // may be empty if only mapLink provided
  deliveryMapLink: string;     // may be empty if only address provided
  paymentMethod: "cash" | "upi";
  upiId: string;
  estimatedDeliveryTime: string;
  restaurantName: string;
  specialInstructions?: string;
}

export function generateDeliveryMessage(input: DeliveryMessageInput): string {
  const lines: string[] = [];

  // ── Header ────────────────────────────────────────────────────────────────
  lines.push(SEP);
  lines.push(input.restaurantName.toUpperCase());
  lines.push(`ORDER : ${input.orderId}`);
  lines.push(input.dateTime);
  lines.push(SEP);
  lines.push("HOME DELIVERY");
  lines.push(`Customer : ${input.customerName}`);
  lines.push(`Phone    : ${input.customerPhone}`);
  lines.push(`Payment  : ${input.paymentMethod === "cash" ? "Cash on Delivery" : "UPI"}`);

  // ── Delivery address block ────────────────────────────────────────────────
  lines.push(SEP);
  lines.push("DELIVER TO");
  lines.push(SEP);

  if (input.deliveryAddress.trim()) {
    // Wrap long addresses at commas for readability
    const addrLines = input.deliveryAddress
      .trim()
      .split(/,\s*/)
      .map((p, i, arr) => (i === 0 ? `Address  : ${p}` : `           ${p}${i < arr.length - 1 ? "," : ""}`));
    addrLines.forEach((l) => lines.push(l));
  }

  if (input.deliveryMapLink.trim()) {
    lines.push(`Map Link : ${input.deliveryMapLink.trim()}`);
  }

  // ── Items ─────────────────────────────────────────────────────────────────
  lines.push(SEP);
  lines.push("ITEMS");
  lines.push(SEP);

  input.items.forEach((item, idx) => {
    const [nameLine, priceLine] = formatItem(item, idx);
    lines.push(nameLine);
    lines.push(priceLine);
    if (idx < input.items.length - 1) lines.push("");
  });

  // ── Totals ────────────────────────────────────────────────────────────────
  lines.push(SEP);
  lines.push(`Subtotal         : ${rs(input.subtotal)}`);
  if (input.totalSavings > 0) {
    lines.push(`Savings          : ${rs(input.totalSavings)}`);
  }
  if (input.deliveryCharge === 0) {
    lines.push(`Free Delivery    : Rs.0`);
  } else {
    lines.push(`Delivery Charge  : ${rs(input.deliveryCharge)}`);
  }
  lines.push(`TOTAL DUE        : ${rs(input.totalDue)}`);
  lines.push(SEP);

  // ── UPI link ──────────────────────────────────────────────────────────────
  if (input.paymentMethod === "upi") {
    const amount = Math.round(input.totalDue);
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
    lines.push(SEP);
  }

  // ── Special instructions ──────────────────────────────────────────────────
  if (input.specialInstructions?.trim()) {
    lines.push(`NOTE : ${input.specialInstructions.trim()}`);
    lines.push(SEP);
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  lines.push(`Est. Delivery : ${input.estimatedDeliveryTime}`);
  lines.push(SEP);

  return lines.join("\n");
}
