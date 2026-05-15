import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Centralized site constants used by SEO tags, JSON-LD, and sitemap entries.
 *
 * NOTE: SITE_URL is an assumed production hostname. If a real domain is
 * provisioned, update this single constant (and public/sitemap.xml) so all
 * canonical / OG / Twitter / JSON-LD URLs follow.
 */
export const SITE_URL = "https://linea-jewelry.app";
export const SITE_NAME = "Linea";
export const SITE_TAGLINE = "Minimalist jewelry crafted for the modern individual";
export const DEFAULT_DESCRIPTION =
  "Linea is a minimalist jewelry e-commerce storefront featuring curated rings, earrings, bracelets, and necklaces from architectural collections.";
export const DEFAULT_IMAGE = "/social-card.svg";
export const TWITTER_HANDLE = "@linea";

export type JsonLdObject = Record<string, unknown>;

interface SEOProps {
  /** Page-specific title; rendered as `${title} | Linea`. Omit on the home page. */
  title?: string;
  /** Page-specific description; falls back to the site default. */
  description?: string;
  /** Override the path used for canonical / OG url. Defaults to the current route. */
  path?: string;
  /** Absolute or root-relative image URL. Defaults to /social-card.svg. */
  image?: string;
  /** Open Graph type. Defaults to "website"; product pages should pass "product". */
  type?: string;
  /** Pass true on auth-walled or transactional routes (checkout, account, etc.). */
  noindex?: boolean;
  /** Optional Product / Breadcrumb / etc. JSON-LD payload. */
  jsonLd?: JsonLdObject | JsonLdObject[];
}

function upsertMeta(attr: "name" | "property", key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

const PAGE_LD_ID = "page-jsonld";

function setPageJsonLd(payload: JsonLdObject | JsonLdObject[] | undefined) {
  const existing = document.head.querySelector<HTMLScriptElement>(
    `script[data-seo-id="${PAGE_LD_ID}"]`
  );
  if (!payload) {
    if (existing) existing.remove();
    return;
  }
  const json = JSON.stringify(payload);
  if (existing) {
    existing.textContent = json;
    return;
  }
  const el = document.createElement("script");
  el.setAttribute("type", "application/ld+json");
  el.setAttribute("data-seo-id", PAGE_LD_ID);
  el.textContent = json;
  document.head.appendChild(el);
}

const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image = DEFAULT_IMAGE,
  type = "website",
  noindex = false,
  jsonLd,
}: SEOProps) => {
  const location = useLocation();
  const pagePath = path ?? location.pathname;
  const safePath = pagePath.startsWith("/") ? pagePath : `/${pagePath}`;
  const url = `${SITE_URL}${safePath === "/" ? "" : safePath}`;
  const absImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — ${SITE_TAGLINE}`;

  useEffect(() => {
    document.title = fullTitle;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noindex ? "noindex,nofollow" : "index,follow");

    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:image", absImage);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:site_name", SITE_NAME);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:site", TWITTER_HANDLE);
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", absImage);

    upsertLink("canonical", url);

    setPageJsonLd(jsonLd);

    return () => {
      // Clear page-level JSON-LD on unmount so it doesn't leak between routes.
      setPageJsonLd(undefined);
    };
  }, [fullTitle, description, url, absImage, type, noindex, jsonLd]);

  return null;
};

export default SEO;
