"use client";

import { useEffect } from "react";

export function PWAInstallPrompt() {
  useEffect(() => {
    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("SW registered: ", reg.scope))
        .catch((err) => console.log("SW registration failed: ", err));
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      // @ts-ignore
      window.deferredPwaPrompt = e;
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  return null;
}
