import type { OfferType } from "@/data/menuData";

export interface WhatsAppLineItem {
  itemId: string;
  name: string;
  quantity: number;
  billedQuantity: number;
  size: "small" | "large" | "single";
  finalPrice: number;
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

const DIVIDER = "--------------------------------------------";

function toRs(value: number): string {
  return `Rs.${Math.round(value)}`;
}

function formatItemName(item: WhatsAppLineItem): string {
  const sizeLabel =
    item.size === "small" ? "Small" : item.size === "large" ? "Large" : "";

  if (item.offerType === "new_tag") {
    if (sizeLabel) {
      return `${item.name} (${sizeLabel}, New)`;
    }

    return `${item.name} (New)`;
  }

  if (sizeLabel) {
    return `${item.name} (${sizeLabel})`;
  }

  return item.name;
}

function formatOfferLine(item: WhatsAppLineItem): string | null {
  if (item.offerType === "bogo") {
    return "Offer      : BOGO Free";
  }

  if (item.offerType === "percentage") {
    const percentage = Math.round(item.offerPercentage ?? 0);
    return `Offer      : ${percentage}% Off`;
  }

  return null;
}

function formatQtyLine(item: WhatsAppLineItem): string {
  if (item.offerType === "bogo") {
    return `Qty        : ${item.quantity} (Billed: ${item.billedQuantity})`;
  }

  return `Qty        : ${item.quantity}`;
}

export function buildWhatsAppMessage(input: BuildWhatsAppMessageInput): string {
  const lines: string[] = [
    DIVIDER,
    `${input.restaurantName.toUpperCase()} - ORDER DETAILS`,
    DIVIDER,
    `Order Type : ${input.orderType === "dine-in" ? "🪑 Dine-In" : "📦 Takeaway"}`,
    `Name       : ${input.customerName}`,
  ];

  if (input.orderType === "dine-in") {
    lines.push(`Table No   : ${input.tableNumber ?? "-"}${input.scannedTableNumber ? " (QR Verified)" : ""}`);
  }

  lines.push(DIVIDER);
  lines.push("ORDER SUMMARY");
  lines.push(DIVIDER);

  input.items.forEach((item, index) => {
    lines.push(formatItemName(item));

    const offerLine = formatOfferLine(item);
    if (offerLine) {
      lines.push(offerLine);
    }

    lines.push(formatQtyLine(item));
    lines.push(`Price      : ${toRs(item.itemTotal)}`);

    if (item.savings > 0) {
      lines.push(`Savings    : ${toRs(item.savings)}`);
    }

    if (index !== input.items.length - 1) {
      lines.push("");
    }
  });

  lines.push(DIVIDER);
  lines.push("PRICE BREAKDOWN");
  lines.push(DIVIDER);
  lines.push(`Subtotal   : ${toRs(input.subtotal)}`);
  if (input.totalSavings > 0) {
    lines.push(`Savings    : ${toRs(input.totalSavings)}`);
  }
  lines.push(DIVIDER);
  lines.push(`Total      : ${toRs(input.totalAmount)}`);
  lines.push(DIVIDER);
  lines.push(`Payment    : ${input.paymentMethod === "cash" ? "Cash" : "Paytm UPI"}`);
  lines.push(DIVIDER);

  const amount = Math.round(input.totalAmount);
  lines.push(`Pay here   : upi://pay?pa=${encodeURIComponent(input.upiId)}`);
  lines.push(`             &pn=${encodeURIComponent(input.restaurantName)}`);
  lines.push(`             &am=${amount}`);
  lines.push("             &cu=INR");

  lines.push(DIVIDER);
  if (input.specialInstructions && input.specialInstructions.trim().length > 0) {
    lines.push(`Instructions: ${input.specialInstructions.trim()}`);
    lines.push(DIVIDER);
  }
  lines.push("Please confirm the order. Thank you.");
  lines.push(DIVIDER);

  return lines.join("\n");
}

export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const digits = phoneNumber.replace(/\D/g, "");
  const withCountryCode = digits.startsWith("91") && digits.length > 10
    ? digits
    : `91${digits}`;

  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}
