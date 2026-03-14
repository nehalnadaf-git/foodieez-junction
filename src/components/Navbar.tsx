"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X, Search, Clock, MapPin } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

const navLinks = [
  { label: "Home",    href: "/#home" },
  { label: "Menu",    href: "/#menu" },
  { label: "About",   href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled]           = useState(false);
  const [hidden, setHidden]               = useState(false);
  const lastScrollY                       = useRef(0);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [searchOpen, setSearchOpen]       = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const searchRef                         = useRef<HTMLInputElement>(null);
  const { setIsCartOpen } = useCart();

  useEffect(() => {
    document.body.style.overflow = (mobileOpen || searchOpen) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen, searchOpen]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 80);
  }, [searchOpen]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      if (y < 10) {
        setHidden(false);
      } else if (y > lastScrollY.current + 5) {
        setHidden(true);
      } else if (y < lastScrollY.current - 5) {
        setHidden(false);
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSearchOpen(false); setMobileOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { rootMargin: "-30% 0px -60% 0px" }
    );
    ["home", "menu", "about", "contact"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (href: string) => {
    const isHomePage = window.location.pathname === "/";
    const targetId = href.startsWith("/#") ? href.slice(2) : href.startsWith("#") ? href.slice(1) : href;

    if (!isHomePage) {
      // Navigate to home page with the anchor
      window.location.href = `/#${targetId}`;
      return;
    }

    const wasOpen = mobileOpen;
    setMobileOpen(false);
    setSearchOpen(false);
    
    setTimeout(() => {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, wasOpen ? 320 : 0);
  };

  return (
    <>
      {/* ══════════════════════════════════════
          TOP HEADER
      ══════════════════════════════════════ */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: hidden ? -96 : 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-2 md:top-4 left-0 right-0 z-50 w-[94vw] lg:w-[1024px] mx-auto"
      >
        {/* Background layer */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-350 rounded-full"
          style={{
            background: scrolled
              ? "hsl(var(--background) / 0.85)"
              : "hsl(var(--background) / 0.65)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: scrolled
              ? "1px solid hsl(var(--border) / 0.8)"
              : "1px solid hsl(var(--border) / 0.3)",
            boxShadow: scrolled
              ? "0 12px 32px rgba(0,0,0,0.15), inset 0 1px 1px rgba(255,255,255,0.08)"
              : "0 4px 16px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.05)",
          }}
        />

        <div className="relative z-10 w-full flex md:grid md:grid-cols-[auto_1fr_auto] items-center justify-between h-[60px] md:h-[66px] px-4 md:px-6 lg:px-8">

          {/* ── MOBILE LEFT: Hamburger ── */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="flex flex-col justify-center gap-[5px] p-2.5 rounded-xl
                         hover:bg-primary/8 transition-colors duration-200 group"
            >
              <span className="block w-[18px] h-[1.5px] rounded-full transition-colors duration-200 bg-foreground/65 group-hover:bg-primary" />
              <span className="block w-[12px] h-[1.5px] rounded-full transition-colors duration-200 bg-foreground/45 group-hover:bg-primary" />
              <span className="block w-[15px] h-[1.5px] rounded-full transition-colors duration-200 bg-foreground/65 group-hover:bg-primary" />
            </button>
          </div>

          {/* ── BRAND LOGO (Mobile: center, Desktop: left) ── */}
          <button
            onClick={() => scrollTo("/#home")}
            aria-label="Go home"
            className="flex flex-col items-center md:items-start justify-center leading-none absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0"
          >
            <div className="flex items-center gap-2">
              <span
                className="text-[14px] xs:text-[15px] sm:text-[17px] md:text-[20px] font-display font-bold tracking-[0.14em] uppercase"
                style={{ color: "hsl(var(--primary))" }}
              >
                Foodieez
              </span>
              <span className="w-px h-3.5 block" style={{ background: "hsl(var(--primary) / 0.3)" }} />
              <span
                className="text-[14px] xs:text-[15px] sm:text-[17px] md:text-[20px] font-display font-light tracking-[0.2em] uppercase inline"
                style={{ color: "hsl(var(--foreground) / 0.70)" }}
              >
                Junction
              </span>
            </div>
          </button>

          {/* ── DESKTOP CENTER: Nav Links ── */}
          <nav className="hidden md:flex items-center justify-center gap-1">
            {navLinks.map(({ label, href }) => {
              const isActive = activeSection === href.slice(1);
              return (
                <button
                  key={href}
                  onClick={() => scrollTo(href)}
                  className={`relative px-4 py-2 rounded-full text-[13px] font-heading font-medium transition-all duration-200
                    ${isActive ? "text-primary" : "text-foreground/50 hover:text-foreground/80"}`}
                >
                  {label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full -z-10"
                      style={{ background: "hsl(var(--primary) / 0.10)" }}
                      transition={{ type: "spring", duration: 0.4 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* ── RIGHT: Actions (Search, Theme, Cart) ── */}
          <div className="flex items-center justify-end gap-1 md:gap-2">

            {/* Search icon only */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              className="p-2.5 rounded-xl transition-all duration-200 text-foreground/50 hover:text-primary hover:bg-primary/8"
            >
              <Search className="w-[17px] h-[17px]" />
            </button>

            {/* Theme toggle */}
            <span className="hidden md:flex">
              <ThemeToggle />
            </span>


          </div>
        </div>
      </motion.header>

      {/* ══════════════════════════════════════
          SEARCH OVERLAY
      ══════════════════════════════════════ */}
      <AnimatePresence>
        {searchOpen && (
          <>
            {/* Dark backdrop */}
            <motion.div
              key="search-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-md"
              onClick={() => setSearchOpen(false)}
            />

            {/* Search panel — drops from top */}
            <motion.div
              key="search-panel"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-[80px] left-1/2 -translate-x-1/2 z-[90] w-[92vw] max-w-[620px]"
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  boxShadow: "0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px hsl(var(--primary) / 0.08)",
                }}
              >
                {/* Input row */}
                <div className="flex items-center gap-3 px-5 py-4"
                     style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                  <Search className="w-5 h-5 shrink-0" style={{ color: "hsl(var(--primary))" }} />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search our menu — burgers, shawarma, momos…"
                    className="flex-1 bg-transparent text-[15px] font-body outline-none text-foreground placeholder:text-foreground/30"
                  />
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="p-1.5 rounded-lg text-foreground/40 hover:text-foreground hover:bg-foreground/8 transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick links */}
                <div className="px-5 py-4">
                  <p className="text-[10px] font-accent font-semibold uppercase tracking-[0.18em] mb-3"
                     style={{ color: "hsl(var(--foreground) / 0.35)" }}>
                    Popular Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Burgers", "Shawarma", "Momos", "Pizza", "Cold Drinks", "Fries"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => { scrollTo("#menu"); }}
                        className="px-3.5 py-1.5 rounded-full text-[12px] font-heading font-medium
                                   transition-all duration-200 hover:scale-105"
                        style={{
                          background: "hsl(var(--foreground) / 0.06)",
                          border: "1px solid hsl(var(--border))",
                          color: "hsl(var(--foreground) / 0.7)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "hsl(var(--primary) / 0.12)";
                          e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.3)";
                          e.currentTarget.style.color = "hsl(var(--primary))";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "hsl(var(--foreground) / 0.06)";
                          e.currentTarget.style.borderColor = "hsl(var(--border))";
                          e.currentTarget.style.color = "hsl(var(--foreground) / 0.7)";
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════
          MOBILE DRAWER (slides from left)
      ══════════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 360, mass: 0.8 }}
              className="fixed left-0 top-0 bottom-0 z-[70] w-[78vw] max-w-[280px] flex flex-col"
              style={{
                background: "linear-gradient(160deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)",
                borderRight: "1px solid hsl(var(--border))",
                boxShadow: "24px 0 80px rgba(0,0,0,0.3)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-6 pb-5">
                <div>
                  <p className="text-[15px] font-display font-bold tracking-[0.12em] uppercase"
                     style={{ color: "hsl(var(--primary))" }}>
                    Foodieez Junction
                  </p>
                  <p className="text-[8px] font-accent tracking-[0.25em] uppercase mt-1"
                     style={{ color: "hsl(var(--primary) / 0.45)" }}>
                    Premium Street Food · Hubballi
                  </p>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="p-2 rounded-xl text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mx-5 h-px" style={{ background: "hsl(var(--border))" }} />

              {/* Nav links */}
              <nav className="flex flex-col gap-0.5 px-3 mt-4">
                {navLinks.map(({ label, href }, i) => {
                  const isActive = activeSection === href.slice(1);
                  return (
                    <motion.button
                      key={href}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.06, duration: 0.28, ease: "easeOut" }}
                      onClick={() => scrollTo(href)}
                      className={`flex items-center justify-between w-full px-4 py-3.5 rounded-2xl
                                  text-[14px] font-heading font-medium transition-all duration-200
                                  ${isActive ? "text-primary" : "text-foreground/55 hover:text-foreground hover:bg-foreground/5"}`}
                      style={isActive ? {
                        background: "hsl(var(--primary) / 0.08)",
                        border: "1px solid hsl(var(--primary) / 0.15)",
                      } : {}}
                    >
                      <span className="flex items-center gap-3">
                        {label}
                      </span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ background: "hsl(var(--primary))" }} />
                      )}
                    </motion.button>
                  );
                })}
              </nav>

              {/* Appearance row */}
              <div className="mx-3 mt-3">
                <div className="flex items-center justify-between px-4 py-3 rounded-2xl"
                     style={{ background: "hsl(var(--foreground) / 0.04)", border: "1px solid hsl(var(--border))" }}>
                  <span className="text-[13px] font-heading font-medium text-foreground/50">Appearance</span>
                  <ThemeToggle />
                </div>
              </div>

              <div className="flex-1" />

              {/* Info */}
              <div className="px-5 pb-4 space-y-2">
                <div className="flex items-center gap-2 text-[11px] font-body"
                     style={{ color: "hsl(var(--foreground) / 0.35)" }}>
                  <Clock className="w-3 h-3 shrink-0" style={{ color: "hsl(var(--primary) / 0.5)" }} />
                  <span>Open 2 PM – 11 PM daily</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-body"
                     style={{ color: "hsl(var(--foreground) / 0.35)" }}>
                  <MapPin className="w-3 h-3 shrink-0" style={{ color: "hsl(var(--primary) / 0.5)" }} />
                  <span>Bengeri, Hubballi, Karnataka</span>
                </div>
              </div>

              {/* CTA */}
              <div className="px-4 pb-8">
                <button
                  onClick={() => scrollTo("#menu")}
                  className="w-full py-3.5 rounded-2xl font-heading font-bold text-[14px] tracking-wide shimmer
                             transition-all duration-300 hover:brightness-110"
                  style={{
                    background: "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                    boxShadow: "0 4px 24px hsl(var(--primary) / 0.35)",
                  }}
                >
                  Explore Menu
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

