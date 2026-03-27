"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  ChefHat,
  XCircle,
  Banknote,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { formatOrderDateTime } from "@/utils/formatDateTime";

type OrderStatus = "pending" | "preparing" | "completed";
type TabValue = "pending-dine-in" | "pending-takeaway" | "pending-delivery" | "preparing" | "completed";

export default function AdminOrdersPage() {
  const orders = useQuery(api.orders.getOrders);
  const updateStatus = useMutation(api.orders.updateStatus);
  const deleteOrder = useMutation(api.orders.deleteOrder);
  const [mobileTab, setMobileTab] = useState<TabValue>("pending-delivery");

  const pendingOrders = orders?.filter((o) => o.status === "pending") || [];
  
  const pendingDineInOrders = pendingOrders.filter(
    (o) => o.orderType === "dine-in" || o.orderType === "qr-dine-in"
  );
  const pendingTakeawayOrders = pendingOrders.filter((o) => o.orderType === "takeaway");
  const pendingDeliveryOrders = pendingOrders.filter((o) => o.orderType === "delivery");

  const preparingOrders = orders?.filter((o) => o.status === "preparing") || [];
  const completedOrders = orders?.filter((o) => o.status === "completed") || [];

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateStatus({ id: id as any, status });
      toast.success(`Order marked as ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleArchive = (id: string) => {
    deleteOrder({ id: id as any });
    toast.success("Order archived");
  };

  const handleDelete = (id: string) => {
    deleteOrder({ id: id as any });
    toast.success("Order deleted");
  };

  const renderOrderCard = (order: any) => (
    <div
      key={order._id}
      className="rounded-xl border border-white/10 bg-white/5 p-4 relative overflow-hidden"
    >
      {/* Status accent stripe */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          order.status === "pending"
            ? "bg-amber-400"
            : order.status === "preparing"
            ? "bg-blue-400"
            : order.status === "cancelled"
            ? "bg-red-500"
            : "bg-emerald-400"
        }`}
      />

      <div className="flex justify-between items-start mt-2">
        <div>
          <h4 className="font-bold text-white font-mono text-base leading-tight">
            {order.orderId}
          </h4>
          <p className="text-white/60 text-sm">{order.customerName}</p>
          {order.serverTimestamp && (
            <p className="text-white/40 text-xs mt-0.5 font-mono">
              {formatOrderDateTime(order.serverTimestamp)}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-primary font-bold">₹{order.totalAmount}</span>
          <span
            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
              order.paymentMethod === "cash"
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-purple-500/20 text-purple-300"
            }`}
          >
            {order.paymentMethod === "cash" ? (
              <Banknote className="w-3 h-3" />
            ) : (
              <Smartphone className="w-3 h-3" />
            )}
            {order.paymentMethod}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 text-xs flex-wrap">
        <span className={`px-2 py-1 rounded text-white/80 ${order.orderType === "delivery" ? "bg-primary/20 border border-primary/30 text-primary font-bold" : "bg-white/10"}`}>
          {order.orderType === "dine-in"
            ? `Dine-In — Table ${order.tableNumber}`
            : order.orderType === "qr-dine-in"
            ? `QR Dine-In — Table ${order.tableNumber}`
            : order.orderType === "delivery"
            ? "🛵 Home Delivery"
            : "Takeaway"}
        </span>
      </div>

      {/* Delivery details */}
      {order.orderType === "delivery" && (
        <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 space-y-1 text-xs">
          {order.customerPhone && (
            <p className="text-white/70"><span className="text-primary font-bold">Phone:</span> {order.customerPhone}</p>
          )}
          {(order as any).deliveryAddress && (
            <p className="text-white/70"><span className="text-primary font-bold">Address:</span> {(order as any).deliveryAddress}</p>
          )}
          {(order as any).deliveryMapLink && (
            <p className="text-white/70 break-all"><span className="text-primary font-bold">Map:</span>{" "}
              <a href={(order as any).deliveryMapLink} target="_blank" rel="noreferrer" className="underline text-primary/80">View Location</a>
            </p>
          )}
          {(order as any).deliveryCharge !== undefined && (
            <p className="text-white/70"><span className="text-primary font-bold">Delivery Charge:</span> Rs.{(order as any).deliveryCharge}</p>
          )}
        </div>
      )}

      {/* Items */}
      <div className="mt-4 pt-4 border-t border-white/10 max-h-32 overflow-y-auto pr-1">
        {order.items.map((item: any, idx: number) => (
          <div
            key={idx}
            className="flex justify-between items-center text-sm py-1 border-b border-white/5 last:border-0 hover:bg-white/5 rounded px-1 transition-colors"
          >
            <span className="text-white/80 line-clamp-1">{item.name}</span>
            <div className="flex items-center gap-2 tabular-nums shrink-0">
              <span className="text-white/40">×{item.quantity}</span>
              <span className="text-white font-medium min-w-[3rem] text-right">
                ₹{item.price * item.quantity}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Special instructions */}
      {order.specialInstructions && (
        <div className="mt-3 bg-amber-500/10 text-amber-200/80 text-xs p-2 rounded-lg border border-amber-500/20">
          <strong className="text-amber-400 block mb-0.5">Note:</strong>{" "}
          {order.specialInstructions}
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
        {order.status === "pending" && (
          <>
            <button
              onClick={() => handleUpdateStatus(order._id, "preparing")}
              className="flex-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => handleDelete(order._id)}
              title="Cancel order"
              className="px-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </>
        )}
        {order.status === "preparing" && (
          <>
            <button
              onClick={() => handleUpdateStatus(order._id, "completed")}
              className="flex-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Mark Ready
            </button>
            <button
              onClick={() => handleDelete(order._id)}
              title="Cancel order"
              className="px-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </>
        )}
        {(order.status === "completed") && (
          <button
            onClick={() => handleArchive(order._id)}
            className="flex-1 border border-white/10 text-white/50 hover:bg-white/5 hover:text-white py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Archive
          </button>
        )}
      </div>
    </div>
  );

  const mobileTabs: { value: TabValue; label: string; count: number; activeBg: string }[] = [
    { value: "pending-delivery", label: "Delivery", count: pendingDeliveryOrders.length, activeBg: "bg-yellow-400/20 text-yellow-300 border-yellow-400/40" },
    { value: "pending-takeaway", label: "Takeaway", count: pendingTakeawayOrders.length, activeBg: "bg-orange-400/20 text-orange-300 border-orange-400/40" },
    { value: "pending-dine-in", label: "Dine-In", count: pendingDineInOrders.length, activeBg: "bg-amber-400/20 text-amber-300 border-amber-400/40" },
    { value: "preparing", label: "Prep", count: preparingOrders.length, activeBg: "bg-blue-400/20 text-blue-300 border-blue-400/40" },
    { value: "completed", label: "Done", count: completedOrders.length, activeBg: "bg-emerald-400/20 text-emerald-300 border-emerald-400/40" },
  ];

  const mobileOrdersMap: Record<TabValue, any[]> = {
    "pending-delivery": pendingDeliveryOrders,
    "pending-takeaway": pendingTakeawayOrders,
    "pending-dine-in": pendingDineInOrders,
    preparing: preparingOrders,
    completed: completedOrders,
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-4"
    >
      <div>
        <h2 className="bg-gradient-to-r from-[#F5A623] to-[#C47B05] bg-clip-text text-3xl font-bold text-transparent">
          Live Orders
        </h2>
        <p className="mt-1 text-sm text-white/65">
          Real-time order tracking dashboard synced with WhatsApp orders.
        </p>
      </div>

      {orders === undefined ? (
        <div className="text-center text-white/50 py-10 animate-pulse">
          Loading live orders…
        </div>
      ) : (
        <>
          {/* ── MOBILE: Tab bar + single scrollable column ── */}
          <div className="lg:hidden space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {mobileTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setMobileTab(tab.value)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-all duration-200 ${
                    mobileTab === tab.value
                      ? tab.activeBg
                      : "border-white/10 bg-white/5 text-white/60"
                  }`}
                >
                  {tab.label}
                  <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {mobileOrdersMap[mobileTab].length > 0 ? (
                mobileOrdersMap[mobileTab].map(renderOrderCard)
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/40 text-sm">
                  No orders in this state
                </div>
              )}
            </div>
          </div>

          {/* ── DESKTOP: 3-column Grid Kanban (2 rows) ── */}
          <div className="hidden lg:grid grid-cols-3 gap-4" style={{ height: "calc(100vh - 14rem)" }}>
            {/* Pending: Delivery */}
            <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-4 overflow-hidden">
              <h3 className="flex items-center gap-2 text-yellow-400 font-bold mb-4 shrink-0">
                <Clock className="w-5 h-5" /> Pending ({pendingDeliveryOrders.length}) — Delivery
              </h3>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {pendingDeliveryOrders.map(renderOrderCard)}
                {pendingDeliveryOrders.length === 0 && (
                  <div className="text-white/30 text-sm text-center mt-10">No pending orders</div>
                )}
              </div>
            </div>

            {/* Pending: Takeaway */}
            <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-4 overflow-hidden">
              <h3 className="flex items-center gap-2 text-orange-400 font-bold mb-4 shrink-0">
                <Clock className="w-5 h-5" /> Pending ({pendingTakeawayOrders.length}) — Takeaway
              </h3>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {pendingTakeawayOrders.map(renderOrderCard)}
                {pendingTakeawayOrders.length === 0 && (
                  <div className="text-white/30 text-sm text-center mt-10">No pending orders</div>
                )}
              </div>
            </div>

            {/* Pending: Dine-In */}
            <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-4 overflow-hidden">
              <h3 className="flex items-center gap-2 text-amber-400 font-bold mb-4 shrink-0">
                <Clock className="w-5 h-5" /> Pending ({pendingDineInOrders.length}) — Dine-In
              </h3>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {pendingDineInOrders.map(renderOrderCard)}
                {pendingDineInOrders.length === 0 && (
                  <div className="text-white/30 text-sm text-center mt-10">No pending orders</div>
                )}
              </div>
            </div>

            {/* Preparing */}
            <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-4 overflow-hidden">
              <h3 className="flex items-center gap-2 text-blue-400 font-bold mb-4 shrink-0">
                <ChefHat className="w-5 h-5" /> Preparing ({preparingOrders.length})
              </h3>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {preparingOrders.map(renderOrderCard)}
                {preparingOrders.length === 0 && (
                  <div className="text-white/30 text-sm text-center mt-10">No active prep</div>
                )}
              </div>
            </div>

            {/* Completed */}
            <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-4 overflow-hidden">
              <h3 className="flex items-center gap-2 text-emerald-400 font-bold mb-4 shrink-0">
                <CheckCircle2 className="w-5 h-5" /> Completed ({completedOrders.length})
              </h3>
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {completedOrders.map(renderOrderCard)}
                {completedOrders.length === 0 && (
                  <div className="text-white/30 text-sm text-center mt-10">No completed orders</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </motion.section>
  );
}
