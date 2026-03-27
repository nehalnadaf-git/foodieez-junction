"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Share } from "lucide-react";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);

  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("SW registered: ", reg.scope))
        .catch((err) => console.log("SW registration failed: ", err));
    }

    // Check if already installed
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone ||
      document.referrer.includes("android-app://");
    
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) {
      return;
    }

    // Chrome/Android
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Wait a few seconds to not be too aggressive
      setTimeout(() => setShowPrompt(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Safari iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isIosDevice) {
      setIsIOS(true);
      setTimeout(() => setShowPrompt(true), 4000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50 animate-in slide-in-from-bottom-5 duration-500 pb-[calc(1rem+max(0px,env(safe-area-inset-bottom)))]">
      <div className="bg-background border-2 border-primary/20 rounded-2xl shadow-2xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 relative max-w-lg mx-auto overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 blur-2xl rounded-full pointer-events-none" />
        
        <button
          onClick={() => setShowPrompt(false)}
          className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors z-10"
          aria-label="Dismiss install prompt"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex-1 pr-6 z-10">
          <div className="flex items-center gap-3 mb-1">
            <img src="/new-hero-plate.png" alt="Logo" className="w-8 h-8 rounded-full object-cover shadow-sm bg-black" />
            <h3 className="font-semibold text-base leading-tight">Install FoodieeZ App</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1 ml-11">
            {isIOS
              ? "Tap the share icon below and select 'Add to Home Screen' for quick access."
              : "Install our app for a faster, offline-capable experience!"}
          </p>
        </div>

        <div className="w-full md:w-auto z-10">
        {isIOS ? (
          <div className="flex items-center justify-center gap-2 text-primary font-semibold bg-primary/10 px-4 py-2.5 rounded-xl text-sm border border-primary/20">
            <Share className="w-4 h-4" />
            <span>Tap Share & Add to Home</span>
          </div>
        ) : (
          <Button onClick={handleInstallClick} className="w-full md:w-auto shadow-md rounded-xl font-semibold gap-2">
            <Download className="w-4 h-4" />
            Install Now
          </Button>
        )}
        </div>
      </div>
    </div>
  );
}
