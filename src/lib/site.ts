/**
 * Central site-wide constants for branding, contact, and social profiles.
 *
 * Social links default to null because the canonical Linea brand profiles
 * don't exist on those platforms yet — the previous shadcn/Lovable scaffold
 * shipped with placeholder URLs like https://www.instagram.com/linea that
 * actually pointed at other companies' homepages. Components consume
 * getActiveSocialLinks() so links only render once real handles are wired up,
 * and SEO / JSON-LD only emit corresponding tags when populated.
 *
 * When a real handle goes live, set the value below (or override via env in a
 * future iteration) and the footer + structured data follow automatically.
 */

export const SITE_NAME = "Linea";
export const SITE_LEGAL_NAME = "Linea Jewelry Inc.";
export const SITE_TAGLINE = "Minimalist jewelry crafted for the modern individual";
export const SITE_DESCRIPTION =
  "Linea is a minimalist jewelry e-commerce storefront featuring curated rings, earrings, bracelets, and necklaces from architectural collections.";

/**
 * Assumed production hostname. Update here (and public/sitemap.xml) when
 * the real domain is provisioned so canonical / OG / JSON-LD URLs follow.
 */
export const SITE_URL = "https://linea-jewelry.app";

export const SITE_CONTACT_EMAIL = "hello@lineajewelry.com";
export const SITE_CARE_EMAIL = "care@lineajewelry.com";
export const SITE_ORDERS_EMAIL = "orders@lineajewelry.com";
export const SITE_PHONE = "+1-212-555-0123";

/**
 * Twitter / X handle (e.g. "@linea"). Null when no real handle exists —
 * SEO.tsx omits the twitter:site meta entirely in that case.
 */
export const SITE_TWITTER: string | null = null;

export type SocialPlatform = "instagram" | "pinterest" | "facebook" | "twitter";

/**
 * Public profile URLs per platform. Keep null until a real profile exists.
 * Components that render social links should use getActiveSocialLinks().
 */
export const SOCIAL_LINKS: Record<SocialPlatform, string | null> = {
  instagram: null,
  pinterest: null,
  facebook: null,
  twitter: null,
};

export const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  pinterest: "Pinterest",
  facebook: "Facebook",
  twitter: "X / Twitter",
};

export function getActiveSocialLinks(): Array<{
  platform: SocialPlatform;
  href: string;
  label: string;
}> {
  return (Object.keys(SOCIAL_LINKS) as SocialPlatform[])
    .filter((platform) => Boolean(SOCIAL_LINKS[platform]))
    .map((platform) => ({
      platform,
      href: SOCIAL_LINKS[platform] as string,
      label: SOCIAL_LABELS[platform],
    }));
}

/**
 * Optional newsletter signup URL. When set, footer renders the link normally;
 * when null we fall back to a mailto subscribe-by-email link.
 */
export const NEWSLETTER_URL: string | null = null;

export function getNewsletterHref(): string {
  if (NEWSLETTER_URL) return NEWSLETTER_URL;
  const subject = encodeURIComponent("Subscribe me to the Linea newsletter");
  const body = encodeURIComponent(
    "Hi Linea team — please add me to your newsletter. Thanks!",
  );
  return `mailto:${SITE_CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}
