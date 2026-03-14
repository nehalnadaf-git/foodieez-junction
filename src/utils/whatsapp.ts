import type { ItemOffer } from "@/data/menuData";
import { formatOfferForWhatsApp } from "@/utils/offer";

export interface WhatsAppLineItem {
  name: string;
  quantity: number;
  originalAmount: number;
  offer?: ItemOffer;
}

export interface BuildWhatsAppMessageInput {
  orderId: string;
  items: WhatsAppLineItem[];
  totalAmount: number;
  customerName: string;
  orderType: "dine-in" | "takeaway";
  tableNumber: string | null;
  scannedTableNumber: string | null;
  paymentMethod: "cash" | "upi";
  estimatedTime: string;
  upiId: string;
  /** Restaurant name pulled from settings — used in the message greeting and UPI note. */
  restaurantName: string;
  specialInstructions?: string;
}

/**
 * Produces the exact WhatsApp body format used for customer orders.
 */
export function buildWhatsAppMessage(input: BuildWhatsAppMessageInput): string {
  const itemLines = input.items
    .map((item) =>
      formatOfferForWhatsApp(item.name, item.quantity, item.originalAmount, item.offer)
    )
    .join("\n");

  const orderTypeLine =
    input.orderType === "dine-in"
      ? `🍽️ Dine-In — Table ${input.tableNumber ?? "-"}`
      : input.scannedTableNumber
        ? `🛵 Takeaway (Scanned at Table ${input.scannedTableNumber})`
        : "🛵 Takeaway";

  const paymentLine = `💳 Payment: ${input.paymentMethod === "cash" ? "Cash" : "UPI"}`;

  const upiLink = `upi://pay?pa=${encodeURIComponent(input.upiId)}&pn=${encodeURIComponent(input.restaurantName)}&am=${input.totalAmount}&cu=INR&tn=${encodeURIComponent(`Order ${input.orderId}`)}`;

  const specialInstructionsLine =
    input.specialInstructions && input.specialInstructions.trim().length > 0
      ? `\n📝 Special Instructions: ${input.specialInstructions.trim()}`
      : "";

  const lines = [
    `Hi! I'd like to place an order at ${input.restaurantName} 🍽️`,
    `Order ID: ${input.orderId}`,
    "",
    "*Order Details:*",
    itemLines,
    "",
    `*Total: ₹${input.totalAmount}*`,
    "",
    orderTypeLine,
    `👤 Name: ${input.customerName}`,
    paymentLine,
  ];

  if (input.paymentMethod === "upi") {
    lines.push("");
    lines.push(`💰 Pay here: ${upiLink}`);
  }

  if (specialInstructionsLine.length > 0) {
    lines.push(specialInstructionsLine);
  }

  lines.push("");
  lines.push(`⏱️ Estimated Time: ${input.estimatedTime}`);
  lines.push("Thank you!");

  return lines.join("\n");
}

/**
 * Builds a wa.me URL with a safely encoded message payload.
 * Handles numbers with or without a leading +91 India country code.
 */
export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  // Strip everything except digits
  const digits = phoneNumber.replace(/\D/g, "");

  // Prepend India country code if not already present
  const withCountryCode = digits.startsWith("91") && digits.length > 10
    ? digits
    : `91${digits}`;

  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}
