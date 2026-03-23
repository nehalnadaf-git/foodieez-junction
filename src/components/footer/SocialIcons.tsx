"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Instagram, Facebook, MessageCircle, Youtube } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import {
  mergeSocialLinks,
  getPlatformLabel,
  type SocialPlatform,
  type SocialLink,
} from "@/utils/social";

function PlatformIcon({ platform }: { platform: SocialPlatform }) {
  const iconClass = "h-5 w-5";
  switch (platform) {
    case "instagram":
      return <Instagram className={iconClass} />;
    case "facebook":
      return <Facebook className={iconClass} />;
    case "youtube":
      return <Youtube className={iconClass} />;
    case "whatsapp":
      return <MessageCircle className={iconClass} />;
  }
}

export function SocialIcons() {
  const linksData = useQuery(api.socialLinks.getAll);
  const links = useMemo<SocialLink[]>(() => {
    if (linksData === undefined) {
      return [];
    }
    return mergeSocialLinks(linksData).filter(
      (link) => link.active && link.url.trim().length > 0
    );
  }, [linksData]);

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[11px] font-accent uppercase tracking-[0.22em] text-muted-foreground/80">
        Follow Us
      </p>

      <div className="flex flex-row items-center gap-4">
        {links.map((link, index) => (
          <motion.a
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={getPlatformLabel(link.platform)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.1 }}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full",
              "border border-foreground/10 bg-foreground/5 backdrop-blur-xl",
              "text-foreground/70 transition-all duration-200",
              "hover:text-primary hover:border-primary/30 hover:bg-primary/5 hover:shadow-[0_0_16px_rgba(245,166,35,0.25)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            )}
          >
            <PlatformIcon platform={link.platform} />
          </motion.a>
        ))}
      </div>
    </div>
  );
}
