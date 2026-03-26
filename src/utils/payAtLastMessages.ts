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
// Sent when Final Bill is clicked. ALL items from every order round are
// merged into one single list — same dish ordered multiple times is summed.

/** Merge key: name + size */
function mergeKey(name: string, size: string): string {
  return `${name}||${size}`;
}

interface MergedItem {
  name: string;
  size: "small" | "large" | "single";
  quantity: number;
  offerType: string;
  offerPercentage?: number;
  itemTotal: number;
}

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

  // ── Step 1: Build merged item map ──────────────────────────────────────────
  // Walk every past order record + current cart → merge by name+size.
  const mergedMap = new Map<string, MergedItem>();

  const addRecord = (item: PayAtLastItemRecord) => {
    const key = mergeKey(item.name, item.size);
    const existing = mergedMap.get(key);
    if (existing) {
      existing.quantity += item.quantity;
      existing.itemTotal += item.itemTotal;
    } else {
      mergedMap.set(key, {
        name: item.name,
        size: item.size,
        quantity: item.quantity,
        offerType: item.offerType,
        offerPercentage: item.offerPercentage,
        itemTotal: item.itemTotal,
      });
    }
  };

  // Past orders saved in session
  for (const order of session.orders) {
    for (const item of order.items) {
      addRecord(item);
    }
  }

  // Current cart (not yet saved to session when Final Bill is clicked
  // for the case where the cart still has items)
  const currentRecords = cartItemsToRecords(currentCartItems);
  for (const item of currentRecords) {
    addRecord(item);
  }

  // ── Step 2: Collect all special notes ─────────────────────────────────────
  const allNotes = [
    ...session.orders.map((o) => o.specialInstructions?.trim() ?? ""),
    currentSpecialInstructions.trim(),
  ].filter(Boolean);

  // ── Step 3: Grand totals ───────────────────────────────────────────────────
  const totalSubtotal = session.runningSubtotal + currentOrderSubtotal;
  const totalSavings = session.runningSavings + currentOrderSavings;
  const totalDue = session.runningTotal + currentOrderTotal;

  // ── Step 4: Build message ─────────────────────────────────────────────────

  // Header
  lines.push(SEP);
  lines.push(restaurantName.toUpperCase());
  lines.push(`ORDER : ${session.orderId}`);
  lines.push(SEP);
  lines.push(`DINE-IN  |  TABLE ${session.tableNumber}`);
  lines.push(`Customer : ${session.customerName}`);
  lines.push(`Payment  : ${paymentMethod === "cash" ? "Cash" : "UPI"}`);

  // Single merged item list
  lines.push(SEP);
  lines.push(`ALL ORDERS`);
  lines.push(SEP);

  const mergedItems = Array.from(mergedMap.values());
  mergedItems.forEach((item, idx) => {
    const nameLine = `${idx + 1}. ${item.name}${sizeTag(item.size)}`;
    const parts: string[] = [`x${item.quantity}`];
    if (item.offerType === "bogo") {
      parts.push("BOGO Free");
    } else if (item.offerType === "percentage") {
      parts.push(`${Math.round(item.offerPercentage ?? 0)}% Off`);
    }
    parts.push(rs(item.itemTotal));
    lines.push(nameLine);
    lines.push(`   ${parts.join("  |  ")}`);
    if (idx < mergedItems.length - 1) lines.push("");
  });

  // Combined notes (if any)
  if (allNotes.length > 0) {
    lines.push(SEP);
    lines.push(`NOTES : ${allNotes.join(" | ")}`);
  }

  // Grand totals
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
