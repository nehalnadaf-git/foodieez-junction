"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#1A1008]">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative flex flex-col items-center gap-8">
        {/* Animated Rings */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 border-2 border-primary/30 rounded-full"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -inset-4 border border-primary/20 rounded-full"
          />
          
          {/* Central Spinning Element */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-12 h-12 rounded-full border-b-2 border-r-2 border-primary shadow-[0_0_15px_rgba(245,166,35,0.4)]"
          />
        </div>

        {/* Text Animation */}
        <div className="flex flex-col items-center gap-2">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-display font-bold text-white tracking-widest uppercase italic"
          >
            Foodieez Junction
          </motion.h2>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, repeat: Infinity }}
            className="h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"
          />
          <p className="text-[10px] uppercase font-accent tracking-[0.3em] text-primary/70 animate-pulse mt-2">
            Preparing Excellence
          </p>
        </div>
      </div>

      {/* Subtle Grain Overlay */}
      <div className="grain pointer-events-none opacity-5 shadow-inner" />
    </div>
  );
}

