"use client";

import { motion } from "framer-motion";

/* ─── Premium Custom SVG Icons ───────────────────────────────────────────── */
const FlameIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="flame-grad" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F5A623" />
        <stop offset="100%" stopColor="#C47B05" />
      </linearGradient>
    </defs>
    <path
      d="M12 2C12 2 7 8 7 13a5 5 0 0010 0c0-2.5-1.5-4.5-2-5.5C14.5 9 14 11 12 12c0 0 1-3-0.5-5C11 6 12 2 12 2z"
      fill="url(#flame-grad)"
      opacity="0.9"
    />
    <path
      d="M12 14c0 1.1-.9 2-2 2s-2-.9-2-2c0-1.5 2-3.5 2-3.5S12 12.5 12 14z"
      fill="white"
      opacity="0.3"
    />
  </svg>
);

const LeafIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="leaf-grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F5A623" />
        <stop offset="100%" stopColor="#C47B05" />
      </linearGradient>
    </defs>
    <path
      d="M21 3C21 3 11 3 7 9c-2 3-2 7 0 10"
      stroke="url(#leaf-grad)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M3 21c1-4 4-8 9-11"
      stroke="url(#leaf-grad)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M7 9c3 0 8 2 10 8"
      stroke="url(#leaf-grad)"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
);

const ShieldIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="shield-grad" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F5A623" />
        <stop offset="100%" stopColor="#C47B05" />
      </linearGradient>
    </defs>
    <path
      d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V6l-9-4z"
      fill="url(#shield-grad)"
      opacity="0.18"
    />
    <path
      d="M12 2L3 6v6c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V6l-9-4z"
      stroke="url(#shield-grad)"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M9 12l2 2 4-4"
      stroke="url(#shield-grad)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ─── Feature Data ────────────────────────────────────────────────────────── */
const features = [
  {
    Icon: FlameIcon,
    num: "01",
    title: "Always Fresh",
    desc: "Cooked fresh on every single order — no reheating, no shortcuts. You taste the difference the moment it hits your plate.",
    tag: "Zero Reheating",
  },
  {
    Icon: LeafIcon,
    num: "02",
    title: "Authentic Spice",
    desc: "Real street-style flavors, bold and honest. The true taste of Hubballi, served hot with every order crafted from scratch.",
    tag: "True Street Flavor",
  },
  {
    Icon: ShieldIcon,
    num: "03",
    title: "Hygienic Kitchen",
    desc: "Clean cooking, certified ingredients, handled with care from station to plate. Your health comes first, always.",
    tag: "Food Safety First",
  },
];

/* ─── Component ───────────────────────────────────────────────────────────── */
const WhyChooseUs = () => (
  <section className="py-16 md:py-28 relative overflow-hidden">
    {/* Background glow */}
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                    w-[800px] h-[400px] rounded-full blur-[160px] opacity-40"
        style={{
          background:
            "radial-gradient(ellipse, hsl(var(--primary)/0.10) 0%, transparent 70%)",
        }}
      />
    </div>

    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

      {/* ── Section Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-16 md:mb-20"
      >
        <div className="section-label mb-6 mx-auto w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Our Promise
        </div>

        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-5 tracking-tight">
          Why Foodieez{" "}
          <span className="text-gradient italic pr-2">Junction?</span>
        </h2>

        <p className="font-body text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed">
          Three pillars that make every visit worth coming back for —{" "}
          <span className="text-primary/80 font-semibold">every single time.</span>
        </p>
      </motion.div>

      {/* ── Feature Cards ── */}
      <div className="grid md:grid-cols-3 gap-5 md:gap-6">
        {features.map((f, i) => {
          const { Icon } = f;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6 }}
              className="group relative rounded-3xl overflow-hidden cursor-default"
              style={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border)/0.8)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                transition: "box-shadow 0.3s ease, border-color 0.3s ease",
              }}
            >
              {/* Hover gradient fill */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background:
                    "radial-gradient(ellipse at top left, hsl(var(--primary)/0.06) 0%, transparent 65%)",
                }}
              />

              <div className="relative z-10 p-8 flex flex-col gap-6">

                {/* Top row: number + icon */}
                <div className="flex items-start justify-between">
                  <span
                    className="font-display text-6xl font-bold leading-none select-none"
                    style={{ color: "hsl(var(--primary)/0.10)" }}
                  >
                    {f.num}
                  </span>

                  {/* Premium icon badge */}
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--primary)/0.15) 0%, hsl(var(--primary)/0.04) 100%)",
                      border: "1px solid hsl(var(--primary)/0.18)",
                      boxShadow: "0 4px 16px hsl(var(--primary)/0.10)",
                    }}
                  >
                    {/* Inner glow ring on hover */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        boxShadow: "inset 0 0 12px hsl(var(--primary)/0.15)",
                      }}
                    />
                    <Icon />
                  </motion.div>
                </div>

                {/* Tag pill */}
                <div className="w-fit">
                  <span
                    className="font-accent text-[10px] font-bold uppercase tracking-[0.16em] px-3 py-1 rounded-full"
                    style={{
                      background: "hsl(var(--primary)/0.08)",
                      color: "hsl(var(--primary))",
                      border: "1px solid hsl(var(--primary)/0.15)",
                    }}
                  >
                    {f.tag}
                  </span>
                </div>

                {/* Title & description */}
                <div className="flex flex-col gap-3">
                  <h3
                    className="font-display text-2xl md:text-[26px] font-bold leading-tight text-foreground
                               group-hover:text-primary transition-colors duration-300"
                  >
                    {f.title}
                  </h3>
                  <p className="font-body text-sm md:text-[15px] text-muted-foreground leading-[1.85]">
                    {f.desc}
                  </p>
                </div>

                {/* Animated bottom line */}
                <div
                  className="h-px w-0 group-hover:w-full transition-all duration-500 ease-out"
                  style={{
                    background:
                      "linear-gradient(90deg, hsl(var(--primary)/0.60), hsl(var(--primary)/0.10))",
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  </section>
);

export default WhyChooseUs;

