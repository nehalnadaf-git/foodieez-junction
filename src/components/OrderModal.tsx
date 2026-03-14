"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { X, Check } from "lucide-react";
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
      setStep(1);
      setOrderType(scannedTableNumber ? "dine-in" : null);
      setName("");
      setTableNo(scannedTableNumber ?? "");
      setPayment(availablePayments[0] ?? "cash");
      setSpecialInstructions("");
      setOrderId(generateOrderToken(settings.order.orderIdPrefix));
      setShowSuccess(false);
      setIsSubmitting(false); // ← always clear submitting lock on open
    };

    window.addEventListener("open-order-modal", handler);
    return () => window.removeEventListener("open-order-modal", handler);
  }, [availablePayments, scannedTableNumber, settings.order.orderIdPrefix]);

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
    // If we're on step 4 and skipped step 3, go back to step 2
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
                        className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
                          seg <= visualStep ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>

                  {/* ── Step 1: Order Type ── */}
                  {step === 1 && (
                    <div>
                      <h3 className="text-2xl font-display text-foreground tracking-wider mb-6">
                        How would you like it? 🍽️
                      </h3>
                      {scannedTableNumber && (
                        <p className="text-xs text-primary font-heading mb-4">
                          QR table detected: Table {scannedTableNumber}. You
                          can still switch to takeaway.
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        {(["dine-in", "takeaway"] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => {
                              setOrderType(type);
                              // Auto-fill table number when switching to dine-in with a QR scan
                              if (type === "dine-in" && scannedTableNumber) {
                                setTableNo(scannedTableNumber);
                              }
                            }}
                            className={`glass p-6 text-center transition-all rounded-xl ${
                              orderType === type
                                ? "border-primary/60 bg-primary/10"
                                : "hover:border-primary/30"
                            }`}
                          >
                            <span className="text-3xl block mb-2">
                              {type === "dine-in" ? "🪑" : "📦"}
                            </span>
                            <span className="font-heading font-bold text-sm text-foreground uppercase">
                              {type === "dine-in" ? "Dine-In" : "Takeaway"}
                            </span>
                          </button>
                        ))}
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
                              className={`glass p-6 text-center transition-all rounded-xl ${
                                payment === method
                                  ? "border-primary/60 bg-primary/10"
                                  : "hover:border-primary/30"
                              } disabled:opacity-40 disabled:cursor-not-allowed`}
                            >
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
                              (cartItem.item.offer?.type ===
                                "percentage_off" ||
                                cartItem.item.offer?.type ===
                                  "flat_discount") &&
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