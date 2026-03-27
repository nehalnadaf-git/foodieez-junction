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
  }, []);

  return null;
}
