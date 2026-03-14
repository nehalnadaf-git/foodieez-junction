"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.93 }}
      className="relative w-[52px] h-[28px] rounded-full flex items-center
                 transition-colors duration-400 ease-in-out focus:outline-none flex-shrink-0"
      style={{
        background: isDark
          ? "hsl(42 92% 52% / 0.18)"
          : "hsl(38 88% 40% / 0.15)",
        border: isDark
          ? "1px solid hsl(42 92% 52% / 0.30)"
          : "1px solid hsl(38 88% 40% / 0.35)",
        boxShadow: isDark
          ? "inset 0 1px 0 rgba(255,255,255,0.06)"
          : "inset 0 1px 0 rgba(0,0,0,0.04)",
      }}
    >
      {/* Sliding knob */}
      <motion.div
        layout
        animate={{ x: isDark ? 3 : 25 }}
        transition={{ type: "spring", stiffness: 520, damping: 32 }}
        className="absolute w-[22px] h-[22px] rounded-full flex items-center justify-center shadow-md"
        style={{
          background: isDark ? "hsl(42 92% 54%)" : "hsl(38 88% 42%)",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.22 }}
            >
              <Moon className="w-3 h-3 text-background" strokeWidth={2.5} />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ rotate: 30, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -30, opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.22 }}
            >
              <Sun className="w-3 h-3 text-white" strokeWidth={2.5} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
