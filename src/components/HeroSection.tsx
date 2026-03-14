"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

/**
 * HeroSection Component — migrated to Next.js 16
 * - "use client" required for Framer Motion animations
 * - <img> replaced with next/image <Image> with priority for LCP
 */
const HeroSection = () => {
  return (
    <>
      {/* ─────────────────────────────────────────────
          ULTRA-PREMIUM MOBILE OVERRIDES (max-width: 767px)
      ───────────────────────────────────────────── */}
      <style>{`
        @media (max-width: 767px) {
          #home { background: hsl(var(--background)) !important; overflow-x: hidden !important; width: 100% !important; min-height: auto !important; }
          .hero-inner { display: grid !important; grid-template-columns: 1fr !important; grid-template-rows: auto auto auto auto auto !important; padding: 140px 20px 24px !important; gap: 0 !important; width: 100% !important; }
          .hero-left { display: contents !important; }
          .hero-badge { grid-column: 1 !important; display: inline-flex !important; align-items: center !important; gap: 6px !important; background: rgba(245, 166, 35, 0.08) !important; border: 1px solid rgba(245, 166, 35, 0.18) !important; padding: 7px 14px !important; border-radius: 100px !important; width: fit-content !important; margin-bottom: 14px !important; }
          .hero-badge-text { font-size: 9px !important; font-weight: 800 !important; letter-spacing: 0.08em !important; text-transform: uppercase !important; color: hsl(var(--primary)) !important; opacity: 0.9 !important; }
          .hero-badge-dot { width: 6px !important; height: 6px !important; background: #F5A623 !important; border-radius: 50% !important; box-shadow: 0 0 8px #F5A623 !important; }
          .hero-heading { grid-column: 1 !important; position: relative !important; z-index: 2 !important; font-size: clamp(38px, 11vw, 46px) !important; line-height: 1.02 !important; font-weight: 900 !important; color: hsl(var(--foreground)) !important; letter-spacing: -0.02em !important; margin: 0 0 18px !important; max-width: 58% !important; }
          .hero-heading-street { display: block !important; font-family: var(--font-playfair), serif !important; font-style: italic !important; background: linear-gradient(135deg, #F5A623 0%, #C47B05 100%) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; }
          .hero-right { position: absolute !important; top: 170px !important; right: 0 !important; width: 50% !important; display: flex !important; align-items: center !important; justify-content: center !important; z-index: 1 !important; pointer-events: none !important; }
          .hero-plate-container { width: 100% !important; display: flex !important; justify-content: center !important; position: static !important; }
          .hero-plate-img { width: 100% !important; max-width: 260px !important; height: auto !important; object-fit: contain !important; filter: drop-shadow(0 18px 36px rgba(0,0,0,0.20)) !important; transform: none !important; animation: hero-float 6s ease-in-out infinite !important; position: static !important; }
          @keyframes hero-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
          .hero-halo { position: absolute !important; width: 160% !important; height: 160% !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important; background: radial-gradient(circle, rgba(245, 166, 35, 0.18) 0%, transparent 70%) !important; border-radius: 50% !important; z-index: -1 !important; pointer-events: none !important; }
          .hero-desc { grid-column: 1 !important; font-size: 13.5px !important; line-height: 1.65 !important; color: hsl(var(--muted-foreground)) !important; margin: 0 0 16px !important; display: block !important; overflow: visible !important; width: 100% !important; }
          .hero-meta { grid-column: 1 !important; display: flex !important; flex-wrap: wrap !important; gap: 16px !important; margin: 0 0 20px !important; }
          .hero-meta-item { display: flex !important; align-items: center !important; gap: 6px !important; font-size: 11.5px !important; font-weight: 800 !important; color: hsl(var(--foreground) / 0.6) !important; }
          .hero-btns { grid-column: 1 !important; display: flex !important; flex-direction: column !important; gap: 12px !important; width: 100% !important; }
          .hero-btn-primary { background: #F5A623 !important; color: #FFF !important; padding: 14px 20px !important; border-radius: 50px !important; font-size: 13px !important; font-weight: 700 !important; display: flex !important; align-items: center !important; justify-content: space-between !important; box-shadow: 0 10px 24px rgba(245, 166, 35, 0.32) !important; text-decoration: none !important; }
          .hero-btn-arrow { width: 26px !important; height: 26px !important; background: #FFF !important; border-radius: 50% !important; display: flex !important; align-items: center !important; justify-content: center !important; }
          .hero-btn-whatsapp { border: 1.5px solid hsl(var(--foreground) / 0.15) !important; color: hsl(var(--foreground)) !important; padding: 13px 20px !important; border-radius: 50px !important; font-size: 13px !important; font-weight: 600 !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important; text-decoration: none !important; }
        }
        @media (max-width: 360px) {
          .hero-heading { font-size: 32px !important; max-width: 55% !important; }
          .hero-right { width: 45% !important; top: 130px !important; }
          .hero-plate-img { max-width: 200px !important; }
          .hero-btn-primary, .hero-btn-whatsapp { font-size: 12px !important; padding: 12px 16px !important; }
        }
        @media (min-width: 768px) {
          #home { background: hsl(var(--background)); min-height: 90vh; max-height: 900px; display: flex; align-items: center; }
          .hero-inner { display: flex !important; flex-direction: row !important; align-items: center !important; justify-content: space-between !important; min-height: 90vh !important; max-height: 900px !important; padding: 150px clamp(32px, 5vw, 80px) 0 !important; gap: clamp(24px, 4vw, 64px) !important; width: 100% !important; max-width: 1440px !important; margin: 0 auto !important; position: relative !important; }
          .hero-left { display: flex !important; flex-direction: column !important; align-items: flex-start !important; gap: 0 !important; flex: 0 1 52% !important; max-width: 620px !important; z-index: 2 !important; }
          .hero-badge { display: inline-flex !important; align-items: center !important; gap: 8px !important; background: rgba(245, 166, 35, 0.07) !important; border: 1px solid rgba(245, 166, 35, 0.20) !important; padding: 10px 20px !important; border-radius: 100px !important; width: fit-content !important; margin-bottom: 32px !important; transition: all 0.3s ease !important; }
          .hero-badge:hover { background: rgba(245, 166, 35, 0.12) !important; border-color: rgba(245, 166, 35, 0.35) !important; }
          .hero-badge-text { font-size: 11px !important; font-weight: 800 !important; letter-spacing: 0.14em !important; text-transform: uppercase !important; color: hsl(var(--primary)) !important; opacity: 0.9 !important; }
          .hero-badge-dot { width: 7px !important; height: 7px !important; background: #F5A623 !important; border-radius: 50% !important; box-shadow: 0 0 12px rgba(245, 166, 35, 0.8) !important; animation: badge-pulse-desktop 2s ease-in-out infinite !important; }
          @keyframes badge-pulse-desktop { 0%, 100% { box-shadow: 0 0 8px rgba(245, 166, 35, 0.6); } 50% { box-shadow: 0 0 18px rgba(245, 166, 35, 1); } }
          .hero-heading { font-size: clamp(56px, 5.8vw, 88px) !important; line-height: 0.95 !important; font-weight: 900 !important; color: hsl(var(--foreground)) !important; letter-spacing: -0.035em !important; margin: 0 0 28px !important; max-width: 100% !important; position: static !important; z-index: auto !important; transform: none !important; }
          .hero-heading-street { display: block !important; font-family: var(--font-playfair), serif !important; font-style: italic !important; background: linear-gradient(135deg, #F5A623 0%, #C47B05 100%) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; padding: 4px 0 !important; }
          .hero-desc { font-size: 18px !important; line-height: 1.75 !important; color: hsl(var(--muted-foreground)) !important; margin: 0 0 28px !important; max-width: 460px !important; display: block !important; overflow: visible !important; width: auto !important; grid-column: auto !important; letter-spacing: 0.01em !important; }
          .hero-meta { display: flex !important; flex-direction: row !important; flex-wrap: wrap !important; gap: 28px !important; margin: 0 0 40px !important; grid-column: auto !important; }
          .hero-meta-item { display: flex !important; align-items: center !important; gap: 8px !important; font-size: 14px !important; font-weight: 700 !important; color: hsl(var(--foreground) / 0.6) !important; }
          .hero-btns { display: flex !important; flex-direction: row !important; align-items: center !important; gap: 18px !important; width: auto !important; grid-column: auto !important; }
          .hero-btn-primary { background: linear-gradient(135deg, #F5A623 0%, #E8941A 100%) !important; color: #FFF !important; padding: 18px 36px !important; border-radius: 60px !important; font-size: 15px !important; font-weight: 700 !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 14px !important; box-shadow: 0 14px 40px rgba(245, 166, 35, 0.35) !important; text-decoration: none !important; white-space: nowrap !important; transition: all 0.3s ease !important; }
          .hero-btn-primary:hover { box-shadow: 0 18px 48px rgba(245, 166, 35, 0.50) !important; transform: translateY(-2px) !important; }
          .hero-btn-arrow { width: 32px !important; height: 32px !important; background: rgba(255, 255, 255, 0.95) !important; border-radius: 50% !important; display: flex !important; align-items: center !important; justify-content: center !important; box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important; }
          .hero-btn-whatsapp { border: 2px solid hsl(var(--foreground) / 0.1) !important; color: hsl(var(--foreground)) !important; padding: 17px 32px !important; border-radius: 60px !important; font-size: 15px !important; font-weight: 600 !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; gap: 10px !important; text-decoration: none !important; white-space: nowrap !important; background: hsl(var(--foreground) / 0.03) !important; backdrop-filter: blur(12px) !important; -webkit-backdrop-filter: blur(12px) !important; transition: all 0.3s ease !important; }
          .hero-btn-whatsapp:hover { background: hsl(var(--foreground) / 0.08) !important; border-color: hsl(var(--foreground) / 0.2) !important; transform: translateY(-2px) !important; box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important; }
          .hero-right { position: relative !important; flex: 0 1 48% !important; display: flex !important; align-items: center !important; justify-content: center !important; top: -50px !important; right: auto !important; width: auto !important; z-index: 1 !important; pointer-events: auto !important; }
          .hero-plate-container { position: relative !important; width: 100% !important; display: flex !important; justify-content: center !important; }
          .hero-plate-img { width: 100% !important; max-width: 650px !important; height: auto !important; object-fit: contain !important; filter: drop-shadow(0 40px 80px rgba(0,0,0,0.25)) !important; transform: none !important; animation: hero-float-desktop 7s ease-in-out infinite !important; position: static !important; }
          @keyframes hero-float-desktop { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-16px) rotate(2deg); } }
          .hero-halo { position: absolute !important; width: 140% !important; height: 140% !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important; background: radial-gradient(circle, rgba(245, 166, 35, 0.12) 0%, rgba(245, 166, 35, 0.04) 40%, transparent 70%) !important; border-radius: 50% !important; z-index: -1 !important; pointer-events: none !important; }
        }
      `}</style>

      {/* Main Hero Component */}
      <section id="home" className="relative min-h-screen flex items-center bg-background">
        {/* Ambient Decorative Blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[120px]"
            style={{ background: "radial-gradient(circle, rgba(245, 166, 35, 0.05) 0%, transparent 70%)" }}
          />
          <div
            className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px]"
            style={{ background: "radial-gradient(circle, rgba(245, 166, 35, 0.03) 0%, transparent 70%)" }}
          />
        </div>

        {/* Hero Content Container */}
        <div className="hero-inner relative z-10 w-full max-w-7xl mx-auto
                        px-4 sm:px-8 lg:px-14
                        md:flex md:flex-row md:items-center md:justify-between md:min-h-screen">

          {/* ────── LEFT COLUMN ────── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="hero-left flex-1"
          >
            {/* Tag/Badge */}
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              <span className="hero-badge-text">Hubballi&apos;s Finest Street Food</span>
            </div>

            {/* Main Headline */}
            <h1 className="hero-heading font-display">
              <span className="block opacity-90">Taste the</span>
              <span className="hero-heading-street">Streets</span>
              <span className="block opacity-90">of Hubballi</span>
            </h1>

            {/* Subtle Description */}
            <p className="hero-desc mt-4 md:mt-7 text-foreground/60 md:text-lg max-w-[440px] leading-relaxed">
              Freshly made, hygienic &amp; spicy. Authentic street-style taste crafted with love — the best dine-in &amp; takeaway near Bengeri, Hubballi.
            </p>

            {/* Meta */}
            <div className="hero-meta mt-6 md:mt-8 flex flex-wrap gap-5">
              <div className="hero-meta-item">
                <span className="text-primary/60">🕑</span>
                <span>Open 2 PM – 11 PM</span>
              </div>
              <div className="hero-meta-item">
                <span className="text-primary/60">📍</span>
                <span>Bengeri, Hubballi</span>
              </div>
            </div>

            {/* Call To Actions */}
            <div className="hero-btns mt-8 md:mt-12 flex flex-col sm:flex-row items-center gap-4">
              <a
                href="#menu"
                className="hero-btn-primary group w-full sm:w-auto"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector("#menu")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <span>Explore Full Menu</span>
                <div className="hero-btn-arrow shadow-sm">
                  <ArrowUpRight className="w-4 h-4 text-primary" />
                </div>
              </a>

              <a
                href="https://wa.me/919743862836"
                target="_blank"
                rel="noreferrer"
                className="hero-btn-whatsapp w-full sm:w-auto transition-transform active:scale-95"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366" className="shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>Quick WhatsApp Order</span>
              </a>
            </div>
          </motion.div>

          {/* ────── RIGHT COLUMN ────── */}
          <div className="hero-right flex-1 select-none">
            <div className="hero-plate-container">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex items-center justify-center lg:justify-end"
              >
                <div className="hero-halo" />
                <Image
                  src="/new-hero-plate.png"
                  alt="Delicious Fried Chicken Plate — FoodieeZ Junction Hubballi"
                  width={650}
                  height={600}
                  priority
                  className="hero-plate-img w-[400px] lg:w-[600px] object-contain drop-shadow-[0_32px_64px_rgba(0,0,0,0.18)]"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
