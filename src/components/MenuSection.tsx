"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";
import { type MenuItem } from "@/data/menuData";
import { useMenuCatalog } from "@/hooks/useMenuCatalog";
import { UtensilsCrossed } from "lucide-react";
import { OfferBadge } from "@/components/menu/OfferBadge";
import { calculateDiscountedPrice, isOfferActive } from "@/utils/offer";

/* ─────────────────── Menu Item Card ─────────────────── */
const MenuItemCard = ({ item, index }: { item: MenuItem; index: number }) => {
  const { addItem } = useCart();
  const hasSize = !!(item.priceSmall && item.priceLarge);
  const [selectedSize, setSelectedSize] = useState<"small" | "large">("small");
  const [imageError, setImageError] = useState(false);

  const basePrice = hasSize
    ? selectedSize === "small"
      ? item.priceSmall ?? 0
      : item.priceLarge ?? 0
    : item.price ?? 0;
  const hasDiscountOffer =
    Boolean(item.offer) &&
    isOfferActive(item.offer) &&
    (item.offer?.type === "percentage_off" || item.offer?.type === "flat_discount");
  const discountedPrice = hasDiscountOffer ? calculateDiscountedPrice(basePrice, item.offer) : basePrice;
  const hasImage = Boolean(item.image && item.image.trim().length > 0 && !imageError);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ delay: (index % 6) * 0.055, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex flex-col h-full pt-[55px] lg:pt-[78px]"
      style={{ overflow: "visible" }}
    >
      {/* ── Food image (next/image) ── */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none select-none"
        style={{ top: -10 }}
      >
        {hasImage && item.image ? (
          <Image
            src={item.image}
            alt={`${item.name} — Foodieez Junction Hubballi`}
            width={180}
            height={180}
            className="!w-[130px] !h-[130px] max-w-none lg:!w-[160px] lg:!h-[160px] object-contain"
            style={{
              filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.35))",
              transform: item.imageScale ? `scale(${item.imageScale})` : undefined,
            }}
            loading="lazy"
            draggable={false}
            unoptimized
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="!w-[130px] !h-[130px] lg:!w-[160px] lg:!h-[160px] rounded-3xl border border-primary/25 bg-[linear-gradient(135deg,rgba(245,166,35,0.2),rgba(255,255,255,0.08))] shadow-[0_10px_30px_rgba(0,0,0,0.25)] flex items-center justify-center">
            <UtensilsCrossed className="h-10 w-10 text-primary" />
          </div>
        )}
      </div>

      {/* ── Glass card ── */}
      <div
        className="relative flex flex-col flex-1 h-full min-h-[245px] lg:min-h-[260px]"
        style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: 22,
          boxShadow: "0 8px 24px rgba(0,0,0,0.20)",
          overflow: "visible",
        }}
      >
        <OfferBadge offer={item.offer} />
        <div className="flex flex-col flex-1 p-[14px] pt-[70px] lg:pt-[88px] lg:pb-[18px]">

          {/* Item name + veg/nonveg dot */}
          <div className="flex items-start gap-1.5 mb-2">
            <h4
              style={{
                color: "#FFFFFF",
                fontSize: 14,
                fontWeight: 700,
                lineHeight: 1.3,
                flex: 1,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {item.name}
            </h4>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                flexShrink: 0,
                marginTop: 4,
                background: item.isVeg ? "#22C55E" : "#EF4444",
              }}
            />
          </div>

          {/* Price / Size pills */}
          <div className="mb-2.5">
            {hasSize ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(["small", "large"] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      fontSize: 11,
                      fontWeight: selectedSize === size ? 700 : 400,
                      borderRadius: 20,
                      padding: "4px 10px",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      border: "none",
                      ...(selectedSize === size
                        ? { background: "#F5A623", color: "#FFFFFF" }
                        : {
                            background: "rgba(255,255,255,0.15)",
                            border: "1px solid rgba(255,255,255,0.30)",
                            color: "rgba(255,255,255,0.85)",
                          }),
                    }}
                  >
                    {size === "small" ? `S ₹${item.priceSmall}` : `L ₹${item.priceLarge}`}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ margin: 0 }}>
                {hasDiscountOffer ? (
                  <p style={{ color: "#FFFFFF", fontSize: 15, fontWeight: 700, margin: 0 }}>
                    <span style={{ color: "rgba(255,255,255,0.55)", textDecoration: "line-through", marginRight: 6 }}>
                      ₹{basePrice}
                    </span>
                    <span style={{ color: "hsl(var(--primary))" }}>₹{discountedPrice}</span>
                  </p>
                ) : (
                  <p style={{ color: "#FFFFFF", fontSize: 15, fontWeight: 700, margin: 0 }}>
                    ₹{basePrice}
                  </p>
                )}
              </div>
            )}
            {hasSize && (
              <p style={{ color: "#FFFFFF", fontSize: 15, fontWeight: 700, marginTop: 8, marginBottom: 0 }}>
                {hasDiscountOffer ? (
                  <>
                    <span style={{ color: "rgba(255,255,255,0.55)", textDecoration: "line-through", marginRight: 6 }}>
                      ₹{basePrice}
                    </span>
                    <span style={{ color: "hsl(var(--primary))" }}>₹{discountedPrice}</span>
                  </>
                ) : (
                  `₹${basePrice}`
                )}
              </p>
            )}
          </div>

          {/* Add To Cart — always pinned to bottom */}
          <div style={{ marginTop: "auto" }}>
            <button
              onClick={() => addItem(item, hasSize ? selectedSize : "single")}
              disabled={item.available === false}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.30)",
                borderRadius: 12,
                padding: "9px 12px",
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s ease, transform 0.15s ease",
                opacity: item.available === false ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.28)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = "scale(0.97)";
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.28)";
                e.currentTarget.style.transform = "scale(0.97)";
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {item.available === false ? "Unavailable" : "Add To Cart"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ─────────────────── Menu Section ─────────────────── */
const MenuSection = () => {
  const { categories, menuItems } = useMenuCatalog();
  const [activeCategory, setActiveCategory] = useState("");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [activeCategory, categories]);

  useEffect(() => {
    if (categories.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting)
            setActiveCategory(entry.target.id.replace("cat-", ""));
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [categories]);

  return (
    <section id="menu" className="relative" style={{ padding: "80px 0", overflow: "visible" }}>

      {/* ── Warm blurred bokeh background ── */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-10%",
            background: `
              radial-gradient(ellipse at 30% 40%, rgba(230,100,30,0.82), transparent 55%),
              radial-gradient(ellipse at 75% 65%, rgba(180,60,20,0.68), transparent 50%),
              radial-gradient(ellipse at 60% 20%, rgba(210,140,30,0.58), transparent 45%),
              #8B3A10
            `,
          }}
        />
      </div>

      <div
        className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-10 relative"
        style={{ zIndex: 1 }}
      >
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div
            className="flex items-center justify-center gap-2 mx-auto w-fit mb-5 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
            style={{
              color: "rgba(255,255,255,0.75)",
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            Fresh &amp; Delicious
          </div>
          <h2
            className="font-display text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight"
            style={{ color: "#fff" }}
          >
            Our Full <span className="text-gradient italic">Menu</span>
          </h2>
        </motion.div>

        {/* Sticky category filter bar */}
        <div className="sticky top-[60px] md:top-[68px] z-30 py-3">
          <div
            className="mx-auto w-fit max-w-full rounded-2xl px-2.5 py-2 flex gap-1.5 overflow-x-auto scrollbar-hide"
            style={{
              backgroundColor: "rgba(80,30,10,0.78)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.15)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  document
                    .getElementById(`cat-${cat.id}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="whitespace-nowrap px-4 py-2 md:px-5 md:py-2.5 rounded-xl text-[11px] md:text-[12px] font-heading font-bold transition-all duration-200 shrink-0"
                style={
                  activeCategory === cat.id
                    ? {
                        background: "hsl(var(--primary))",
                        color: "#fff",
                        boxShadow: "0 2px 12px hsl(var(--primary)/0.4)",
                      }
                    : { color: "rgba(255,255,255,0.60)", background: "transparent" }
                }
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu categories */}
        <div className="mt-10 flex flex-col gap-20">
          {categories.map((cat) => {
            const items = menuItems.filter((m) => m.category === cat.id);
            if (items.length === 0) return null;
            return (
              <div
                key={cat.id}
                id={`cat-${cat.id}`}
                ref={(el) => {
                  sectionRefs.current[cat.id] = el;
                }}
                style={{ scrollMarginTop: 140, overflow: "visible" }}
              >
                {/* Category header */}
                <div className="flex items-center gap-4 mb-5 lg:mb-12">
                  <h3
                    className="font-display font-bold text-3xl md:text-4xl tracking-tight"
                    style={{ color: "#fff", margin: 0 }}
                  >
                    {cat.name}
                  </h3>
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: "rgba(255,255,255,0.15)",
                    }}
                  />
                  <span
                    className="font-accent font-semibold tracking-widest uppercase hidden sm:block"
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.50)",
                      padding: "4px 12px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.08)",
                    }}
                  >
                    {items.length} items
                  </span>
                </div>

                <div
                  className="grid grid-cols-2 lg:grid-cols-4
                             gap-x-[14px] gap-y-[70px]
                             lg:gap-8
                             pt-[45px] px-1 pb-2
                             lg:pt-10 lg:px-0 lg:pb-0"
                  style={{ overflow: "visible", alignItems: "stretch" }}
                >
                  {menuItems.length === 0 ? (
                    /* Skeleton Card */
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={`menu-skeleton-${cat.id}-${i}`} className="relative pt-[55px] animate-pulse">
                         <div className="absolute left-1/2 -translate-x-1/2 top-[-10px] w-[130px] h-[130px] rounded-full bg-white/5 border border-white/10 z-10" />
                         <div className="glass h-[220px] rounded-[22px] flex flex-col p-4 pt-[80px] gap-3">
                            <div className="h-4 w-3/4 bg-white/5 rounded" />
                            <div className="h-8 w-1/2 bg-white/5 rounded-full mt-2" />
                            <div className="mt-auto h-10 w-full bg-white/5 rounded-xl" />
                         </div>
                      </div>
                    ))
                  ) : (
                    items.map((item, i) => (
                      <MenuItemCard key={item.id} item={item} index={i} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MenuSection;
