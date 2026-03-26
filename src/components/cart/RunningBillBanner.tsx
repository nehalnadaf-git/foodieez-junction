"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { DineSession } from "@/hooks/usePayAtLast";

interface RunningBillBannerProps {
  session: DineSession;
  currentOrderTotal: number;
}

export function RunningBillBanner({ session, currentOrderTotal }: RunningBillBannerProps) {
  const [expanded, setExpanded] = useState(false);

  if (!session || session.orders.length === 0) return null;

  const grandTotal = session.runningTotal + currentOrderTotal;

  return (
    <div
      className="rounded-xl overflow-hidden mb-3"
      style={{ background: "#FFC200", color: "#0a0a0a" }}
    >
      {/* ── Collapsed / Header row ── */}
      <button
        className="w-full flex items-center justify-between px-4 py-3"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className="text-left">
          <p className="text-[13px] font-extrabold uppercase tracking-wide">
            Running Bill
          </p>
          <p className="text-[11px] font-semibold opacity-70 mt-0.5">
            {session.orders.length}{" "}
            {session.orders.length === 1 ? "order" : "orders"} placed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[17px] font-extrabold">Rs.{Math.round(session.runningTotal)}</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 opacity-70" />
          ) : (
            <ChevronDown className="w-4 h-4 opacity-70" />
          )}
        </div>
      </button>

      {/* ── Expanded breakdown ── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="mx-3 mb-3 rounded-xl overflow-hidden"
              style={{ background: "rgba(0,0,0,0.08)" }}
            >
              {/* Previous orders */}
              {session.orders.map((order) => (
                <div key={order.orderNumber} className="px-4 py-3 border-b border-black/10">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[12px] font-bold uppercase tracking-wide">
                      Order {order.orderNumber}
                    </span>
                    <span className="text-[12px] font-bold">Rs.{Math.round(order.orderTotal)}</span>
                  </div>
                  {order.items.map((item, idx) => (
                    <p key={idx} className="text-[11px] opacity-70 leading-relaxed">
                      {item.name}
                      {item.size === "small" ? " (S)" : item.size === "large" ? " (L)" : ""}{" "}
                      x{item.quantity}
                    </p>
                  ))}
                </div>
              ))}

              {/* Totals */}
              <div className="px-4 py-3 space-y-1">
                <div className="flex justify-between text-[12px]">
                  <span className="opacity-70">Previous Orders</span>
                  <span className="font-bold">Rs.{Math.round(session.runningTotal)}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="opacity-70">This Order</span>
                  <span className="font-bold">Rs.{Math.round(currentOrderTotal)}</span>
                </div>
                <div className="pt-1.5 border-t border-black/15 flex justify-between text-[13px] font-extrabold">
                  <span>Grand Total</span>
                  <span>Rs.{Math.round(grandTotal)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
