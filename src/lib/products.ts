/**
 * Canonical product catalog for Linea.
 *
 * Previously the ProductCarousel listed mock products with numeric ids and
 * linked to /product/${id}, while ProductDetail rendered the URL slug as a
 * title — but the visible breadcrumbs and ProductInfo body were hardcoded to
 * "Earrings > Pantheon" regardless of which product the user was viewing.
 * Result: visiting /product/halo showed "Halo" in the document title but
 * "Pantheon" in the page heading, with mismatched category, price, and copy.
 *
 * This module centralizes the catalog so every consumer (carousel, detail
 * page, breadcrumbs, JSON-LD) reads the same source of truth. Slugs are URL
 * safe and stable; the carousel links to /product/<slug>, and ProductDetail
 * looks up the product by that slug.
 */
import pantheonImage from "@/assets/pantheon.jpg";
import eclipseImage from "@/assets/eclipse.jpg";
import haloImage from "@/assets/halo.jpg";
import obliqueImage from "@/assets/oblique.jpg";
import lintelImage from "@/assets/lintel.jpg";
import shadowlineImage from "@/assets/shadowline.jpg";
import organicEarring from "@/assets/organic-earring.png";
import linkBracelet from "@/assets/link-bracelet.png";

export type ProductCategory =
  | "Rings"
  | "Earrings"
  | "Bracelets"
  | "Necklaces";

export interface Product {
  /** URL slug used in /product/:productId and /category links. */
  slug: string;
  /** Numeric id retained for legacy code that still references it. */
  id: number;
  name: string;
  category: ProductCategory;
  /** Lower-case category slug (matches /category/:category routes). */
  categorySlug: string;
  /** Display price string. Keep parsing-friendly: '€2,850'. */
  price: string;
  /** EUR amount as a number, for cart math without re-parsing the string. */
  priceEUR: number;
  image: string;
  lifestyleImage: string;
  blurb: string;
  material: string;
  dimensions: string;
  weight: string;
  /** Short editor's note rendered in italics on the detail page. */
  editorsNote: string;
  /** When true the carousel decorates with a "NEW" pill. */
  isNew?: boolean;
}

export const PRODUCTS: Product[] = [
  {
    slug: "pantheon",
    id: 1,
    name: "Pantheon",
    category: "Earrings",
    categorySlug: "earrings",
    price: "€2,850",
    priceEUR: 2850,
    image: pantheonImage,
    lifestyleImage: organicEarring,
    blurb:
      "Architectural drop earrings inspired by classical columns and the play of light through stone.",
    material: "18k Gold Plated Sterling Silver",
    dimensions: "2.5cm x 1.2cm",
    weight: "4.2g per earring",
    editorsNote:
      "A modern interpretation of classical architecture, these earrings bridge timeless elegance with contemporary minimalism.",
    isNew: true,
  },
  {
    slug: "eclipse",
    id: 2,
    name: "Eclipse",
    category: "Bracelets",
    categorySlug: "bracelets",
    price: "€3,200",
    priceEUR: 3200,
    image: eclipseImage,
    lifestyleImage: linkBracelet,
    blurb:
      "A whisper-thin bracelet that traces the wrist like the shadow line of an eclipse.",
    material: "18k Gold Plated Sterling Silver",
    dimensions: "16cm — adjustable",
    weight: "6.8g",
    editorsNote:
      "Designed for layering, Eclipse rests quietly against the wrist with a single sculpted highlight.",
  },
  {
    slug: "halo",
    id: 3,
    name: "Halo",
    category: "Earrings",
    categorySlug: "earrings",
    price: "€1,950",
    priceEUR: 1950,
    image: haloImage,
    lifestyleImage: organicEarring,
    blurb:
      "Polished hoop earrings drawn from the perfect curvature of a Brâncuși line.",
    material: "Recycled Sterling Silver",
    dimensions: "1.8cm diameter",
    weight: "3.4g per earring",
    editorsNote:
      "An everyday hoop reduced to its essentials — weightless on the ear, deliberate in the mirror.",
    isNew: true,
  },
  {
    slug: "oblique",
    id: 4,
    name: "Oblique",
    category: "Earrings",
    categorySlug: "earrings",
    price: "€1,650",
    priceEUR: 1650,
    image: obliqueImage,
    lifestyleImage: organicEarring,
    blurb:
      "Asymmetric studs that catch the light from one angle only — a quiet statement.",
    material: "18k Gold Plated Sterling Silver",
    dimensions: "1.4cm x 0.8cm",
    weight: "2.1g per earring",
    editorsNote:
      "Best worn slightly off-axis. Oblique rewards the gaze that lingers.",
  },
  {
    slug: "lintel",
    id: 5,
    name: "Lintel",
    category: "Earrings",
    categorySlug: "earrings",
    price: "€2,250",
    priceEUR: 2250,
    image: lintelImage,
    lifestyleImage: organicEarring,
    blurb:
      "A horizontal bar earring borrowing the load-bearing geometry of an architrave.",
    material: "Solid 14k Gold",
    dimensions: "2.0cm x 0.4cm",
    weight: "3.0g per earring",
    editorsNote:
      "Structural without weight — Lintel rests level across the lobe, a steady line.",
  },
  {
    slug: "shadowline",
    id: 6,
    name: "Shadowline",
    category: "Bracelets",
    categorySlug: "bracelets",
    price: "€3,950",
    priceEUR: 3950,
    image: shadowlineImage,
    lifestyleImage: linkBracelet,
    blurb:
      "A linked cuff that follows the wrist's contour the way light follows an edge.",
    material: "Solid 14k Gold",
    dimensions: "17cm — adjustable",
    weight: "12.4g",
    editorsNote:
      "Layer it with Eclipse or wear it alone. Shadowline is the bracelet you forget you put on.",
  },
];

const PRODUCTS_BY_SLUG = new Map(PRODUCTS.map((p) => [p.slug, p]));

export function getProductBySlug(slug: string | undefined | null): Product | null {
  if (!slug) return null;
  return PRODUCTS_BY_SLUG.get(slug) ?? null;
}

export function getRelatedProducts(slug: string, limit = 6): Product[] {
  const current = getProductBySlug(slug);
  if (!current) return PRODUCTS.slice(0, limit);
  const sameCategory = PRODUCTS.filter(
    (p) => p.slug !== slug && p.category === current.category,
  );
  const others = PRODUCTS.filter(
    (p) => p.slug !== slug && p.category !== current.category,
  );
  return [...sameCategory, ...others].slice(0, limit);
}
