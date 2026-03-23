export type SocialPlatform = "instagram" | "facebook" | "youtube" | "whatsapp";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  active: boolean;
}

export interface SocialLinksConfig {
  links: SocialLink[];
}

export const DEFAULT_SOCIAL_LINKS: SocialLinksConfig = {
  links: [
    { platform: "instagram", url: "https://www.instagram.com/foodieez_junction_01/?hl=en", active: true },
    { platform: "facebook", url: "https://facebook.com/foodieezjunction", active: true },
    { platform: "youtube", url: "", active: false },
    { platform: "whatsapp", url: "https://wa.me/919743862836", active: true },
  ],
};

/**
 * Returns the human-readable display label for a given platform.
 */
export function getPlatformLabel(platform: SocialPlatform): string {
  const labels: Record<SocialPlatform, string> = {
    instagram: "Instagram",
    facebook: "Facebook",
    youtube: "YouTube",
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
    youtube: "https://youtube.com/@yourchannel",
    whatsapp: "https://wa.me/91XXXXXXXXXX",
  };
  return placeholders[platform];
}

export function mergeSocialLinks(
  links: Array<{ platform: string; url: string; active: boolean }>
): SocialLink[] {
  return DEFAULT_SOCIAL_LINKS.links.map((defaultLink) => {
    const existing = links.find((link) => link.platform === defaultLink.platform);
    return existing
      ? {
          platform: defaultLink.platform,
          url: existing.url,
          active: existing.active,
        }
      : defaultLink;
  });
}
