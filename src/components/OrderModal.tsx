"use client";

import { useEffect, useMemo, useState } from "react";
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

  const availablePayments = useMemo<PaymentMethod[]>(() => {
    const methods: PaymentMethod[] = [];
    if (settings.upi.enableCash) {
      methods.push("cash");
    }
    if (settings.upi.enableUpi) {
      methods.push("upi");
    }

    if (methods.length === 0) {
      methods.push("cash");
    }

    return methods;
  }, [settings.upi.enableCash, settings.upi.enableUpi]);

  useEffect(() => {
    const handler = () => {
      setIsOpen(true);
      setStep(1);
      setOrderType(scannedTableNumber ? "dine-in" : null);
      setName("");
      setTableNo(scannedTableNumber ?? "");
      setPayment(availablePayments[0] ?? "cash");
      setSpecialInstructions("");
      setOrderId(generateOrderToken(settings.order.orderIdPrefix));
      setShowSuccess(false);
    };

    window.addEventListener("open-order-modal", handler);
    return () => window.removeEventListener("open-order-modal", handler);
  }, [availablePayments, scannedTableNumber, settings.order.orderIdPrefix]);

  const close = () => setIsOpen(false);

  const canProceed = () => {
    if (step === 1) {
      return !!orderType;
    }

    if (step === 2) {
      return name.trim().length > 0 && (orderType !== "dine-in" || tableNo.trim().length > 0);
    }

    if (step === 3) {
      return !!payment;
    }

    return true;
  };

  const submitOrder = useMutation(api.orders.submit);

  const sendOrder = async () => {
    if (!orderType || !payment || !orderId) {
      return;
    }

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

    try {
      await submitOrder({
        orderId,
        customerName: name.trim(),
        orderType: orderType === "dine-in" && scannedTableNumber ? "qr-dine-in" : orderType,
        tableNumber: orderType === "dine-in" ? tableNo.trim() : undefined,
        paymentMethod: payment,
        specialInstructions: specialInstructions.trim() || undefined,
        items: orderItems.map(item => ({
          name: item.name,
          itemId: item.itemId,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: totalPrice,
        status: "pending",
      });
    } catch (e) {
      console.error("Failed to save order to database:", e);
      // We still proceed so customer can order via WhatsApp!
    }

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
      specialInstructions,
    });

    const targetNumber =
      orderType === "dine-in"
        ? settings.order.dineInWhatsappNumber
        : settings.order.takeawayWhatsappNumber;

    window.open(buildWhatsAppUrl(targetNumber, message), "_blank");
    setShowSuccess(true);
    window.setTimeout(() => {
      clearCart();
    }, 2000);
  };

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
            onClick={(event) => event.stopPropagation()}
            className="glass-strong w-full max-w-md p-6 relative rounded-2xl"
          >
            <button
              onClick={close}
              className="absolute top-4 right-4 p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {showSuccess ? (
              <div className="py-12 flex flex-col items-center gap-4 text-center">
                <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center animate-scale-in">
                  <Check className="w-10 h-10 text-success" />
                </div>
                <h3 className="text-2xl font-display text-foreground tracking-wider">
                  Order Sent! 🎉
                </h3>
                <p className="text-sm font-mono text-primary">{orderId}</p>
                <p className="text-sm text-muted-foreground font-body">
                  We&apos;ll prepare your order shortly.
                </p>
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-6">
                  {[1, 2, 3, 4].map((currentStep) => (
                    <div
                      key={currentStep}
                      className={`flex-1 h-1 rounded-full transition-colors ${currentStep <= step ? "bg-primary" : "bg-muted"}`}
                    />
                  ))}
                </div>

                {step === 1 && (
                  <div>
                    <h3 className="text-2xl font-display text-foreground tracking-wider mb-6">
                      How would you like it? 🍽️
                    </h3>
                    {scannedTableNumber && (
                      <p className="text-xs text-primary font-heading mb-4">
                        QR table detected: Table {scannedTableNumber}. You can still switch to takeaway.
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      {(["dine-in", "takeaway"] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setOrderType(type)}
                          className={`glass p-6 text-center transition-all rounded-xl ${orderType === type ? "border-primary/50" : "hover:border-primary/30"}`}
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
                          onChange={(event) => setName(event.target.value.slice(0, 50))}
                          placeholder="Your name"
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
                            onChange={(event) => setTableNo(event.target.value)}
                            placeholder="Table number"
                            className="w-full px-4 py-3 rounded-lg bg-input border border-primary/10 text-foreground font-body focus:border-primary focus:outline-none transition-colors"
                          />
                        </div>
                      )}
                      <div>
                        <label className="text-xs font-heading font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                          Any special requests? (e.g., less spicy, no onions)
                        </label>
                        <textarea
                          value={specialInstructions}
                          onChange={(event) =>
                            setSpecialInstructions(event.target.value.slice(0, 200))
                          }
                          placeholder="Optional"
                          className="w-full min-h-24 px-4 py-3 rounded-lg bg-input border border-primary/10 text-foreground font-body focus:border-primary focus:outline-none transition-colors resize-none"
                        />
                        <p className="text-xs text-muted-foreground mt-1 text-right">
                          {specialInstructions.length}/200
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <h3 className="text-2xl font-display text-foreground tracking-wider mb-6">
                      Payment Method 💳
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {(["cash", "upi"] as const).map((method) => {
                        const isDisabled = !availablePayments.includes(method);

                        return (
                          <button
                            key={method}
                            onClick={() => setPayment(method)}
                            disabled={isDisabled}
                            className={`glass p-6 text-center transition-all rounded-xl ${payment === method ? "border-primary/50" : "hover:border-primary/30"} disabled:opacity-40 disabled:cursor-not-allowed`}
                          >
                            <span className="text-3xl block mb-2">
                              {method === "cash" ? "💵" : "📲"}
                            </span>
                            <span className="font-heading font-bold text-sm text-foreground uppercase">
                              {method === "cash" ? "Cash" : "UPI"}
                            </span>
                            <p className="text-xs text-muted-foreground mt-1">
                              {method === "cash" ? "Pay at counter" : "Pay digitally"}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div>
                    <h3 className="text-2xl font-display text-foreground tracking-wider mb-4">
                      Confirm Order ✅
                    </h3>
                    <div className="glass p-4 space-y-2 mb-4 text-sm font-body rounded-xl">
                      <p>
                        <span className="text-muted-foreground">Order ID:</span>{" "}
                        <span className="font-mono text-primary">{orderId}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Type:</span>{" "}
                        {orderType === "dine-in"
                          ? `Dine-In${scannedTableNumber ? " (QR)" : ""}`
                          : scannedTableNumber
                            ? `Takeaway (Scanned at Table ${scannedTableNumber})`
                            : "Takeaway"}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Name:</span> {name}
                      </p>
                      {orderType === "dine-in" && (
                        <p>
                          <span className="text-muted-foreground">Table:</span> {tableNo}
                        </p>
                      )}
                      <p>
                        <span className="text-muted-foreground">Payment:</span>{" "}
                        {payment === "cash" ? "Cash" : "UPI"}
                      </p>
                      {specialInstructions.trim().length > 0 && (
                        <p>
                          <span className="text-muted-foreground">Special:</span>{" "}
                          {specialInstructions}
                        </p>
                      )}
                      <div className="border-t border-primary/10 pt-2 mt-2">
                        {items.map((cartItem) => {
                          const unitPrice = getItemPrice(cartItem.item, cartItem.size);
                          const baseUnitPrice =
                            cartItem.size === "small" && cartItem.item.priceSmall
                              ? cartItem.item.priceSmall
                              : cartItem.size === "large" && cartItem.item.priceLarge
                                ? cartItem.item.priceLarge
                                : cartItem.item.price || 0;
                          const hasDiscountOffer =
                            Boolean(cartItem.item.offer) &&
                            isOfferActive(cartItem.item.offer) &&
                            (cartItem.item.offer?.type === "percentage_off" ||
                              cartItem.item.offer?.type === "flat_discount") &&
                            calculateDiscountedPrice(baseUnitPrice, cartItem.item.offer) !== baseUnitPrice;

                          return (
                            <p
                              key={`${cartItem.item.id}-${cartItem.size}`}
                              className="text-foreground/80"
                            >
                              {cartItem.item.name}{" "}
                              {cartItem.size !== "single" &&
                                `(${cartItem.size === "small" ? "S" : "L"})`}{" "}
                              x{cartItem.quantity} - {hasDiscountOffer ? (
                                <>
                                  <span className="text-foreground/45 line-through mr-1">
                                    ₹{baseUnitPrice * cartItem.quantity}
                                  </span>
                                  <span>₹{unitPrice * cartItem.quantity}</span>
                                </>
                              ) : (
                                `₹${unitPrice * cartItem.quantity}`
                              )}
                            </p>
                          );
                        })}
                      </div>
                      <p className="text-lg font-display text-primary tracking-wider pt-2">
                        Total: ₹{totalPrice}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  {step > 1 && (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="flex-1 py-3 rounded-full border border-foreground/20 text-foreground font-heading font-bold text-sm hover:border-primary transition-colors"
                    >
                      Back
                    </button>
                  )}
                  {step < 4 ? (
                    <button
                      onClick={() => canProceed() && setStep(step + 1)}
                      disabled={!canProceed()}
                      className="flex-1 py-3 rounded-full bg-primary text-primary-foreground font-heading font-bold text-sm shimmer disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/30 transition-all"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      onClick={sendOrder}
                      className="flex-1 py-3 rounded-full bg-primary text-primary-foreground font-heading font-bold text-sm shimmer hover:shadow-lg hover:shadow-primary/30 transition-all"
                    >
                      Send via WhatsApp 💬
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OrderModal;