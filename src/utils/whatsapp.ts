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

  const upiLink = `upi://pay?pa=${encodeURIComponent(input.upiId)}&pn=${encodeURIComponent("Foodieez Junction")}&am=${input.totalAmount}&cu=INR&tn=${encodeURIComponent(`Order ${input.orderId}`)}`;

  const specialInstructionsLine =
    input.specialInstructions && input.specialInstructions.trim().length > 0
      ? `\n📝 Special Instructions: ${input.specialInstructions.trim()}`
      : "";

  return [
    "Hi! I'd like to place an order at Foodieez Junction 🍽️",
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
    input.paymentMethod === "upi" ? "" : null,
    input.paymentMethod === "upi" ? `💰 Pay here: ${upiLink}` : null,
    specialInstructionsLine.length > 0 ? specialInstructionsLine : null,
    "",
    `⏱️ Estimated Time: ${input.estimatedTime}`,
    "Thank you!",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

/**
 * Builds a wa.me URL with a safely encoded message payload.
 */
export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const digits = phoneNumber.replace(/\D/g, "");
  const withCountryCode = digits.startsWith("91") ? digits : `91${digits}`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${withCountryCode}?text=${encodedMessage}`;
}
