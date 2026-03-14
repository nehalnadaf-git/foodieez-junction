"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  XCircle,
  MoreVertical,
  Banknote,
  Smartphone
} from "lucide-react";
import { toast } from "sonner";

export default function AdminOrdersPage() {
  const orders = useQuery(api.orders.getOrders);
  const updateStatus = useMutation(api.orders.updateStatus);
  const deleteOrder = useMutation(api.orders.deleteOrder);

  const pendingOrders = orders?.filter((o) => o.status === "pending") || [];
  const preparingOrders = orders?.filter((o) => o.status === "preparing") || [];
  const completedOrders = orders?.filter((o) => o.status === "completed") || [];

  const handleUpdateStatus = async (id: any, status: string) => {
    try {
      await updateStatus({ id, status });
      toast.success(`Order marked as ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const renderOrderCard = (order: any) => (
    <div key={order._id} className="rounded-xl border border-white/10 bg-white/5 p-4 relative overflow-hidden">
      {/* Decorative top border based on status */}
      <div 
        className={`absolute top-0 left-0 right-0 h-1 ${
          order.status === "pending" ? "bg-amber-400" :
          order.status === "preparing" ? "bg-blue-400" : "bg-emerald-400"
        }`} 
      />
      
      <div className="flex justify-between items-start mt-2">
        <div>
          <h4 className="font-bold text-white font-mono text-lg">{order.orderId}</h4>
          <p className="text-white/60 text-sm">{order.customerName}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-primary font-bold">₹{order.totalAmount}</span>
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${order.paymentMethod === "cash" ? "bg-emerald-500/20 text-emerald-300" : "bg-purple-500/20 text-purple-300"}`}>
            {order.paymentMethod === "cash" ? <Banknote className="inline w-3 h-3 mr-1" /> : <Smartphone className="inline w-3 h-3 mr-1" />}
            {order.paymentMethod}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 text-xs">
        <span className="bg-white/10 px-2 py-1 rounded text-white/80">
          {order.orderType === "dine-in" ? `Dine-In (Table ${order.tableNumber})` :
           order.orderType === "qr-dine-in" ? `QR Dine-In (Table ${order.tableNumber})` :
           "Takeaway"}
        </span>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
        {order.items.map((item: any, idx: number) => (
          <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-white/5 last:border-0 hover:bg-white/5 rounded px-1 transition-colors">
            <span className="text-white/80 line-clamp-1">{item.name}</span>
            <div className="flex items-center gap-2 tabular-nums">
              <span className="text-white/40">x{item.quantity}</span>
              <span className="text-white font-medium min-w-[3rem] text-right">₹{item.price * item.quantity}</span>
            </div>
          </div>
        ))}
      </div>

      {order.specialInstructions && (
        <div className="mt-3 bg-amber-500/10 text-amber-200/80 text-xs p-2 rounded-lg border border-amber-500/20">
          <strong className="text-amber-400 block mb-0.5">Note:</strong> {order.specialInstructions}
        </div>
      )}

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
              onClick={() => handleUpdateStatus(order._id, "cancelled")}
              className="px-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </>
        )}
        {order.status === "preparing" && (
          <button 
            onClick={() => handleUpdateStatus(order._id, "completed")}
            className="flex-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Mark Ready
          </button>
        )}
        {(order.status === "completed" || order.status === "cancelled") && (
          <button 
            onClick={() => { deleteOrder({ id: order._id }); toast.success("Order archived"); }}
            className="flex-1 border border-white/10 text-white/50 hover:bg-white/5 hover:text-white py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Archive Order
          </button>
        )}
      </div>
    </div>
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="space-y-6 flex flex-col h-[calc(100vh-2rem)]" // Prevent overall scroll
    >
      <div>
        <h2 className="bg-gradient-to-r from-[#F5A623] to-[#C47B05] bg-clip-text text-3xl font-bold text-transparent">
          Live Orders
        </h2>
        <p className="mt-2 text-sm text-white/65">
          Real-time order tracking dashboard synced with WhatsApp orders.
        </p>
      </div>

      {orders === undefined ? (
        <div className="text-center text-white/50 py-10 animate-pulse">Loading live orders...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Pending Column */}
          <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-4 overflow-hidden">
            <h3 className="flex items-center gap-2 text-amber-400 font-bold mb-4 shrink-0">
              <Clock className="w-5 h-5" /> Pending ({pendingOrders.length})
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
              {pendingOrders.map(renderOrderCard)}
              {pendingOrders.length === 0 && <div className="text-white/30 text-sm text-center mt-10">No pending orders</div>}
            </div>
          </div>

          {/* Preparing Column */}
          <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-4 overflow-hidden">
            <h3 className="flex items-center gap-2 text-blue-400 font-bold mb-4 shrink-0">
              <ChefHat className="w-5 h-5" /> Preparing ({preparingOrders.length})
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
              {preparingOrders.map(renderOrderCard)}
              {preparingOrders.length === 0 && <div className="text-white/30 text-sm text-center mt-10">No active prep</div>}
            </div>
          </div>

          {/* Completed Column */}
          <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-4 overflow-hidden">
            <h3 className="flex items-center gap-2 text-emerald-400 font-bold mb-4 shrink-0">
              <CheckCircle2 className="w-5 h-5" /> Completed ({completedOrders.length})
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
              {completedOrders.map(renderOrderCard)}
              {completedOrders.length === 0 && <div className="text-white/30 text-sm text-center mt-10">No completed orders</div>}
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
}
