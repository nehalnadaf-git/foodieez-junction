"use client";

import { useState, useRef } from "react";
import { MapPin, Phone, Clock } from "lucide-react";
import { SocialIcons } from "@/components/footer/SocialIcons";

const Footer = () => {
  const [clickCount, setClickCount] = useState(0);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleSecretClick = async () => {
    // @ts-ignore
    if (!window.deferredPwaPrompt) return; // Silently do nothing if unsupported or already installed
    
    if (clickTimeout.current) clearTimeout(clickTimeout.current);
    
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount >= 3) {
      try {
        // @ts-ignore
        window.deferredPwaPrompt.prompt();
        // @ts-ignore
        const { outcome } = await window.deferredPwaPrompt.userChoice;
        if (outcome === 'accepted') {
          // @ts-ignore
          window.deferredPwaPrompt = null;
        }
      } catch (e) {
        // Silently fail
      }
      setClickCount(0);
    } else {
      clickTimeout.current = setTimeout(() => {
        setClickCount(0);
      }, 2000);
    }
  };

  return (
    <footer className="relative mt-0">
      <div className="h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />

      <div className="py-14 bg-background text-foreground">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-10 mb-12">

            {/* Brand */}
            <div>
              <h3 
                onClick={handleSecretClick}
                className="font-display text-2xl font-bold text-foreground mb-1 tracking-tight cursor-default"
              >
                Foodieez Junction
              </h3>
              <p className="text-[9px] font-accent uppercase tracking-[0.24em] text-primary/60 mb-4">
                Est. Hubballi · Street Food
              </p>
              <p className="text-xs text-muted-foreground font-body leading-relaxed max-w-[220px]">
                Hubballi&apos;s favourite street food destination. Fresh, spicy, authentic.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-[9px] font-accent uppercase tracking-[0.22em] text-muted-foreground mb-6">
                Quick Links
              </h4>
              <div className="flex flex-col gap-3">
                {["Home", "Menu", "About", "Contact"].map((link) => {
                  const targetId = link.toLowerCase();
                  return (
                    <button
                      key={link}
                      onClick={() => {
                        const isHomePage = window.location.pathname === "/";
                        if (!isHomePage) {
                          window.location.href = `/#${targetId}`;
                          return;
                        }
                        document
                          .getElementById(targetId)
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-left font-body text-sm text-muted-foreground transition-all duration-200 hover:translate-x-1 hover:text-primary"
                    >
                      {link}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-[9px] font-accent uppercase tracking-[0.22em] text-muted-foreground mb-6">
                Contact Info
              </h4>
              <div className="space-y-4">
                {[
                  { icon: MapPin, text: "Bengeri, Vidya Nagar, Hubballi 580023" },
                  { icon: Phone, text: "+91 97438 62836" },
                  { icon: Clock, text: "Daily: 2:00 PM – 11:00 PM" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.text} className="flex items-start gap-3">
                      <Icon
                        className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0"
                        strokeWidth={1.5}
                      />
                      <span className="text-xs text-muted-foreground font-body leading-relaxed">
                        {item.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Social Icons */}
          <div className="mb-10 flex justify-center">
            <SocialIcons />
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-primary/8 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
            <p className="text-xs text-muted-foreground/55 font-body">
              © {new Date().getFullYear()} Foodieez Junction. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
