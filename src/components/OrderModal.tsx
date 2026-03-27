"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { X, Check, ShoppingBag, UtensilsCrossed, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import type { CartItem } from "@/context/CartContext";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useTableNumber } from "@/hooks/useTableNumber";
import { generateOrderToken } from "@/utils/order";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "../utils/whatsapp";
import type { WhatsAppLineItem } from "../utils/whatsapp";
import { generateDeliveryMessage } from "@/utils/deliveryMessages";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatOrderDateTime } from "@/utils/formatDateTime";

type OrderType = "dine-in" | "takeaway" | "delivery" | null;
type PaymentMethod = "cash" | "upi" | null;

const OrderModal = () => {
  const { items, grandTotal, subtotal, totalSavings, clearCart } = useCart();
  const { settings } = useAppSettings();
  const { tableNumber: scannedTableNumber } = useTableNumber();

  const dineInEnabled = settings.order.dineInEnabled;
  const hasQrTable = !!scannedTableNumber;
  const isDineInUnlocked = dineInEnabled || hasQrTable;

  const delivery = settings.delivery;
  const deliveryEnabled = delivery.deliveryEnabled;
  const deliveryCharge = delivery.deliveryCharge;
  const deliveryMinimum = delivery.deliveryMinimumOrder;
  const deliveryBelowMinimum = deliveryMinimum > 0 && grandTotal < deliveryMinimum;

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

  // ── Delivery-specific state ────────────────────────────────────────────────
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryMapLink, setDeliveryMapLink] = useState("");

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
      setStep(1);
      setOrderType(hasQrTable ? "dine-in" : null);
      setName("");
      setTableNo(scannedTableNumber ?? "");
      setPayment(availablePayments[0] ?? "cash");
      setSpecialInstructions("");
      setCustomerPhone("");
      setDeliveryAddress("");
      setDeliveryMapLink("");
      setOrderId(generateOrderToken(settings.order.orderIdPrefix));
      setShowSuccess(false);
      setIsSubmitting(false);
    };
    window.addEventListener("open-order-modal", handler);
    return () => window.removeEventListener("open-order-modal", handler);
  }, [availablePayments, scannedTableNumber, settings.order.orderIdPrefix, hasQrTable]);

  const close = useCallback(() => {
    if (isSubmitting) return;
    setIsOpen(false);
  }, [isSubmitting]);

  // ── Step system: delivery adds an extra address step ─────────────────────
  // Steps: 1=type  2=details  3=payment(optional)  4=confirm
  // Delivery: 1=type  2=details  2.5=address  3=payment(optional)  4=confirm
  const isDelivery = orderType === "delivery";

  const canProceed = useCallback(() => {
    if (step === 1) return !!orderType && !(isDelivery && deliveryBelowMinimum);
    if (step === 2) {
      if (!name.trim()) return false;
      if (orderType === "dine-in" && !tableNo.trim()) return false;
      if (orderType === "delivery" && !customerPhone.trim()) return false;
      return true;
    }
    if (step === 3 && isDelivery) {
      // Address step
      return deliveryAddress.trim().length > 0 || deliveryMapLink.trim().length > 0;
    }
    if ((step === 3 && !isDelivery) || (step === 4 && isDelivery)) return !!payment;
    return true;
  }, [step, orderType, name, tableNo, payment, customerPhone, deliveryAddress, deliveryMapLink, isDelivery, deliveryBelowMinimum]);

  // Total steps: delivery has one extra (address)
  const totalSteps = isDelivery
    ? availablePayments.length === 1 ? 4 : 5
    : availablePayments.length === 1 ? 3 : 4;

  const isLastStep = step === totalSteps;

  const goNext = useCallback(() => {
    if (!canProceed()) return;
    setStep((s) => s + 1);
  }, [canProceed]);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(1, s - 1));
  }, []);

  const submitOrder = useMutation(api.orders.submit);

  // ── Order submission ───────────────────────────────────────────────────────
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

    const totalDue = isDelivery ? grandTotal + deliveryCharge : grandTotal;
    const targetNumber = isDelivery
      ? (delivery.deliveryWhatsappNumber || settings.order.takeawayWhatsappNumber)
      : orderType === "dine-in"
      ? settings.order.dineInWhatsappNumber
      : settings.order.takeawayWhatsappNumber;

    // Open blank tab before async call to avoid popup blocking
    const waTab = window.open("", "_blank");

    try {
      const result = await submitOrder({
        orderId,
        customerName: name.trim(),
        orderType: isDelivery ? "delivery" : orderType === "dine-in" && scannedTableNumber ? "qr-dine-in" : orderType,
        tableNumber: orderType === "dine-in" ? tableNo.trim() : undefined,
        paymentMethod: payment,
        specialInstructions: specialInstructions.trim() || undefined,
        items: orderItems.map((item) => ({
          name: item.name,
          itemId: item.itemId,
          size: item.size,
          quantity: item.quantity,
          price: item.finalPrice,
        })),
        totalAmount: totalDue,
        status: "pending",
        ...(isDelivery && {
          deliveryAddress: deliveryAddress.trim() || undefined,
          deliveryMapLink: deliveryMapLink.trim() || undefined,
          deliveryCharge,
          customerPhone: customerPhone.trim(),
        }),
      });

      const dateTime = formatOrderDateTime(result.serverTimestamp);
      let msgText = "";

      if (isDelivery) {
        msgText = generateDeliveryMessage({
          orderId,
          dateTime,
          items: orderItems,
          subtotal,
          totalSavings,
          itemsTotal: grandTotal,
          deliveryCharge,
          totalDue,
          customerName: name.trim(),
          customerPhone: customerPhone.trim(),
          deliveryAddress: deliveryAddress.trim(),
          deliveryMapLink: deliveryMapLink.trim(),
          paymentMethod: payment as "cash" | "upi",
          upiId: settings.upi.upiId,
          estimatedDeliveryTime: delivery.deliveryEstimatedTime,
          restaurantName: settings.restaurant.restaurantName,
          specialInstructions,
        });
      } else {
        msgText = buildWhatsAppMessage({
          orderId,
          dateTime,
          items: orderItems,
          subtotal,
          totalSavings,
          totalAmount: grandTotal,
          customerName: name.trim(),
          orderType: orderType as "dine-in" | "takeaway",
          tableNumber: orderType === "dine-in" ? tableNo.trim() : null,
          scannedTableNumber,
          paymentMethod: payment as "cash" | "upi",
          estimatedTime: settings.order.estimatedWaitTime,
          upiId: settings.upi.upiId,
          restaurantName: settings.restaurant.restaurantName,
          specialInstructions,
        });
      }

      const url = buildWhatsAppUrl(targetNumber, msgText);
      if (waTab) waTab.location.href = url;
      else window.open(url, "_blank");
    } catch {
      // Fallback using device time
      const dateTime = formatOrderDateTime(Date.now());
      let msgText = "";
      if (isDelivery) {
        msgText = generateDeliveryMessage({
          orderId, dateTime, items: orderItems, subtotal, totalSavings,
          itemsTotal: grandTotal, deliveryCharge, totalDue,
          customerName: name.trim(), customerPhone: customerPhone.trim(),
          deliveryAddress: deliveryAddress.trim(), deliveryMapLink: deliveryMapLink.trim(),
          paymentMethod: payment as "cash" | "upi", upiId: settings.upi.upiId,
          estimatedDeliveryTime: delivery.deliveryEstimatedTime,
          restaurantName: settings.restaurant.restaurantName, specialInstructions,
        });
      } else {
        msgText = buildWhatsAppMessage({
          orderId, dateTime, items: orderItems, subtotal, totalSavings,
          totalAmount: grandTotal, customerName: name.trim(),
          orderType: orderType as "dine-in" | "takeaway",
          tableNumber: orderType === "dine-in" ? tableNo.trim() : null,
          scannedTableNumber, paymentMethod: payment as "cash" | "upi",
          estimatedTime: settings.order.estimatedWaitTime, upiId: settings.upi.upiId,
          restaurantName: settings.restaurant.restaurantName, specialInstructions,
        });
      }
      const url = buildWhatsAppUrl(targetNumber, msgText);
      if (waTab) waTab.location.href = url;
      else window.open(url, "_blank");
    }

    setShowSuccess(true);
    window.setTimeout(() => {
      clearCart();
      setIsSubmitting(false);
      setIsOpen(false);
    }, 2500);
  }, [
    orderType, payment, orderId, isSubmitting, items, subtotal, totalSavings,
    grandTotal, name, tableNo, scannedTableNumber, settings, specialInstructions,
    submitOrder, clearCart, isDelivery, deliveryCharge, deliveryAddress,
    deliveryMapLink, customerPhone, delivery,
  ]);

  const stepSegments = Array.from({ length: totalSteps }, (_, i) => i + 1);

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
                    Your WhatsApp is opening — please send the message to confirm your order.
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
                        className={`flex-1 h-1 rounded-full transition-colors duration-300 ${seg <= step ? "bg-primary" : "bg-muted"}`}
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
                        {/* Takeaway */}
                        <motion.button
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0, duration: 0.22 }}
                          onClick={() => setOrderType(orderType === "takeaway" ? null : "takeaway")}
                          className={`relative p-4 text-left rounded-2xl border-2 w-full transition-all duration-200 ${orderType === "takeaway" ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_24px_rgba(16,185,129,0.15)]" : "border-white/10 bg-white/[0.04] hover:border-emerald-500/40 hover:bg-white/[0.06]"}`}
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
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 leading-none">Always Available</span>
                              </div>
                              <p className="text-[11px] text-muted-foreground font-body">Pack and carry</p>
                            </div>
                          </div>
                        </motion.button>

                        {/* Dine-In */}
                        {isDineInUnlocked ? (
                          <motion.button
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.08, duration: 0.22 }}
                            onClick={() => {
                              if (orderType === "dine-in") { setOrderType(null); } else {
                                setOrderType("dine-in");
                                if (hasQrTable) setTableNo(scannedTableNumber ?? "");
                              }
                            }}
                            className={`relative p-4 text-left rounded-2xl border-2 w-full transition-all duration-200 ${orderType === "dine-in" ? "border-primary bg-primary/10 shadow-[0_0_24px_rgba(245,166,35,0.15)]" : "border-white/10 bg-white/[0.04] hover:border-primary/40 hover:bg-white/[0.06]"}`}
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
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 leading-none">✅ Table {scannedTableNumber} Detected</span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/15 border border-primary/30 text-primary leading-none">Available</span>
                                  )}
                                </div>
                                <p className="text-[11px] text-muted-foreground font-body">Sit and eat with us</p>
                              </div>
                            </div>
                          </motion.button>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.08, duration: 0.22 }}
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
                                  <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border border-amber-500/35 text-amber-400/80 leading-none">📍 Location Only</motion.span>
                                </div>
                                <p className="text-[11px] text-white/30 font-body">Scan the QR at your table to unlock</p>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* Home Delivery */}
                        {deliveryEnabled && (
                          <motion.button
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.16, duration: 0.22 }}
                            onClick={() => !deliveryBelowMinimum && setOrderType(orderType === "delivery" ? null : "delivery")}
                            disabled={deliveryBelowMinimum}
                            className={`relative p-4 text-left rounded-2xl border-2 w-full transition-all duration-200 ${
                              deliveryBelowMinimum
                                ? "border-white/10 bg-white/[0.02] opacity-50 cursor-not-allowed"
                                : orderType === "delivery"
                                ? "border-primary bg-primary/10 shadow-[0_0_24px_rgba(245,166,35,0.15)]"
                                : "border-white/10 bg-white/[0.04] hover:border-primary/40 hover:bg-white/[0.06]"
                            }`}
                          >
                            {orderType === "delivery" && (
                              <div className="absolute top-3.5 right-3.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-scale-in">
                                <Check className="w-3 h-3 text-black stroke-[3.5px]" />
                              </div>
                            )}
                            <div className="flex items-start gap-3.5">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${orderType === "delivery" ? "bg-primary/20" : "bg-white/[0.08]"}`}>
                                <Truck className={`w-[18px] h-[18px] transition-colors ${orderType === "delivery" ? "text-primary" : "text-white/50"}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                  <span className="font-display font-bold text-sm text-foreground">Home Delivery</span>
                                  {deliveryBelowMinimum ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-500/15 border border-red-500/30 text-red-400 leading-none">
                                      Add Rs.{deliveryMinimum - grandTotal} more
                                    </span>
                                  ) : deliveryCharge === 0 ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 leading-none">Free Delivery</span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/15 border border-primary/30 text-primary leading-none">+ Rs.{deliveryCharge} charge</span>
                                  )}
                                </div>
                                <p className="text-[11px] text-muted-foreground font-body">Get it delivered to your door</p>
                                {deliveryMinimum > 0 && (
                                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">Min. order Rs.{deliveryMinimum}</p>
                                )}
                                {delivery.deliveryAreaDescription && (
                                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">{delivery.deliveryAreaDescription}</p>
                                )}
                              </div>
                            </div>
                          </motion.button>
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
                          <label className="text-xs font-heading font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Name *</label>
                          <input
                            value={name}
                            onChange={(e) => setName(e.target.value.slice(0, 50))}
                            placeholder="Your name"
                            autoFocus
                            className="w-full px-4 py-3 rounded-lg bg-input border border-primary/10 text-foreground font-body focus:border-primary focus:outline-none transition-colors"
                          />
                        </div>
                        {orderType === "dine-in" && (
                          <div>
                            <label className="text-xs font-heading font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Table Number *</label>
                            <input
                              value={tableNo}
                              onChange={(e) => !hasQrTable && setTableNo(e.target.value)}
                              readOnly={hasQrTable}
                              placeholder="e.g. 5"
                              className={`w-full px-4 py-3 rounded-lg bg-input border border-primary/10 text-foreground font-body focus:outline-none transition-colors ${hasQrTable ? "cursor-default opacity-75" : "focus:border-primary"}`}
                            />
                            {hasQrTable && <p className="text-[11px] text-emerald-400 mt-1.5">✅ Auto-filled from QR scan</p>}
                          </div>
                        )}
                        {isDelivery && (
                          <div>
                            <label className="text-xs font-heading font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Phone Number * <span className="normal-case font-normal">(WhatsApp)</span></label>
                            <input
                              type="tel"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value.slice(0, 15))}
                              placeholder="Your WhatsApp number"
                              className="w-full px-4 py-3 rounded-lg bg-input border border-primary/10 text-foreground font-body focus:border-primary focus:outline-none transition-colors"
                            />
                          </div>
                        )}
                        <div>
                          <label className="text-xs font-heading font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Special Requests <span className="normal-case font-normal">(optional)</span></label>
                          <textarea
                            value={specialInstructions}
                            onChange={(e) => setSpecialInstructions(e.target.value.slice(0, 200))}
                            placeholder="Optional"
                            rows={3}
                            className="w-full px-4 py-3 rounded-lg bg-input border border-primary/10 text-foreground font-body focus:border-primary focus:outline-none transition-colors resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Step 3 (Delivery only): Delivery Address ── */}
                  {step === 3 && isDelivery && (
                    <div>
                      <h3 className="text-2xl font-display text-foreground tracking-wider mb-2">
                        Delivery Address 📍
                      </h3>
                      <p className="text-xs text-muted-foreground mb-5 font-body">
                        Fill in your address, paste a Google Maps link, or both.
                      </p>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-heading font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Delivery Address</label>
                          <textarea
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value.slice(0, 300))}
                            placeholder={"House No, Street\nArea, Landmark\nHubballi"}
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg bg-input border border-primary/10 text-foreground font-body focus:border-primary focus:outline-none transition-colors resize-none"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-px bg-white/10" />
                          <span className="text-xs text-muted-foreground">or</span>
                          <div className="flex-1 h-px bg-white/10" />
                        </div>
                        <div>
                          <label className="text-xs font-heading font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Google Maps Link</label>
                          <input
                            type="url"
                            value={deliveryMapLink}
                            onChange={(e) => setDeliveryMapLink(e.target.value)}
                            placeholder="Paste your Google Maps share link here"
                            className="w-full px-4 py-3 rounded-lg bg-input border border-primary/10 text-foreground font-body focus:border-primary focus:outline-none transition-colors"
                          />
                          <p className="text-[11px] text-muted-foreground mt-1.5">
                            Google Maps → Share → Copy Link → Paste here
                          </p>
                        </div>
                        {delivery.deliveryInstructions && (
                          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                            <p className="text-xs text-primary/80">{delivery.deliveryInstructions}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Payment Step ── */}
                  {((step === 3 && !isDelivery) || (step === 4 && isDelivery)) && availablePayments.length > 1 && (
                    <div>
                      <h3 className="text-2xl font-display text-foreground tracking-wider mb-6">Payment Method 💳</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {(["cash", "upi"] as const).map((method) => {
                          const isAvailable = availablePayments.includes(method);
                          return (
                            <button
                              key={method}
                              onClick={() => isAvailable && setPayment(method)}
                              disabled={!isAvailable}
                              className={`relative glass p-6 text-center transition-all rounded-xl ${payment === method ? "border-2 border-primary bg-primary/10 shadow-[0_0_20px_rgba(245,166,35,0.2)]" : "hover:border-primary/30"} disabled:opacity-40 disabled:cursor-not-allowed`}
                            >
                              {payment === method && (
                                <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-scale-in">
                                  <Check className="w-3.5 h-3.5 text-primary-foreground stroke-[3px]" />
                                </div>
                              )}
                              <span className="text-3xl block mb-2">{method === "cash" ? "💵" : "📲"}</span>
                              <span className="font-heading font-bold text-sm text-foreground uppercase">
                                {method === "cash" ? (isDelivery ? "Cash on Delivery" : "Cash") : "UPI"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── Confirm Step ── */}
                  {step === totalSteps && (
                    <div>
                      <h3 className="text-2xl font-display text-foreground tracking-wider mb-4">Confirm Order ✅</h3>
                      <div className="glass p-4 space-y-1.5 mb-4 text-sm font-body rounded-xl">
                        <div className="space-y-1 pb-2">
                          <p><span className="text-muted-foreground">Order ID:</span>{" "}<span className="font-mono text-primary">{orderId}</span></p>
                          <p><span className="text-muted-foreground">Type:</span>{" "}{isDelivery ? "Home Delivery" : orderType === "dine-in" ? `Dine-In${scannedTableNumber ? " (QR)" : ""}` : "Takeaway"}</p>
                          <p><span className="text-muted-foreground">Name:</span>{" "}{name}</p>
                          {isDelivery && <p><span className="text-muted-foreground">Phone:</span>{" "}{customerPhone}</p>}
                          {isDelivery && deliveryAddress && <p><span className="text-muted-foreground">Address:</span>{" "}{deliveryAddress}</p>}
                          {orderType === "dine-in" && <p><span className="text-muted-foreground">Table:</span>{" "}{tableNo}</p>}
                          <p><span className="text-muted-foreground">Payment:</span>{" "}{payment === "cash" ? (isDelivery ? "💵 Cash on Delivery" : "💵 Cash") : "📲 UPI"}</p>
                        </div>
                        <div className="border-t border-primary/10 pt-2 mt-1 max-h-36 overflow-y-auto space-y-0.5 pr-1">
                          {items.map((ci: CartItem) => (
                            <p key={ci.id} className="text-foreground/80">
                              {ci.name}{ci.size !== "single" && ` (${ci.size === "small" ? "S" : "L"})`} ×{ci.quantity} —{" "}
                              <span className="text-primary">Rs.{ci.itemTotal}</span>
                            </p>
                          ))}
                        </div>
                        <div className="border-t border-primary/10 pt-2 mt-1 space-y-1">
                          {isDelivery && (
                            <>
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Items Total</span><span>Rs.{grandTotal}</span>
                              </div>
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>{deliveryCharge === 0 ? "Free Delivery" : "Delivery Charge"}</span>
                                <span>{deliveryCharge === 0 ? "Free" : `Rs.${deliveryCharge}`}</span>
                              </div>
                              <div className="flex justify-between text-lg font-display text-primary tracking-wider border-t border-primary/10 pt-1">
                                <span>Total Due</span><span>Rs.{grandTotal + deliveryCharge}</span>
                              </div>
                            </>
                          )}
                          {!isDelivery && (
                            <p className="text-lg font-display text-primary tracking-wider">Total: Rs.{grandTotal}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center font-body">
                        Clicking &quot;Place Order&quot; will open WhatsApp with your order. Please tap <strong>Send</strong> there to confirm.
                      </p>
                    </div>
                  )}

                  {/* ── Navigation ── */}
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