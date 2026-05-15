# Linea

Minimalist jewelry e-commerce storefront for curated collections, product detail pages, cart review, checkout, and brand content.

## Tech Stack

- Vite
- React 18 + TypeScript
- Tailwind CSS
- shadcn/ui (Radix UI primitives)
- React Router
- next-themes (dark mode)
- sonner (toast notifications)

## Local Development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

## Lint

```sh
npm run lint
```

## Production-Readiness

This project ships with:

- **Per-page SEO** — centralized `src/components/SEO.tsx` injects per-route
  `<title>`, description, canonical, Open Graph, Twitter card, and `robots`
  meta. Update the single `SITE_URL` constant in that file when a real domain
  is provisioned.
- **Structured data** — site-level Organization, WebSite, and Store JSON-LD in
  `index.html`; per-route Product JSON-LD on product pages.
- **Dark mode** — `next-themes`-backed `ThemeProvider` plus an anti-FOUC
  bootstrap in `index.html` that toggles the `.dark` class before paint.
- **Sitemap & robots** — `public/sitemap.xml` listing public routes and
  `public/robots.txt` excluding `/checkout` from crawlers.
- **Accessibility** — keyboard-skip link to `#main-content`, ARIA-labelled
  primary navigation and footer, controlled-input contact form with `role="alert"`
  errors and `aria-invalid`/`aria-describedby` wiring.
- **Contact form** — `/about/customer-care` form is wired with client-side
  validation, sonner toast feedback, and a graceful `mailto:` fallback when
  `VITE_CONTACT_FORM_ENDPOINT` is unset.

### Environment variables

| Variable                       | Purpose                                                      |
| ------------------------------ | ------------------------------------------------------------ |
| `VITE_CONTACT_FORM_ENDPOINT`   | POST endpoint for the customer care form. Unset → mailto fallback. |
