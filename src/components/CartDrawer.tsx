"use client";

import { useEffect, useState, useCallback } from "react";
import {
  X,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { AnimatePresence, motion } from "framer-motion";
import { useRestaurantStatus } from "@/hooks/useRestaurantStatus";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useTableNumber } from "@/hooks/useTableNumber";
import { usePayAtLast } from "@/hooks/usePayAtLast";
import { useSessionExpiry } from "@/hooks/useSessionExpiry";
import { RunningBillBanner } from "@/components/cart/RunningBillBanner";
import { SessionExpiredOverlay } from "@/components/cart/SessionExpiredOverlay";
import { generateKitchenMessage, generateFinalBill, calcFinalBillTotal } from "@/utils/payAtLastMessages";
import { buildWhatsAppUrl } from "@/utils/whatsapp";
import { toast } from "sonner";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatOrderDateTime } from "@/utils/formatDateTime";


// ─── Type ─────────────────────────────────────────────────────────────────────

type FinalPaymentStep = "idle" | "select_payment" | "sending";

// ─── Component ────────────────────────────────────────────────────────────────

const CartDrawer = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    subtotal,
    totalSavings,
    grandTotal,
    totalItems,
    maxQuantityPerItem,
    clearCart,
  } = useCart();

  const { isOpen: restaurantOpen } = useRestaurantStatus();
  const { settings } = useAppSettings();
  const { tableNumber: scannedTableNumber } = useTableNumber();

  const {
    session,
    isHydrated,
    hasSession,
    hasActiveOrders,
    isSessionExpired,
    initSession,
    addOrderToSession,
    clearSession,
  } = usePayAtLast();

  const expiry = useSessionExpiry(session);

  // ── Is this a QR dine-in customer? ──────────────────────────────────────────
  const isQrCustomer = !!scannedTableNumber;
  const canPlaceOrder = totalItems > 0 && restaurantOpen;

  // ── Local UI state ───────────────────────────────────────────────────────────
  const [payAtLastChecked, setPayAtLastChecked] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [finalPayStep, setFinalPayStep] = useState<FinalPaymentStep>("idle");
  const [isSending, setIsSending] = useState(false);

  // Restore checkbox state from session
  useEffect(() => {
    if (session?.isPayAtLastActive) {
      setPayAtLastChecked(true);
    }
  }, [session]);

  // Body scroll lock — works on iOS Safari too (position:fixed technique)
  useEffect(() => {
    if (isCartOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      const savedTop = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      if (savedTop) {
        window.scrollTo(0, parseInt(savedTop) * -1);
      }
    }
    return () => {
      const savedTop = document.body.style.top;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      if (savedTop) {
        window.scrollTo(0, parseInt(savedTop) * -1);
      }
    };
  }, [isCartOpen]);

  // Reset local state when cart opens
  useEffect(() => {
    if (isCartOpen) {
      setFinalPayStep("idle");
      setIsSending(false);
      setSpecialInstructions("");
      setNameInput(session?.customerName ?? "");
    }
  }, [isCartOpen, session]);

  // ── Derived totals ───────────────────────────────────────────────────────────
  const grandTotalWithPrevious = hasActiveOrders && session
    ? session.runningTotal + grandTotal
    : grandTotal;

  const showClearCart = isQrCustomer ? !hasActiveOrders : true;

  // ── Shared WhatsApp sender helper ────────────────────────────────────────────
  const getTargetPhone = () => settings.order.dineInWhatsappNumber;
  // Convex action — Date.now() runs on server, never on customer device
  const getServerTime = useAction(api.serverTime.now);

  // ─────────────────────────────────────────────────────────────────────────────
  // PAY NOW — PAY AT LAST TICKED (kitchen message, cart stays)
  // ─────────────────────────────────────────────────────────────────────────────
  const handlePayAtLastOrder = useCallback(async () => {
    if (!restaurantOpen || totalItems === 0 || isSending) return;

    setIsSending(true);

    // 1. Resolve or create the session
    let activeSession = session;
    if (!activeSession) {
      const name = nameInput.trim() || "Guest";
      activeSession = initSession(name, scannedTableNumber!, settings.order.orderIdPrefix);
    }

    // 2. Calculate order number BEFORE adding to session
    const newOrderNumber = activeSession.totalOrdersCount + 1;

    // 3. Get server timestamp from Convex (runs on server, not device)
    const serverTimestamp = await getServerTime({}).catch(() => Date.now());

    // 4. Save order to session (uses server timestamp for per-order recording)
    addOrderToSession(items, specialInstructions, subtotal, totalSavings, grandTotal);

    // 5. Build kitchen message with server timestamp
    const msg = generateKitchenMessage({
      session: activeSession,
      currentOrderNumber: newOrderNumber,
      cartItems: items,
      orderTotal: grandTotal,
      specialInstructions,
      restaurantName: settings.restaurant.restaurantName,
      serverTimestamp,
    });

    // 6. Open WhatsApp — open blank first (popup safety), then navigate
    const waTab = window.open("", "_blank");
    const url = buildWhatsAppUrl(getTargetPhone(), msg);
    if (waTab) waTab.location.href = url;
    else window.open(url, "_blank");

    // 7. Clear the cart so the next round starts fresh
    clearCart();

    // 8. Toast + reset local state
    toast.success("Order sent to kitchen");
    setSpecialInstructions("");
    setPayAtLastChecked(true);
    setIsSending(false);
    setIsCartOpen(false);
  }, [
    restaurantOpen, totalItems, isSending, session, nameInput, scannedTableNumber,
    settings, items, specialInstructions, subtotal, totalSavings, grandTotal,
    initSession, addOrderToSession, clearCart, getTargetPhone, getServerTime, setIsCartOpen,
  ]);

  // ─────────────────────────────────────────────────────────────────────────────
  // PAY NOW — FINAL BILL (Pay at Last unticked, all orders consolidated)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleFinalBill = useCallback(async (paymentMethod: "cash" | "upi") => {
    if (!session || isSending) return;

    setIsSending(true);

    // Get server timestamp for the final bill header
    const serverTimestamp = await getServerTime({}).catch(() => Date.now());

    const msg = generateFinalBill({
      session,
      currentCartItems: items,
      currentOrderTotal: grandTotal,
      currentOrderSubtotal: subtotal,
      currentOrderSavings: totalSavings,
      currentSpecialInstructions: specialInstructions,
      paymentMethod,
      upiId: settings.upi.upiId,
      restaurantName: settings.restaurant.restaurantName,
      serverTimestamp,
    });

    const waTab = window.open("", "_blank");
    const url = buildWhatsAppUrl(getTargetPhone(), msg);
    if (waTab) waTab.location.href = url;
    else window.open(url, "_blank");

    // Clear session + cart
    clearSession();
    clearCart();
    setPayAtLastChecked(false);
    setFinalPayStep("idle");
    setIsSending(false);
    setIsCartOpen(false);
    toast.success("Thank you for dining with us!");
  }, [
    session, isSending, items, grandTotal, subtotal, totalSavings,
    specialInstructions, settings, clearSession, clearCart,
    getTargetPhone, getServerTime, setIsCartOpen,
  ]);

  // ─────────────────────────────────────────────────────────────────────────────
  // DIRECT PAY NOW — No Pay at Last (first order, no session or session cleared)
  // Uses the normal OrderModal flow
  // ─────────────────────────────────────────────────────────────────────────────
  const handleDirectPayNow = useCallback(() => {
    if (!canPlaceOrder) return;
    setIsCartOpen(false);
    window.dispatchEvent(new CustomEvent("open-order-modal"));
  }, [canPlaceOrder, setIsCartOpen]);

  // ─────────────────────────────────────────────────────────────────────────────
  // EXPIRED SESSION — force final payment
  // ─────────────────────────────────────────────────────────────────────────────
  const handleExpiredPay = useCallback(async (paymentMethod: "cash" | "upi") => {
    if (!session) return;

    const serverTimestamp = await getServerTime({}).catch(() => Date.now());

    const msg = generateFinalBill({
      session,
      currentCartItems: items,
      currentOrderTotal: grandTotal,
      currentOrderSubtotal: subtotal,
      currentOrderSavings: totalSavings,
      currentSpecialInstructions: "",
      paymentMethod,
      upiId: settings.upi.upiId,
      restaurantName: settings.restaurant.restaurantName,
      serverTimestamp,
    });

    const waTab = window.open("", "_blank");
    const url = buildWhatsAppUrl(getTargetPhone(), msg);
    if (waTab) waTab.location.href = url;
    else window.open(url, "_blank");

    clearSession();
    clearCart();
    setPayAtLastChecked(false);
    toast.success("Thank you for dining with us!");
  }, [
    session, items, grandTotal, subtotal, totalSavings,
    settings, clearSession, clearCart, getTargetPhone, getServerTime,
  ]);

  // ─────────────────────────────────────────────────────────────────────────────
  // PAY NOW button click — decides which flow to trigger
  // ─────────────────────────────────────────────────────────────────────────────
  const handlePayNow = useCallback(() => {
    if (!restaurantOpen || totalItems === 0) return;

    if (!isQrCustomer) {
      // Non-QR: use existing OrderModal
      handleDirectPayNow();
      return;
    }

    if (payAtLastChecked) {
      // Pay at Last ticked → kitchen message, cart stays
      handlePayAtLastOrder();
    } else if (hasActiveOrders) {
      // Final bill — show payment selection
      setFinalPayStep("select_payment");
    } else {
      // First-ever QR order, no Pay at Last → normal flow
      handleDirectPayNow();
    }
  }, [
    restaurantOpen, totalItems, isQrCustomer, payAtLastChecked,
    hasActiveOrders, handlePayAtLastOrder, handleDirectPayNow,
  ]);

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Session Expired Overlay (full screen, non-dismissible) ── */}
      <AnimatePresence>
        {isHydrated && isSessionExpired && session && hasActiveOrders && (
          <SessionExpiredOverlay
            session={session}
            currentOrderTotal={grandTotal}
            onPayCash={() => handleExpiredPay("cash")}
            onPayUpi={() => handleExpiredPay("upi")}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
              onClick={() => setIsCartOpen(false)}
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="fixed right-0 top-0 h-full w-full max-w-md z-[75] flex flex-col"
              style={{
                background: "hsl(var(--background) / 0.98)",
                borderLeft: "1px solid hsl(var(--primary) / 0.12)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
              }}
            >
              {/* ── Header ── */}
              <div
                className="flex items-center justify-between px-6 py-5 shrink-0"
                style={{ borderBottom: "1px solid hsl(var(--primary) / 0.10)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "hsl(var(--primary) / 0.12)" }}
                  >
                    <ShoppingBag className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold text-foreground leading-tight">
                      Your Cart
                    </h2>
                    {scannedTableNumber && (
                      <p className="text-xs font-semibold text-primary">
                        Table {scannedTableNumber}
                      </p>
                    )}
                    {totalItems > 0 && !scannedTableNumber && (
                      <p className="text-xs text-muted-foreground font-medium">
                        {totalItems} {totalItems === 1 ? "item" : "items"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Clear Cart — hidden when Pay at Last has active orders */}
                  {totalItems > 0 && showClearCart && (
                    <button
                      onClick={clearCart}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ── Session Timer Strip (when Pay at Last active) ── */}
              {isQrCustomer && hasSession && expiry.isExpiringSoon && !expiry.isExpired && (
                <div
                  className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold"
                  style={{ background: expiry.isExpiringSoon5 ? "#ef4444" : "#f97316", color: "#fff" }}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Session expires in {expiry.timeDisplay}</span>
                </div>
              )}

              {/* ── Items List ── */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {items.length === 0 ? (
                  /* Empty State */
                  <div className="flex flex-col items-center justify-center h-full text-center gap-5 pb-10">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center"
                      style={{ background: "hsl(var(--primary) / 0.07)" }}
                    >
                      <ShoppingBag className="w-9 h-9 text-muted-foreground/30" />
                    </div>
                    <div className="space-y-1">
                      {hasActiveOrders ? (
                        <>
                          <p className="text-base font-display font-bold text-foreground">
                            Add more items
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Your running bill has {session!.orders.length} order{session!.orders.length !== 1 ? "s" : ""}. Add more to continue.
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-base font-display font-bold text-foreground">
                            Your cart is empty
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Add something delicious from the menu
                          </p>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="mt-2 px-6 py-2.5 rounded-full text-sm font-semibold text-primary"
                      style={{
                        border: "1.5px solid hsl(var(--primary) / 0.4)",
                        background: "hsl(var(--primary) / 0.08)",
                      }}
                    >
                      Browse Menu
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Running Bill Banner — only visible when Pay at Last has previous orders */}
                    {isQrCustomer && hasActiveOrders && session && (
                      <RunningBillBanner
                        session={session}
                        currentOrderTotal={grandTotal}
                      />
                    )}

                    {/* Item label when Pay at Last active */}
                    {isQrCustomer && hasActiveOrders && (
                      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1 pb-1">
                        Current Order
                      </p>
                    )}

                    <AnimatePresence initial={false}>
                      {items.map((ci) => {
                        const isVeg = ci.isVeg;
                        return (
                          <motion.div
                            key={ci.id}
                            layout
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 40, scale: 0.95 }}
                            transition={{ duration: 0.22 }}
                            className="rounded-2xl px-4 py-4 space-y-4"
                            style={{
                              background: "hsl(var(--foreground) / 0.03)",
                              border: "1px solid hsl(var(--foreground) / 0.07)",
                            }}
                          >
                            {/* Top Row */}
                            <div className="flex items-start gap-3">
                              {/* Veg Indicator */}
                              <div className="flex-shrink-0 pt-1">
                                <div
                                  className="w-3.5 h-3.5 rounded-sm flex items-center justify-center"
                                  style={{ border: `1.2px solid ${isVeg ? "#22c55e" : "#ef4444"}` }}
                                >
                                  <div
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ background: isVeg ? "#22c55e" : "#ef4444" }}
                                  />
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="text-[15px] font-bold text-foreground leading-snug">
                                  {ci.name}
                                </p>
                                {ci.size !== "single" && (
                                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">
                                    {ci.size === "small" ? "Small Portion" : "Large Portion"}
                                  </p>
                                )}
                                {ci.offerType !== "none" && (
                                  <p className="mt-1 text-xs font-semibold text-primary">{ci.offerLabel}</p>
                                )}
                                {ci.offerType === "percentage" && (
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    <span className="line-through mr-1">Rs.{ci.originalPrice}</span>
                                    <span>Rs.{ci.finalPrice}</span>
                                  </p>
                                )}
                                {ci.offerType === "bogo" && (
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    Qty: {ci.quantity} (Billed: {ci.billedQuantity})
                                  </p>
                                )}
                                {ci.savings > 0 && (
                                  <p className="mt-1 text-xs font-semibold text-emerald-400">
                                    You save Rs.{ci.savings}
                                  </p>
                                )}
                              </div>

                              <button
                                onClick={() => removeItem(ci.itemId, ci.size)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Bottom Row: Controls and Price */}
                            <div className="flex items-center justify-between pt-1 border-t border-foreground/5">
                              <div
                                className="flex items-center gap-1 rounded-full p-0.5"
                                style={{
                                  background: "hsl(var(--foreground) / 0.05)",
                                  border: "1px solid hsl(var(--foreground) / 0.07)",
                                }}
                              >
                                <button
                                  onClick={() => updateQuantity(ci.itemId, ci.size, ci.quantity - 1)}
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-sm font-bold text-foreground w-6 text-center">
                                  {ci.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(ci.itemId, ci.size, ci.quantity + 1)}
                                  disabled={ci.quantity >= maxQuantityPerItem}
                                  className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="text-right">
                                <p className="text-xs text-muted-foreground font-medium mb-0.5">
                                  Rs.{ci.finalPrice} x {ci.billedQuantity}
                                </p>
                                <p className="text-[15px] font-bold text-primary">Rs.{ci.itemTotal}</p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </>
                )}
              </div>

              {/* ── Footer ── */}
              {(totalItems > 0 || (isQrCustomer && hasActiveOrders)) && (
                <div
                  className="px-5 pb-6 pt-4 space-y-3 shrink-0"
                  style={{ borderTop: "1px solid hsl(var(--primary) / 0.10)" }}
                >
                  {/* Restaurant closed banner */}
                  {!restaurantOpen && (
                    <div
                      className="rounded-xl px-4 py-3"
                      style={{
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.3)",
                      }}
                    >
                      <p className="text-sm font-semibold text-red-500 text-center">
                        Ordering is currently unavailable.{" "}
                        <br className="md:hidden" /> We are closed right now.
                      </p>
                    </div>
                  )}

                  {/* ── Name input — only when QR customer and no session ── */}
                  {isQrCustomer && !hasSession && isHydrated && totalItems > 0 && (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                        Your Name *
                      </label>
                      <input
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value.slice(0, 50))}
                        placeholder="Enter your name"
                        className="w-full px-4 py-3 rounded-xl text-sm font-body text-foreground focus:outline-none transition-colors"
                        style={{
                          background: "hsl(var(--foreground) / 0.05)",
                          border: "1px solid hsl(var(--primary) / 0.2)",
                        }}
                      />
                    </div>
                  )}

                  {/* ── Special Instructions — shown for QR customers per-order ── */}
                  {isQrCustomer && totalItems > 0 && (
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">
                        Special Requests{" "}
                        <span className="normal-case font-normal">(optional)</span>
                      </label>
                      <textarea
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value.slice(0, 200))}
                        placeholder="e.g. extra spicy, no onions…"
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl text-sm font-body text-foreground focus:outline-none transition-colors resize-none"
                        style={{
                          background: "hsl(var(--foreground) / 0.05)",
                          border: "1px solid hsl(var(--primary) / 0.2)",
                        }}
                      />
                    </div>
                  )}

                  {/* ── Delivery Info Banner (when delivery is ON) ── */}
                  {settings.delivery.deliveryEnabled && totalItems > 0 && (() => {
                    const dMin = settings.delivery.deliveryMinimumOrder;
                    const dCharge = settings.delivery.deliveryCharge;
                    const belowMin = dMin > 0 && grandTotal < dMin;
                    return (
                      <div
                        className={`rounded-xl border px-4 py-3 ${belowMin ? "border-amber-500/30 bg-amber-500/8" : "border-primary/20 bg-primary/5"}`}
                        style={{ borderLeft: "3px solid #FFC200" }}
                      >
                        <p className={`text-xs font-bold ${belowMin ? "text-amber-400" : "text-primary"}`}>
                          {belowMin
                            ? `⚠ Add Rs.${dMin - grandTotal} more to unlock Home Delivery`
                            : "🛵 Home Delivery Available"}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {dMin > 0 && `Min. order Rs.${dMin}`}
                          {dMin > 0 && " · "}
                          {dCharge === 0 ? "Free Delivery" : `Rs.${dCharge} delivery charge`}
                          {settings.delivery.deliveryEstimatedTime && ` · ${settings.delivery.deliveryEstimatedTime}`}
                        </p>
                      </div>
                    );
                  })()}

                  {/* ── Cart Summary ── */}
                  {totalItems > 0 && (
                    <div className="space-y-1 rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-3">
                      {isQrCustomer && hasActiveOrders && session ? (
                        // Pay at Last active: show previous + this + grand total
                        <>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Previous Orders</span>
                            <span>Rs.{Math.round(session.runningTotal)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>This Order</span>
                            <span>Rs.{grandTotal}</span>
                          </div>
                          <div className="mt-1 border-t border-foreground/10 pt-2 flex items-center justify-between">
                            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                              Grand Total
                            </span>
                            <span className="text-xl font-display font-bold text-primary">
                              Rs.{Math.round(grandTotalWithPrevious)}
                            </span>
                          </div>
                        </>
                      ) : (
                        // Standard: subtotal / savings / total
                        <>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Subtotal</span>
                            <span>Rs.{subtotal}</span>
                          </div>
                          {totalSavings > 0 && (
                            <div className="flex items-center justify-between text-sm text-emerald-400 font-semibold">
                              <span>You Save</span>
                              <span>- Rs.{totalSavings}</span>
                            </div>
                          )}
                          <div className="mt-1 border-t border-foreground/10 pt-2 flex items-center justify-between">
                            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                              Total Due
                            </span>
                            <span className="text-xl font-display font-bold text-primary">
                              Rs.{grandTotal}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* ── Pay at Last Checkbox (QR only) ── */}
                  {isQrCustomer && totalItems > 0 && (
                    <label className="flex items-center gap-3 cursor-pointer group select-none">
                      <div
                        className="relative w-5 h-5 rounded flex items-center justify-center transition-all shrink-0"
                        style={{
                          background: payAtLastChecked ? "#FFC200" : "transparent",
                          border: `2px solid ${payAtLastChecked ? "#FFC200" : "hsl(var(--foreground) / 0.3)"}`,
                        }}
                      >
                        {payAtLastChecked && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />
                          </motion.div>
                        )}
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={payAtLastChecked}
                          onChange={(e) => {
                            setPayAtLastChecked(e.target.checked);
                            if (finalPayStep === "select_payment") setFinalPayStep("idle");
                          }}
                        />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-foreground">Pay at Last</span>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {payAtLastChecked
                            ? "Order sent to kitchen. Pay when you're done eating."
                            : "Tick to keep ordering — pay at the end of your meal."}
                        </p>
                      </div>
                    </label>
                  )}

                  {/* ── Inline Payment Selection (final bill) ── */}
                  <AnimatePresence>
                    {isQrCustomer && finalPayStep === "select_payment" && hasActiveOrders && session && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-2"
                      >
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center pt-1">
                          How would you like to pay?
                        </p>
                        <p className="text-center text-sm font-bold text-primary">
                          Total Due: Rs.{calcFinalBillTotal(session, grandTotal)}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleFinalBill("cash")}
                            disabled={isSending}
                            className="py-4 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                            style={{ background: "#FFC200", color: "#0a0a0a" }}
                          >
                            Cash
                          </button>
                          <button
                            onClick={() => handleFinalBill("upi")}
                            disabled={isSending}
                            className="py-4 rounded-xl font-bold text-sm border-2 transition-all disabled:opacity-50"
                            style={{ borderColor: "#FFC200", color: "#FFC200", background: "transparent" }}
                          >
                            Paytm / UPI
                          </button>
                        </div>
                        <button
                          onClick={() => setFinalPayStep("idle")}
                          className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                        >
                          Cancel
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── PAY NOW / Place Order CTA ── */}
                  {finalPayStep !== "select_payment" && (
                    isQrCustomer && payAtLastChecked ? (
                      /* Two buttons: Pay At Last + Final Bill */
                      <div className="space-y-2">
                        {/* Primary: send to kitchen, clear cart */}
                        <button
                          id="pay-at-last-btn"
                          onClick={handlePayAtLastOrder}
                          disabled={!canPlaceOrder || isSending}
                          className="w-full font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{
                            minHeight: 56,
                            borderRadius: 9999,
                            background: canPlaceOrder ? "#FFC200" : "hsl(var(--muted))",
                            color: canPlaceOrder ? "#0a0a0a" : "hsl(var(--muted-foreground))",
                            boxShadow: canPlaceOrder ? "0 10px 30px rgba(255,194,0,0.35)" : "none",
                          }}
                        >
                          {isSending ? "Sending…" : "Pay At Last"}
                        </button>

                        {/* Secondary: trigger final bill payment selection */}
                        <button
                          id="final-bill-btn"
                          onClick={() => setFinalPayStep("select_payment")}
                          disabled={isSending || !hasActiveOrders}
                          className="w-full font-bold text-base border-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{
                            minHeight: 48,
                            borderRadius: 9999,
                            borderColor: hasActiveOrders ? "#FFC200" : "hsl(var(--foreground) / 0.2)",
                            color: hasActiveOrders ? "#FFC200" : "hsl(var(--muted-foreground))",
                            background: "transparent",
                          }}
                        >
                          Final Bill
                        </button>
                      </div>
                    ) : (
                      /* Single button: Place Order or Final Bill */
                      <button
                        id="pay-now-btn"
                        onClick={handlePayNow}
                        disabled={!canPlaceOrder || isSending}
                        className="w-full font-bold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          minHeight: 56,
                          borderRadius: 9999,
                          background: canPlaceOrder ? "#FFC200" : "hsl(var(--muted))",
                          color: canPlaceOrder ? "#0a0a0a" : "hsl(var(--muted-foreground))",
                          boxShadow: canPlaceOrder ? "0 10px 30px rgba(255,194,0,0.35)" : "none",
                        }}
                      >
                        {isSending
                          ? "Sending…"
                          : isQrCustomer && hasActiveOrders
                          ? "Final Bill"
                          : "Place Order via WhatsApp"}
                      </button>
                    )
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartDrawer;
