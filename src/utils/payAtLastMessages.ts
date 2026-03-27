/**
 * WhatsApp message generators for the Pay at Last feature.
 * Zero emojis. Clean plain text. All prices in Rs. format.
 *
 * All timestamps come from Convex server (Date.now() in mutation)
 * or from the session's per-order timestamp field (also server-set).
 * Never from the customer device clock.
 */

import type { DineSession, PayAtLastItemRecord } from "@/hooks/usePayAtLast";
import type { CartItem } from "@/context/CartContext";
import { cartItemsToRecords } from "@/hooks/usePayAtLast";
import { formatOrderDateTime, formatOrderTime } from "@/utils/formatDateTime";

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
// Sent every time Pay at Last order is placed.
// serverTimestamp comes from Convex mutation return value.

export function generateKitchenMessage(params: {
  session: DineSession;
  currentOrderNumber: number;
  cartItems: CartItem[];
  orderTotal: number;
  specialInstructions: string;
  restaurantName: string;
  serverTimestamp: number; // From Convex server — never device clock
}): string {
  const {
    session,
    currentOrderNumber,
    cartItems,
    orderTotal,
    specialInstructions,
    restaurantName,
    serverTimestamp,
  } = params;

  const lines: string[] = [];

  // Header
  lines.push(SEP);
  lines.push(restaurantName.toUpperCase());
  lines.push(`ORDER : ${session.orderId}`);
  lines.push(formatOrderDateTime(serverTimestamp)); // IST server time, no label
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

// ─── Format 2 & 3: Final consolidated bill (Cash or UPI) ─────────────────────
// Shows each order as a separate section with its time label (ORDER 1 | 9:00 AM)
// and one grand total at the bottom.
// serverTimestamp = time the Final Bill was triggered (from Convex or session).

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
  serverTimestamp: number; // From Convex server — final bill time
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
    serverTimestamp,
  } = params;

  const lines: string[] = [];

  // Build current order object (not yet in session)
  const currentOrderNumber = session.totalOrdersCount + 1;
  const currentItems: PayAtLastItemRecord[] = cartItemsToRecords(currentCartItems);

  // All orders: past (in session) + current cart
  const allOrders = [
    ...session.orders,
    {
      orderNumber: currentOrderNumber,
      timestamp: serverTimestamp, // server time for current order
      items: currentItems,
      orderTotal: currentOrderTotal,
      orderSubtotal: currentOrderSubtotal,
      orderSavings: currentOrderSavings,
      specialInstructions: currentSpecialInstructions,
    },
  ];

  // Grand totals
  const totalSubtotal = session.runningSubtotal + currentOrderSubtotal;
  const totalSavings = session.runningSavings + currentOrderSavings;
  const totalDue = session.runningTotal + currentOrderTotal;

  // ── Header ────────────────────────────────────────────────────────────────
  lines.push(SEP);
  lines.push(restaurantName.toUpperCase());
  lines.push(`ORDER : ${session.orderId}`);
  lines.push(formatOrderDateTime(serverTimestamp)); // Payment time — IST, no label
  lines.push(SEP);
  lines.push(`DINE-IN  |  TABLE ${session.tableNumber}`);
  lines.push(`Customer : ${session.customerName}`);
  lines.push(`Payment  : ${paymentMethod === "cash" ? "Cash" : "UPI"}`);

  // ── Merge all items ───────────────────────────────────────────────────────
  const mergedItemsMap = new Map<string, PayAtLastItemRecord>();
  const allNotes: string[] = [];

  for (const order of allOrders) {
    if (order.specialInstructions?.trim()) {
      allNotes.push(`Order ${order.orderNumber}: ${order.specialInstructions.trim()}`);
    }

    for (const item of order.items) {
      // Group by Name, size, and offer type
      const key = `${item.name}-${item.size}-${item.offerType}`;
      const existing = mergedItemsMap.get(key);

      if (existing) {
        mergedItemsMap.set(key, {
          ...existing,
          quantity: existing.quantity + item.quantity,
          billedQuantity: existing.billedQuantity + item.billedQuantity,
          itemTotal: existing.itemTotal + item.itemTotal,
          savings: existing.savings + item.savings,
        });
      } else {
        mergedItemsMap.set(key, { ...item });
      }
    }
  }

  const mergedItems = Array.from(mergedItemsMap.values());

  lines.push(SEP);
  lines.push("Total order");
  lines.push(SEP);

  mergedItems.forEach((item, idx) => {
    const [nameLine, priceLine] = formatRecordLines(item, idx);
    lines.push(nameLine);
    lines.push(priceLine);
    if (idx < mergedItems.length - 1) lines.push("");
  });

  if (allNotes.length > 0) {
    lines.push(SEP);
    lines.push("NOTES:");
    allNotes.forEach((note) => lines.push(`- ${note}`));
  }

  // ── Grand totals ──────────────────────────────────────────────────────────
  lines.push(SEP);
  lines.push(`Subtotal  : ${rs(totalSubtotal)}`);
  if (totalSavings > 0) {
    lines.push(`Savings   : ${rs(totalSavings)}`);
    lines.push("");
  }
  lines.push(`TOTAL DUE : ${rs(totalDue)}`);
  lines.push(SEP);

  // ── UPI link ──────────────────────────────────────────────────────────────
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
