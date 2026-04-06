"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { getCategoryImage } from "@/data/menuData";
import { isBase64Image } from "@/utils/image";
import { useMenuCatalog } from "@/hooks/useMenuCatalog";
import { getVisibleSortedCategories } from "@/utils/categoryOrder";

const CategoriesGrid = () => {
  const { categories: rawCategories, menuItems } = useMenuCatalog();
  const categories = getVisibleSortedCategories(rawCategories);

  const scrollTo = (catId: string) => {
    document
      .getElementById(`cat-${catId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="pt-14 pb-20 md:pt-28 md:pb-28 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2
                    w-[700px] h-[400px] bg-primary/4 rounded-full blur-[180px] pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="section-label mb-5 mx-auto w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Full Menu
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight tracking-tight">
            Browse by <span className="text-gradient italic">Category</span>
          </h2>
          <p className="text-muted-foreground font-body text-sm md:text-base mt-3 max-w-md mx-auto">
            Pick your craving — we&apos;ve got Hubballi&apos;s finest covered.
          </p>
        </motion.div>

        {/* Category cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
          {categories.length === 0 ? (
            /* Skeleton Loading State */
            Array.from({ length: 5 }).map((_, i) => (
              <div 
                key={`cat-skeleton-${i}`} 
                className="glass rounded-2xl p-5 flex flex-col items-center gap-3 animate-pulse"
              >
                <div className="w-20 h-20 rounded-full bg-white/5" />
                <div className="h-4 w-16 bg-white/5 rounded" />
                <div className="h-6 w-12 bg-white/5 rounded-full" />
              </div>
            ))
          ) : (
            categories.map((cat, i) => {
              const count = menuItems.filter((m) => m.category === cat.id).length;
              return (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => scrollTo(cat.id)}
                  className="group glass card-hover rounded-2xl p-5 flex flex-col items-center gap-3
                             text-center hover:border-primary/25 transition-all duration-300"
                >
                  {/* Image container */}
                  <div className="w-20 h-20 flex items-center justify-center transition-all duration-300 relative">
                    <Image
                      src={cat.image && cat.image.trim().length > 0 ? cat.image : getCategoryImage(cat.id)}
                      alt={`${cat.name} — Foodieez Junction`}
                      width={72}
                      height={72}
                      className="object-contain group-hover:scale-110 transition-transform duration-400 drop-shadow-xl"
                      loading="lazy"
                      unoptimized={isBase64Image(cat.image ?? "") || true}
                    />
                  </div>

                  {/* Category name */}
                  <span className="font-heading font-semibold text-[13px] text-foreground/90 leading-tight
                                    group-hover:text-primary transition-colors duration-200">
                    {cat.name}
                  </span>

                  {/* Item count badge */}
                  <span className="px-3 py-1 rounded-full text-[10px] font-accent font-semibold
                                    bg-primary/8 border border-primary/15 text-primary tracking-wider
                                    group-hover:bg-primary/15 transition-colors duration-200">
                    {count} items
                  </span>
                </motion.button>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoriesGrid;
