import { loadFromStorage, saveToStorage } from "@/utils/storage";

export type SocialPlatform = "instagram" | "facebook" | "whatsapp";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  active: boolean;
}

export interface SocialLinksConfig {
  links: SocialLink[];
}

const SOCIAL_LINKS_KEY = "fj_social_links";

const DEFAULT_SOCIAL_LINKS: SocialLinksConfig = {
  links: [
    { platform: "instagram", url: "https://www.instagram.com/foodieez_junction_01/?hl=en", active: true },
    { platform: "facebook", url: "https://facebook.com/foodieezjunction", active: true },
    { platform: "whatsapp", url: "https://wa.me/919743862836", active: true },
  ],
};

/**
 * Returns all social links from localStorage.
 * Falls back to the default config if nothing is stored yet.
 */
export function getSocialLinks(): SocialLinksConfig {
  return loadFromStorage<SocialLinksConfig>(SOCIAL_LINKS_KEY, DEFAULT_SOCIAL_LINKS);
}

/**
 * Saves the full social links config to localStorage.
 */
export function saveSocialLinks(config: SocialLinksConfig): void {
  saveToStorage(SOCIAL_LINKS_KEY, config);
}

/**
 * Returns only active social links that also have a non-empty URL.
 * Used by the customer-facing footer component to decide what to render.
 */
export function getActiveSocialLinks(): SocialLink[] {
  const config = getSocialLinks();
  return config.links.filter((link) => link.active && link.url.trim().length > 0);
}

/**
 * Returns the human-readable display label for a given platform.
 */
export function getPlatformLabel(platform: SocialPlatform): string {
  const labels: Record<SocialPlatform, string> = {
    instagram: "Instagram",
    facebook: "Facebook",
    whatsapp: "WhatsApp",
  };
  return labels[platform];
}

/**
 * Returns the placeholder URL hint shown in the admin input for a given platform.
 */
export function getPlatformPlaceholder(platform: SocialPlatform): string {
  const placeholders: Record<SocialPlatform, string> = {
    instagram: "https://instagram.com/yourprofile",
    facebook: "https://facebook.com/yourpage",
    whatsapp: "https://wa.me/91XXXXXXXXXX",
  };
  return placeholders[platform];
}
