"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed, Flame, Clock, Star } from "lucide-react";

// ─── Stats Data ──────────────────────────────────────────────────────────────
const stats = [
  {
    icon: UtensilsCrossed,
    label: "Menu Delights",
    value: 46,
    suffix: "+",
    display: null,
    accent: "from-amber-400 to-orange-500",
    sub: "Always fresh, always hot",
  },
  {
    icon: Flame,
    label: "Daily Orders",
    value: 120,
    suffix: "+",
    display: null,
    accent: "from-red-400 to-orange-500",
    sub: "Served with love every day",
  },
  {
    icon: Clock,
    label: "Open Daily",
    value: 0,
    suffix: "",
    display: "2–11 PM",
    accent: "from-amber-300 to-yellow-500",
    sub: "Rain or shine, we're here",
  },
  {
    icon: Star,
    label: "Avg. Rating",
    value: 0,
    suffix: "",
    display: "4.9 ★",
    accent: "from-yellow-400 to-amber-600",
    sub: "Loved by Hubballi food lovers",
  },
];

// ─── Animated Counter ─────────────────────────────────────────────────────────
const CountUp = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const steps = 50;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, 1200 / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// ─── StatsBar Component ───────────────────────────────────────────────────────
const StatsBar = () => (
  <motion.section
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    className="py-10 px-4"
    aria-label="Restaurant Highlights"
  >
    <div className="max-w-6xl mx-auto">
      {/* Section Label */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary/70">
          Why Foodieez Junction?
        </p>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </motion.div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-2xl border border-primary/10 bg-white/60 backdrop-blur-md shadow-sm
                         flex flex-col items-center justify-center gap-2 py-6 px-4 text-center cursor-default
                         transition-shadow hover:shadow-xl hover:shadow-primary/10 hover:border-primary/20"
            >
              {/* Background glow */}
              <div
                className={`absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-15 blur-2xl bg-gradient-to-br ${s.accent}`}
              />

              {/* Icon badge */}
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.accent} bg-opacity-10 flex items-center justify-center shadow-md`}>
                <Icon className="w-5 h-5 text-white drop-shadow-sm" strokeWidth={1.8} />
              </div>

              {/* Value */}
              <div className="flex flex-col items-center gap-0.5 mt-1">
                <span className="font-black text-2xl md:text-3xl text-foreground tracking-tight leading-none">
                  {s.display ? s.display : <CountUp target={s.value} suffix={s.suffix} />}
                </span>
                <span className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-primary/80 leading-tight">
                  {s.label}
                </span>
              </div>

              {/* Sub-label */}
              <p className="text-[10px] text-muted-foreground/80 leading-tight font-medium mt-0.5 hidden md:block">
                {s.sub}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  </motion.section>
);

export default StatsBar;

