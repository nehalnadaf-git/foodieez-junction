"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { X, Check, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart, getItemPrice } from "@/context/CartContext";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useTableNumber } from "@/hooks/useTableNumber";
import { generateOrderToken } from "@/utils/order";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/utils/whatsapp";
import { calculateDiscountedPrice, isOfferActive } from "@/utils/offer";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

type OrderType = "dine-in" | "takeaway" | null;
type PaymentMethod = "cash" | "upi" | null;

const OrderModal = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { settings } = useAppSettings();
  const { tableNumber: scannedTableNumber } = useTableNumber();

  // ── Dine-In control logic ──────────────────────────────────────────────────
  const dineInEnabled = settings.order.dineInEnabled;
  const isQRScan = !!scannedTableNumber;
  // Dine-in unlocked if: admin turned it ON for everyone, OR customer scanned QR
  const isDineInUnlocked = isQRScan || dineInEnabled;
  // ──────────────────────────────────────────────────────────────────────────

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
    if (methods.length === 0) methods.push("cash");
    return methods;
  }, [settings.upi.enableCash, settings.upi.enableUpi]);

  useEffect(() => {
    const handler = () => {
      setIsOpen(true);
      setStep(1); // Always start at step 1 — both cards always shown
      // Pre-select dine-in when QR detected, but customer still sees the screen
      if (isQRScan) {
        setOrderType("dine-in");
        setTableNo(scannedTableNumber ?? "");
      } else {
        setOrderType(null);
        setTableNo("");
      }
      setName("");
      setPayment(availablePayments[0] ?? "cash");
      setSpecialInstructions("");
      setOrderId(generateOrderToken(settings.order.orderIdPrefix));
      setShowSuccess(false);
      setIsSubmitting(false);
    };

    window.addEventListener("open-order-modal", handler);
    return () => window.removeEventListener("open-order-modal", handler);
  }, [availablePayments, scannedTableNumber, settings.order.orderIdPrefix, isQRScan]);

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

  // Step 1 always shown → always 4 steps max (3 if single payment method)
  const totalSteps = availablePayments.length === 1 ? 3 : 4;
  const isLastStep = step === 4;

  const goNext = useCallback(() => {
    if (!canProceed()) return;
    if (step === 2 && availablePayments.length === 1) {
      setStep(4);
    } else {
      setStep((s) => s + 1);
    }
  }, [canProceed, step, availablePayments.length]);

  const goBack = useCallback(() => {
    if (step <= 1) return;
    if (step === 4 && availablePayments.length === 1) {
      setStep(2);
    } else {
      setStep((s) => s - 1);
    }
  }, [step, availablePayments.length]);

  const submitOrder = useMutation(api.orders.submit);

  const sendOrder = useCallback(() => {
    if (!orderType || !payment || !orderId || isSubmitting) return;

    setIsSubmitting(true);

    const orderItems = items.map((cartItem) => {
      const baseUnitPrice =
        cartItem.size === "small" && cartItem.item.priceSmall
          ? cartItem.item.priceSmall
          : cartItem.size === "large" && cartItem.item.priceLarge
            ? cartItem.item.priceLarge
            : cartItem.item.price || 0;
      const unitPrice = getItemPrice(cartItem.item, cartItem.size);
      const sizeSuffix =
        cartItem.size === "single"
          ? ""
          : ` (${cartItem.size === "small" ? "S" : "L"})`;

      return {
        name: `${cartItem.item.name}${sizeSuffix}`,
        itemId: cartItem.item.id,
        size: cartItem.size,
        quantity: cartItem.quantity,
        price: unitPrice,
        originalAmount: baseUnitPrice * cartItem.quantity,
        offer: cartItem.item.offer,
      };
    });

    const message = buildWhatsAppMessage({
      orderId,
      items: orderItems,
      totalAmount: totalPrice,
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

    const targetNumber =
      orderType === "dine-in"
        ? settings.order.dineInWhatsappNumber
        : settings.order.takeawayWhatsappNumber;

    // Open WhatsApp synchronously within the click handler so the browser
    // does NOT block the new tab (user-gesture trust is lost after any await).
    window.open(buildWhatsAppUrl(targetNumber, message), "_blank");
    setShowSuccess(true);

    // Save order to the database in the background — failure is non-critical,
    // the customer's WhatsApp message already carries all order details.
    submitOrder({
      orderId,
      customerName: name.trim(),
      orderType:
        orderType === "dine-in" && scannedTableNumber
          ? "qr-dine-in"
          : orderType,
      tableNumber: orderType === "dine-in" ? tableNo.trim() : undefined,
      paymentMethod: payment,
      specialInstructions: specialInstructions.trim() || undefined,
      items: orderItems.map((item) => ({
        name: item.name,
        itemId: item.itemId,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: totalPrice,
      status: "pending",
    }).catch((e) => {
      console.error("Failed to save order to database:", e);
    });

    window.setTimeout(() => {
      clearCart();
      setIsSubmitting(false);
      setIsOpen(false); // Auto-close after success + cart clear
    }, 2500);
  }, [
    orderType,
    payment,
    orderId,
    isSubmitting,
    items,
    totalPrice,
    name,
    tableNo,
    scannedTableNumber,
    settings,
    specialInstructions,
    submitOrder,
    clearCart,
  ]);

  // Progress bar — step 1 always visible, so always totalSteps segments
  const stepSegments = Array.from({ length: totalSteps }, (_, i) => i + 1);
  const visualStep = step === 4 && availablePayments.length === 1 ? totalSteps : step;

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
                  {/* ── Step 1: Order Type — always shows BOTH cards ── */}
                  {step === 1 && (
                    <div>
                      <h3 className="text-2xl font-display text-foreground tracking-wider mb-1">
                        How would you like your order?
                      </h3>
                      <p className="text-sm text-muted-foreground font-body mb-5">Choose your preferred ordering method</p>

                      <div className="flex flex-col gap-3">

                        {/* ── Takeaway card — always active ── */}
                        <motion.button
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0, duration: 0.28 }}
                          onClick={() => setOrderType("takeaway")}
                          className={`relative text-left glass p-4 rounded-xl transition-all duration-200 ${
                            orderType === "takeaway"
                              ? "border-2 border-primary bg-primary/10 shadow-[0_0_20px_rgba(245,166,35,0.18)]"
                              : "hover:border-primary/30 border border-white/10"
                          }`}
                        >
                          {orderType === "takeaway" && (
                            <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-black stroke-[3px]" />
                            </div>
                          )}
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                              <ShoppingBag className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-heading font-bold text-sm text-foreground">Takeaway</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Always Available</span>
                              </div>
                              <p className="text-xs text-muted-foreground">Pack and carry</p>
                              <p className="text-xs text-muted-foreground/70 mt-0.5">Order from anywhere and pick up at our counter</p>
                            </div>
                          </div>
                        </motion.button>

                        {/* ── Dine-In card — locked or unlocked ── */}
                        <motion.div
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.12, duration: 0.28 }}
                          onClick={() => isDineInUnlocked && setOrderType("dine-in")}
                          className={`relative text-left rounded-xl transition-all duration-200 ${
                            isDineInUnlocked
                              ? `glass p-4 cursor-pointer border ${
                                  orderType === "dine-in"
                                    ? "border-2 border-primary bg-primary/10 shadow-[0_0_20px_rgba(245,166,35,0.18)]"
                                    : "border-white/10 hover:border-primary/30"
                                }`
                              : "p-4 cursor-not-allowed opacity-60 border border-dashed border-white/20 bg-white/[0.03]"
                          }`}
                        >
                          {isDineInUnlocked && orderType === "dine-in" && (
                            <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-black stroke-[3px]" />
                            </div>
                          )}

                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isDineInUnlocked
                                ? "bg-primary/15 border border-primary/25"
                                : "bg-white/5 border border-white/10"
                            }`}>
                              <UtensilsCrossed className={`w-5 h-5 ${
                                isDineInUnlocked ? "text-primary" : "text-white/30"
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`font-heading font-bold text-sm ${
                                  isDineInUnlocked ? "text-foreground" : "text-white/40"
                                }`}>Dine-In</span>
                                {isDineInUnlocked ? (
                                  isQRScan ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                      ✅ Table {scannedTableNumber} Detected
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                                      Available
                                    </span>
                                  )
                                ) : (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/15 text-white/35">
                                    📍 Location Only
                                  </span>
                                )}
                              </div>
                              <p className={`text-xs ${
                                isDineInUnlocked ? "text-muted-foreground" : "text-white/30"
                              }`}>Sit and eat with us</p>

                              {isDineInUnlocked ? (
                                isQRScan && (
                                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                                    You&apos;re all set! Your table has been automatically detected.
                                  </p>
                                )
                              ) : (
                                <div className="mt-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                                  <p className="text-[11px] text-white/40 leading-relaxed">
                                    📱 Scan the QR code on your table when you&apos;re at Foodieez Junction to unlock dine-in ordering
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>

                      </div>
                    </div>
                  )}

                  {/* ── Step 2: Customer Details ── */}
                  {step === 2 && (
                    <div>
                      <h3 className="text-2xl font-display text-foreground tracking-wider mb-1">
                        Your Details 📝
                      </h3>
                      {isQRScan && orderType === "dine-in" && (
                        <p className="text-xs text-primary font-heading mb-5 mt-1">
                          🪑 Ordering for Table {scannedTableNumber}
                        </p>
                      )}
                      {orderType === "takeaway" && (
                        <p className="text-xs text-muted-foreground font-heading mb-5 mt-1">📦 Takeaway Order</p>
                      )}
                      {orderType === "dine-in" && !isQRScan && <div className="mb-5" />}
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
                        {/* Table number: shown for dine-in; read-only (hidden from input) if QR-scanned */}
                        {orderType === "dine-in" && !isQRScan && (
                          <div>
                            <label className="text-xs font-heading font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                              Table Number *
                            </label>
                            <input
                              value={tableNo}
                              onChange={(e) => setTableNo(e.target.value)}
                              placeholder="e.g. 5"
                              className="w-full px-4 py-3 rounded-lg bg-input border border-primary/10 text-foreground font-body focus:border-primary focus:outline-none transition-colors"
                            />
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
                          {items.map((cartItem) => {
                            const unitPrice = getItemPrice(
                              cartItem.item,
                              cartItem.size
                            );
                            const baseUnitPrice =
                              cartItem.size === "small" &&
                                cartItem.item.priceSmall
                                ? cartItem.item.priceSmall
                                : cartItem.size === "large" &&
                                  cartItem.item.priceLarge
                                  ? cartItem.item.priceLarge
                                  : cartItem.item.price || 0;
                            const hasDiscount =
                              Boolean(cartItem.item.offer) &&
                              isOfferActive(cartItem.item.offer) &&
                              cartItem.item.offer?.type === "percentage_off" &&
                              calculateDiscountedPrice(
                                baseUnitPrice,
                                cartItem.item.offer
                              ) !== baseUnitPrice;

                            return (
                              <p
                                key={`${cartItem.item.id}-${cartItem.size}`}
                                className="text-foreground/80"
                              >
                                {cartItem.item.name}
                                {cartItem.size !== "single" &&
                                  ` (${cartItem.size === "small" ? "S" : "L"})`}{" "}
                                ×{cartItem.quantity} —{" "}
                                {hasDiscount ? (
                                  <>
                                    <span className="text-foreground/40 line-through mr-1">
                                      ₹{baseUnitPrice * cartItem.quantity}
                                    </span>
                                    <span className="text-primary">
                                      ₹{unitPrice * cartItem.quantity}
                                    </span>
                                  </>
                                ) : (
                                  `₹${unitPrice * cartItem.quantity}`
                                )}
                              </p>
                            );
                          })}
                        </div>

                        {/* Total */}
                        <p className="text-lg font-display text-primary tracking-wider pt-2 border-t border-primary/10 mt-1">
                          Total: ₹{totalPrice}
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