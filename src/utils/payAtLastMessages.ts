/**
 * WhatsApp message generators for the Pay at Last feature.
 * Zero emojis. Clean plain text. All prices in Rs. format.
 */

import type { DineSession, PayAtLastItemRecord } from "@/hooks/usePayAtLast";
import type { CartItem } from "@/context/CartContext";
import { cartItemsToRecords } from "@/hooks/usePayAtLast";

const SEP = "--------------------";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rs(n: number): string {
  return `Rs.${Math.round(n)}`;
}

function sizeTag(size: "small" | "large" | "single"): string {
  if (size === "small") return " (S)";
  if (size === "large") return " (L)";
  return "";
}

/** Two-line format: name line + qty | offer | price line */
function formatRecordLines(item: PayAtLastItemRecord, idx: number): string[] {
  const nameLine = `${idx + 1}. ${item.name}${sizeTag(item.size)}`;
  const parts: string[] = [`x${item.quantity}`];

  if (item.offerType === "bogo") {
    parts.push("BOGO Free");
  } else if (item.offerType === "percentage") {
    parts.push(`${Math.round(item.offerPercentage ?? 0)}% Off`);
  }

  parts.push(rs(item.itemTotal));
  return [nameLine, `   ${parts.join("  |  ")}`];
}

function formatCartItemLines(item: CartItem, idx: number): string[] {
  const nameLine = `${idx + 1}. ${item.name}${sizeTag(item.size)}`;
  const parts: string[] = [`x${item.quantity}`];

  if (item.offerType === "bogo") {
    parts.push("BOGO Free");
  } else if (item.offerType === "percentage") {
    parts.push(`${Math.round(item.offerPercentage ?? 0)}% Off`);
  }

  parts.push(rs(item.itemTotal));
  return [nameLine, `   ${parts.join("  |  ")}`];
}

// ─── Format 1: Kitchen message per Pay at Last order ─────────────────────────
// Sent every time Pay at Last is ticked and Pay Now is clicked.

export function generateKitchenMessage(params: {
  session: DineSession;
  currentOrderNumber: number;
  cartItems: CartItem[];
  orderTotal: number;
  specialInstructions: string;
  restaurantName: string;
}): string {
  const { session, currentOrderNumber, cartItems, orderTotal, specialInstructions, restaurantName } = params;
  const lines: string[] = [];

  lines.push(SEP);
  lines.push(restaurantName.toUpperCase());
  lines.push(`ORDER : ${session.orderId}`);
  lines.push(SEP);
  lines.push(`DINE-IN  |  TABLE ${session.tableNumber}`);
  lines.push(`Customer : ${session.customerName}`);
  lines.push(`Status   : PAY AT LAST`);
  lines.push(SEP);
  lines.push(`ORDER ${currentOrderNumber}`);
  lines.push(SEP);

  cartItems.forEach((item, idx) => {
    const [nameLine, priceLine] = formatCartItemLines(item, idx);
    lines.push(nameLine);
    lines.push(priceLine);
    if (idx < cartItems.length - 1) lines.push("");
  });

  lines.push(SEP);
  lines.push(`This Order : ${rs(orderTotal)}`);
  lines.push(SEP);

  if (specialInstructions.trim()) {
    lines.push(`NOTE : ${specialInstructions.trim()}`);
    lines.push(SEP);
  }

  lines.push("Prepare Now");
  lines.push(SEP);

  return lines.join("\n");
}

// ─── Format 2 & 3: Final consolidated bill (Cash or UPI) ────────────────────
// Sent when Pay at Last is unticked and customer selects payment method.

export function generateFinalBill(params: {
  session: DineSession;
  currentCartItems: CartItem[];
  currentOrderTotal: number;
  currentOrderSubtotal: number;
  currentOrderSavings: number;
  currentSpecialInstructions: string;
  paymentMethod: "cash" | "upi";
  upiId: string;
  restaurantName: string;
}): string {
  const {
    session,
    currentCartItems,
    currentOrderTotal,
    currentOrderSubtotal,
    currentOrderSavings,
    currentSpecialInstructions,
    paymentMethod,
    upiId,
    restaurantName,
  } = params;

  const lines: string[] = [];

  // Build the current order record to merge with past orders
  const currentOrderNumber = session.totalOrdersCount + 1;
  const currentItems: PayAtLastItemRecord[] = cartItemsToRecords(currentCartItems);

  // All orders: previous (already in session) + current
  const allOrders = [
    ...session.orders,
    {
      orderNumber: currentOrderNumber,
      timestamp: Date.now(),
      items: currentItems,
      orderTotal: currentOrderTotal,
      orderSubtotal: currentOrderSubtotal,
      orderSavings: currentOrderSavings,
      specialInstructions: currentSpecialInstructions,
    },
  ];

  // Header
  lines.push(SEP);
  lines.push(restaurantName.toUpperCase());
  lines.push(`ORDER : ${session.orderId}`);
  lines.push(SEP);
  lines.push(`DINE-IN  |  TABLE ${session.tableNumber}`);
  lines.push(`Customer : ${session.customerName}`);
  lines.push(`Payment  : ${paymentMethod === "cash" ? "Cash" : "UPI"}`);

  // Per-order sections
  for (const order of allOrders) {
    lines.push(SEP);
    lines.push(`ORDER ${order.orderNumber}`);
    lines.push(SEP);

    order.items.forEach((item, idx) => {
      const [nameLine, priceLine] = formatRecordLines(item, idx);
      lines.push(nameLine);
      lines.push(priceLine);
      if (idx < order.items.length - 1) lines.push("");
    });

    if (order.specialInstructions?.trim()) {
      lines.push(SEP);
      lines.push(`NOTE : ${order.specialInstructions.trim()}`);
    }
  }

  // Grand totals
  const totalSubtotal = session.runningSubtotal + currentOrderSubtotal;
  const totalSavings = session.runningSavings + currentOrderSavings;
  const totalDue = session.runningTotal + currentOrderTotal;

  lines.push(SEP);
  lines.push(`Subtotal  : ${rs(totalSubtotal)}`);
  if (totalSavings > 0) {
    lines.push(`Savings   : ${rs(totalSavings)}`);
  }
  lines.push(`TOTAL DUE : ${rs(totalDue)}`);
  lines.push(SEP);

  // UPI link (only when UPI selected)
  if (paymentMethod === "upi") {
    const amount = Math.round(totalDue);
    const upiLink = [
      "upi://pay",
      `?pa=${encodeURIComponent(upiId)}`,
      `&pn=${encodeURIComponent(restaurantName)}`,
      `&am=${amount}`,
      `&cu=INR`,
      `&tn=${encodeURIComponent(session.orderId)}`,
    ].join("");

    lines.push("PAYTM / UPI PAYMENT");
    lines.push(upiLink);
    lines.push(SEP);
  }

  lines.push("Thank you for dining with us!");
  lines.push(SEP);

  return lines.join("\n");
}

/**
 * Calculates the total grand total for the final bill
 * (all previous orders + current cart total).
 */
export function calcFinalBillTotal(session: DineSession, currentOrderTotal: number): number {
  return Math.round(session.runningTotal + currentOrderTotal);
}
