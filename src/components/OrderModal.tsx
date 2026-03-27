"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { X, Check, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import type { CartItem } from "@/context/CartContext";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useTableNumber } from "@/hooks/useTableNumber";
import { generateOrderToken } from "@/utils/order";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "../utils/whatsapp";
import type { WhatsAppLineItem } from "../utils/whatsapp";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatOrderDateTime } from "@/utils/formatDateTime";

type OrderType = "dine-in" | "takeaway" | null;
type PaymentMethod = "cash" | "upi" | null;

const OrderModal = () => {
  const { items, grandTotal, subtotal, totalSavings, clearCart } = useCart();
  const { settings } = useAppSettings();
  const { tableNumber: scannedTableNumber } = useTableNumber();

  const dineInEnabled = settings.order.dineInEnabled;
  // QR table scans always unlock dine-in regardless of the admin toggle
  const hasQrTable = !!scannedTableNumber;
  // Dine-in is available when admin enables it globally OR a QR table is scanned
  const isDineInUnlocked = dineInEnabled || hasQrTable;

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [orderType, setOrderType] = useState<OrderType>(null);
  const [name, setName] = useState("");
  const [tableNo, setTableNo] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>(null);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [orderId, setOrderId] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availablePayments = useMemo<PaymentMethod[]>(() => {
    const methods: PaymentMethod[] = [];
    if (settings.upi.enableCash) methods.push("cash");
    if (settings.upi.enableUpi) methods.push("upi");
    // Always fall back to cash so there's at least one option
    if (methods.length === 0) methods.push("cash");
    return methods;
  }, [settings.upi.enableCash, settings.upi.enableUpi]);

  useEffect(() => {
    const handler = () => {
      // Reset every field cleanly every time the modal is opened
      setIsOpen(true);
      setStep(1); // Always show Step 1 — both cards are always visible
      // QR scan auto-selects dine-in; otherwise customer explicitly chooses
      setOrderType(hasQrTable ? "dine-in" : null);
      setName("");
      setTableNo(scannedTableNumber ?? "");
      setPayment(availablePayments[0] ?? "cash");
      setSpecialInstructions("");
      setOrderId(generateOrderToken(settings.order.orderIdPrefix));
      setShowSuccess(false);
      setIsSubmitting(false);
    };

    window.addEventListener("open-order-modal", handler);
    return () => window.removeEventListener("open-order-modal", handler);
  }, [availablePayments, scannedTableNumber, settings.order.orderIdPrefix, hasQrTable]);

  // Don't allow backdrop close while order is in-flight or success is shown
  const close = useCallback(() => {
    if (isSubmitting) return;
    setIsOpen(false);
  }, [isSubmitting]);

  const canProceed = useCallback(() => {
    if (step === 1) return !!orderType;
    if (step === 2) {
      return (
        name.trim().length > 0 &&
        (orderType !== "dine-in" || tableNo.trim().length > 0)
      );
    }
    if (step === 3) return !!payment;
    return true;
  }, [step, orderType, name, tableNo, payment]);

  // If only one payment method is available, skip step 3 automatically
  const totalSteps = availablePayments.length === 1 ? 3 : 4;
  const isLastStep = step === totalSteps;

  const goNext = useCallback(() => {
    if (!canProceed()) return;
    // If we're on step 2 and only one payment exists, skip step 3
    if (step === 2 && availablePayments.length === 1) {
      setStep(4);
    } else {
      setStep((s) => s + 1);
    }
  }, [canProceed, step, availablePayments.length]);

  const goBack = useCallback(() => {
    // If we're on step 4 and only one payment method, go back to step 2
    if (step === 4 && availablePayments.length === 1) {
      setStep(2);
    } else {
      setStep((s) => s - 1);
    }
  }, [step, availablePayments.length]);

  const submitOrder = useMutation(api.orders.submit);

  const sendOrder = useCallback(async () => {
    if (!orderType || !payment || !orderId || isSubmitting) return;

    setIsSubmitting(true);

    const orderItems: WhatsAppLineItem[] = items.map((cartItem: CartItem) => ({
      name: cartItem.name,
      itemId: cartItem.itemId,
      size: cartItem.size,
      quantity: cartItem.quantity,
      billedQuantity: cartItem.billedQuantity,
      originalPrice: cartItem.originalPrice,
      finalPrice: cartItem.finalPrice,
      itemTotal: cartItem.itemTotal,
      savings: cartItem.savings,
      offerType: cartItem.offerType,
      offerPercentage: cartItem.offerPercentage,
    }));

    const targetNumber =
      orderType === "dine-in"
        ? settings.order.dineInWhatsappNumber
        : settings.order.takeawayWhatsappNumber;

    // Open a blank tab BEFORE the async await so the browser counts this
    // as a user-gesture-initiated popup and does not block it.
    const waTab = window.open("", "_blank");

    try {
      // ⏱ Get the server timestamp — Date.now() runs inside Convex, not on device
      const result = await submitOrder({
        orderId,
        customerName: name.trim(),
        orderType:
          orderType === "dine-in" && scannedTableNumber
            ? "qr-dine-in"
            : orderType,
        tableNumber: orderType === "dine-in" ? tableNo.trim() : undefined,
        paymentMethod: payment,
        specialInstructions: specialInstructions.trim() || undefined,
        items: orderItems.map((item: WhatsAppLineItem) => ({
          name: item.name,
          itemId: item.itemId,
          size: item.size,
          quantity: item.quantity,
          price: item.finalPrice,
        })),
        totalAmount: grandTotal,
        status: "pending",
      });

      // Format IST timestamp from Convex server time
      const dateTime = formatOrderDateTime(result.serverTimestamp);

      const message = buildWhatsAppMessage({
        orderId,
        dateTime,
        items: orderItems,
        subtotal,
        totalSavings,
        totalAmount: grandTotal,
        customerName: name.trim(),
        orderType,
        tableNumber: orderType === "dine-in" ? tableNo.trim() : null,
        scannedTableNumber,
        paymentMethod: payment,
        estimatedTime: settings.order.estimatedWaitTime,
        upiId: settings.upi.upiId,
        restaurantName: settings.restaurant.restaurantName,
        specialInstructions,
      });

      // Navigate the already-opened tab to the WhatsApp URL
      if (waTab) {
        waTab.location.href = buildWhatsAppUrl(targetNumber, message);
      } else {
        window.open(buildWhatsAppUrl(targetNumber, message), "_blank");
      }
    } catch (e) {
      console.error("Failed to save order to database:", e);
      // Fallback: use device time if Convex call failed (very rare)
      const fallbackDateTime = formatOrderDateTime(Date.now());
      const message = buildWhatsAppMessage({
        orderId,
        dateTime: fallbackDateTime,
        items: orderItems,
        subtotal,
        totalSavings,
        totalAmount: grandTotal,
        customerName: name.trim(),
        orderType,
        tableNumber: orderType === "dine-in" ? tableNo.trim() : null,
        scannedTableNumber,
        paymentMethod: payment,
        estimatedTime: settings.order.estimatedWaitTime,
        upiId: settings.upi.upiId,
        restaurantName: settings.restaurant.restaurantName,
        specialInstructions,
      });
      if (waTab) {
        waTab.location.href = buildWhatsAppUrl(targetNumber, message);
      } else {
        window.open(buildWhatsAppUrl(targetNumber, message), "_blank");
      }
    }

    setShowSuccess(true);

    window.setTimeout(() => {
      clearCart();
      setIsSubmitting(false);
      setIsOpen(false);
    }, 2500);
  }, [
    orderType,
    payment,
    orderId,
    isSubmitting,
    items,
    subtotal,
    totalSavings,
    grandTotal,
    name,
    tableNo,
    scannedTableNumber,
    settings,
    specialInstructions,
    submitOrder,
    clearCart,
  ]);

  // Progress bar segments: show the actual step count (3 or 4)
  const stepSegments = totalSteps === 3 ? [1, 2, 3] : [1, 2, 3, 4];
  // Map display step to visual progress (when step 3 is skipped, step 4 = full)
  const visualStep =
    totalSteps === 3 && step === 4 ? 3 : step;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-background/70 backdrop-blur-md"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong w-full max-w-md relative rounded-2xl flex flex-col max-h-[90dvh]"
          >
            {/* Close button — hidden during success state */}
            {!showSuccess && (
              <button
                onClick={close}
                aria-label="Close order modal"
                className="absolute top-4 right-4 p-1 hover:bg-muted rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="overflow-y-auto flex-1 p-6">
              {showSuccess ? (
                <div className="py-12 flex flex-col items-center gap-4 text-center">
                  <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center animate-scale-in">
                    <Check className="w-10 h-10 text-success" />
                  </div>
                  <h3 className="text-2xl font-display text-foreground tracking-wider">
                    Order Placed! 🎉
                  </h3>
                  <p className="text-sm font-mono text-primary">{orderId}</p>
                  <p className="text-sm text-muted-foreground font-body">
                    Your WhatsApp is opening — please send the message to
                    confirm your order.
                  </p>
                  <p className="text-xs text-muted-foreground font-body">
                    This window will close automatically.
                  </p>
                </div>
              ) : (
                <>
                  {/* Step progress bar */}
                  <div className="flex gap-2 mb-6 pr-8">
                    {stepSegments.map((seg) => (
                      <div
                        key={seg}
                        className={`flex-1 h-1 rounded-full transition-colors duration-300 ${seg <= visualStep ? "bg-primary" : "bg-muted"
                          }`}
                      />
                    ))}
                  </div>

                  {/* ── Step 1: Order Type ── */}
                  {step === 1 && (
                    <div>
                      <div className="mb-5">
                        <h3 className="text-xl font-display text-foreground tracking-wider">
                          How would you like your order? 🍽️
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 font-body">
                          Choose your preferred ordering method
                        </p>
                      </div>

                      <div className="flex flex-col gap-3">

                        {/* ─── Takeaway — always active ─── */}
                        <motion.button
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0, duration: 0.22 }}
                          onClick={() => setOrderType(orderType === "takeaway" ? null : "takeaway")}
                          className={`relative p-4 text-left rounded-2xl border-2 w-full transition-all duration-200 ${
                            orderType === "takeaway"
                              ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_24px_rgba(16,185,129,0.15)]"
                              : "border-white/10 bg-white/[0.04] hover:border-emerald-500/40 hover:bg-white/[0.06]"
                          }`}
                        >
                          {orderType === "takeaway" && (
                            <div className="absolute top-3.5 right-3.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center animate-scale-in">
                              <Check className="w-3 h-3 text-black stroke-[3.5px]" />
                            </div>
                          )}
                          <div className="flex items-start gap-3.5">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${orderType === "takeaway" ? "bg-emerald-500/25" : "bg-emerald-500/10 border border-emerald-500/20"}`}>
                              <ShoppingBag className={`w-[18px] h-[18px] transition-colors ${orderType === "takeaway" ? "text-emerald-400" : "text-emerald-500/60"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <span className="font-display font-bold text-sm text-foreground">Takeaway</span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 leading-none">
                                  Always Available
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground font-body">Pack and carry</p>
                              <p className="text-[11px] text-muted-foreground/55 font-body mt-1 leading-relaxed">
                                Order from anywhere and pick up at our counter
                              </p>
                            </div>
                          </div>
                        </motion.button>

                        {/* ─── Dine-In ─── */}
                        {isDineInUnlocked ? (
                          /* ACTIVE — admin enabled it OR QR scanned */
                          <motion.button
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.22 }}
                            onClick={() => {
                              if (orderType === "dine-in") {
                                setOrderType(null);
                              } else {
                                setOrderType("dine-in");
                                if (hasQrTable) setTableNo(scannedTableNumber ?? "");
                              }
                            }}
                            className={`relative p-4 text-left rounded-2xl border-2 w-full transition-all duration-200 ${
                              orderType === "dine-in"
                                ? "border-primary bg-primary/10 shadow-[0_0_24px_rgba(245,166,35,0.15)]"
                                : "border-white/10 bg-white/[0.04] hover:border-primary/40 hover:bg-white/[0.06]"
                            }`}
                          >
                            {orderType === "dine-in" && (
                              <div className="absolute top-3.5 right-3.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-scale-in">
                                <Check className="w-3 h-3 text-black stroke-[3.5px]" />
                              </div>
                            )}
                            <div className="flex items-start gap-3.5">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${orderType === "dine-in" ? "bg-primary/20" : "bg-white/[0.08]"}`}>
                                <UtensilsCrossed className={`w-[18px] h-[18px] transition-colors ${orderType === "dine-in" ? "text-primary" : "text-white/50"}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                  <span className="font-display font-bold text-sm text-foreground">Dine-In</span>
                                  {hasQrTable ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 leading-none">
                                      ✅ Table {scannedTableNumber} Detected
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/15 border border-primary/30 text-primary leading-none">
                                      Available
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-muted-foreground font-body">Sit and eat with us</p>
                                <p className="text-[11px] text-muted-foreground/55 font-body mt-1 leading-relaxed">
                                  {hasQrTable
                                    ? "You're all set! Your table has been automatically detected."
                                    : "Order and enjoy your meal at your table"}
                                </p>
                              </div>
                            </div>
                          </motion.button>
                        ) : (
                          /* DISABLED — not at restaurant, dine-in off, no QR */
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.22 }}
                            className="relative p-4 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02] cursor-not-allowed select-none"
                            style={{ opacity: 0.62 }}
                          >
                            <div className="flex items-start gap-3.5">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/5">
                                <UtensilsCrossed className="w-[18px] h-[18px] text-white/20" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                  <span className="font-display font-bold text-sm text-white/35">Dine-In</span>
                                  <motion.span
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border border-amber-500/35 text-amber-400/80 leading-none"
                                  >
                                    📍 Location Only
                                  </motion.span>
                                </div>
                                <p className="text-[11px] text-white/30 font-body">Sit and eat with us</p>
                                <div className="mt-2.5 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                                  <p className="text-[11px] text-white/40 font-body leading-relaxed">
                                    📱 Scan the QR code on your table when you're at Foodieez Junction to unlock dine-in ordering
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                      </div>
                    </div>
                  )}

                  {/* ── Step 2: Customer Details ── */}
                  {step === 2 && (
                    <div>
                      <h3 className="text-2xl font-display text-foreground tracking-wider mb-6">
                        Your Details 📝
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-heading font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                            Name *
                          </label>
                          <input
                            value={name}
                            onChange={(e) =>
                              setName(e.target.value.slice(0, 50))
                            }
                            placeholder="Your name"
                            autoFocus
                            className="w-full px-4 py-3 rounded-lg bg-input border border-primary/10 text-foreground font-body focus:border-primary focus:outline-none transition-colors"
                          />
                        </div>
                        {orderType === "dine-in" && (
                          <div>
                            <label className="text-xs font-heading font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                              Table Number *
                            </label>
                            <input
                              value={tableNo}
                              onChange={(e) => !hasQrTable && setTableNo(e.target.value)}
                              readOnly={hasQrTable}
                              placeholder="e.g. 5"
                              className={`w-full px-4 py-3 rounded-lg bg-input border border-primary/10 text-foreground font-body focus:outline-none transition-colors ${
                                hasQrTable
                                  ? "cursor-default opacity-75 border-emerald-500/20 focus:border-emerald-500/20"
                                  : "focus:border-primary"
                              }`}
                            />
                            {hasQrTable && (
                              <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1">
                                <span>✅</span> Auto-filled from QR scan
                              </p>
                            )}
                          </div>
                        )}
                        <div>
                          <label className="text-xs font-heading font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                            Special Requests{" "}
                            <span className="normal-case font-normal">
                              (e.g., less spicy, no onions)
                            </span>
                          </label>
                          <textarea
                            value={specialInstructions}
                            onChange={(e) =>
                              setSpecialInstructions(
                                e.target.value.slice(0, 200)
                              )
                            }
                            placeholder="Optional"
                            rows={3}
                            className="w-full px-4 py-3 rounded-lg bg-input border border-primary/10 text-foreground font-body focus:border-primary focus:outline-none transition-colors resize-none"
                          />
                          <p className="text-xs text-muted-foreground mt-1 text-right">
                            {specialInstructions.length}/200
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Step 3: Payment (only shown when more than one method) ── */}
                  {step === 3 && availablePayments.length > 1 && (
                    <div>
                      <h3 className="text-2xl font-display text-foreground tracking-wider mb-6">
                        Payment Method 💳
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {(["cash", "upi"] as const).map((method) => {
                          const isAvailable = availablePayments.includes(method);
                          return (
                            <button
                              key={method}
                              onClick={() =>
                                isAvailable && setPayment(method)
                              }
                              disabled={!isAvailable}
                              className={`relative glass p-6 text-center transition-all rounded-xl ${payment === method
                                ? "border-2 border-primary bg-primary/10 shadow-[0_0_20px_rgba(245,166,35,0.2)]"
                                : "hover:border-primary/30"
                                } disabled:opacity-40 disabled:cursor-not-allowed`}
                            >
                              {payment === method && (
                                <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-scale-in">
                                  <Check className="w-3.5 h-3.5 text-primary-foreground stroke-[3px]" />
                                </div>
                              )}
                              <span className="text-3xl block mb-2">
                                {method === "cash" ? "💵" : "📲"}
                              </span>
                              <span className="font-heading font-bold text-sm text-foreground uppercase">
                                {method === "cash" ? "Cash" : "UPI"}
                              </span>
                              <p className="text-xs text-muted-foreground mt-1">
                                {method === "cash"
                                  ? "Pay at counter"
                                  : "Pay digitally"}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Step 4: Confirm Order ── */}
                  {step === 4 && (
                    <div>
                      <h3 className="text-2xl font-display text-foreground tracking-wider mb-4">
                        Confirm Order ✅
                      </h3>
                      <div className="glass p-4 space-y-1.5 mb-4 text-sm font-body rounded-xl">
                        {/* Order metadata */}
                        <div className="space-y-1 pb-2">
                          <p>
                            <span className="text-muted-foreground">
                              Order ID:
                            </span>{" "}
                            <span className="font-mono text-primary">
                              {orderId}
                            </span>
                          </p>
                          <p>
                            <span className="text-muted-foreground">
                              Type:
                            </span>{" "}
                            {orderType === "dine-in"
                              ? `Dine-In${scannedTableNumber ? " (QR)" : ""}`
                              : scannedTableNumber
                                ? `Takeaway (at Table ${scannedTableNumber})`
                                : "Takeaway"}
                          </p>
                          <p>
                            <span className="text-muted-foreground">
                              Name:
                            </span>{" "}
                            {name}
                          </p>
                          {orderType === "dine-in" && (
                            <p>
                              <span className="text-muted-foreground">
                                Table:
                              </span>{" "}
                              {tableNo}
                            </p>
                          )}
                          <p>
                            <span className="text-muted-foreground">
                              Payment:
                            </span>{" "}
                            {payment === "cash" ? "💵 Cash" : "📲 UPI"}
                          </p>
                          {specialInstructions.trim().length > 0 && (
                            <p className="text-muted-foreground italic">
                              📝 {specialInstructions}
                            </p>
                          )}
                        </div>

                        {/* Items list — scrollable so it doesn't overflow on small screens */}
                        <div className="border-t border-primary/10 pt-2 mt-1 max-h-40 overflow-y-auto space-y-0.5 pr-1">
                          {items.map((cartItem: CartItem) => {
                            return (
                              <p
                                key={cartItem.id}
                                className="text-foreground/80"
                              >
                                {cartItem.name}
                                {cartItem.size !== "single" &&
                                  ` (${cartItem.size === "small" ? "S" : "L"})`}{" "}
                                ×{cartItem.quantity} — 
                                <span className="text-primary">Rs.{cartItem.itemTotal}</span>
                                {cartItem.offerType === "bogo" && (
                                  <span className="text-foreground/60"> (Billed: {cartItem.billedQuantity})</span>
                                )}
                              </p>
                            );
                          })}
                        </div>

                        {/* Total */}
                        <p className="text-lg font-display text-primary tracking-wider pt-2 border-t border-primary/10 mt-1">
                          Total: Rs.{grandTotal}
                        </p>
                      </div>

                      <p className="text-xs text-muted-foreground text-center font-body">
                        Clicking &quot;Place Order&quot; will open WhatsApp with your order.
                        Please tap <strong>Send</strong> there to confirm.
                      </p>
                    </div>
                  )}

                  {/* ── Navigation buttons ── */}
                  <div className="flex gap-3 mt-6">
                    {step > 1 && (
                      <button
                        onClick={goBack}
                        className="flex-1 py-3 rounded-full border border-foreground/20 text-foreground font-heading font-bold text-sm hover:border-primary transition-colors"
                      >
                        Back
                      </button>
                    )}
                    {!isLastStep ? (
                      <button
                        onClick={goNext}
                        disabled={!canProceed()}
                        className="flex-1 py-3 rounded-full bg-primary text-primary-foreground font-heading font-bold text-sm shimmer disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/30 transition-all"
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        onClick={sendOrder}
                        disabled={isSubmitting}
                        className="flex-1 py-3 rounded-full bg-primary text-primary-foreground font-heading font-bold text-sm shimmer hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Opening WhatsApp…" : "Place Order"}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderModal;