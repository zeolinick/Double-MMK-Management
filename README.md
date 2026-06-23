# Double MMK Management — Website

Marketing and resident website for **Double MMK Management**, a full-service
property management company based in Detroit, Michigan.

Built as a fast, lightweight **static site** (HTML / CSS / vanilla JS) — no build
step, no dependencies. It can be hosted for free on GitHub Pages, Netlify,
Cloudflare Pages, or any static host.

## Pages

| File            | Purpose |
|-----------------|---------|
| `index.html`    | Home — hero, services overview, why-us, featured listings, testimonials |
| `owners.html`   | For Owners — benefits, pricing, **free rental analysis lead form**, FAQ |
| `services.html` | Detailed service breakdown |
| `listings.html` | Available rentals with a working client-side filter |
| `tenants.html`  | Resident hub — **Landlord Studio** portal links + maintenance request form |
| `about.html`    | Company story, values, team |
| `contact.html`  | Contact info + message form + map placeholder |

## Brand

Implements the official **Double MMK brand kit** ("Detroit property, managed right.").

- **Style:** bold, dependable, Detroit — lead with Onyx + Paper, reserve red for emphasis
- **Colors** (CSS variables in `assets/css/style.css`):
  - Signal Red `#c8202a` (primary/emphasis) · Oxblood `#6e1015` · Onyx `#0f0f11`
  - Carbon `#1c1c20` · Steel `#8c8c92` · Platinum `#c9c9cf` · Paper `#f6f5f3`
- **Fonts:** Archivo (display/headlines, 600–900) + Hanken Grotesk (body), via Google Fonts
- **Logo:** vector brand assets — emblem `assets/img/logo-emblem.svg`, "D" monogram
  favicon `assets/img/favicon.svg`, social/OG image `assets/img/og-image.svg`. The
  header/footer pair the emblem with the silver "DOUBLE MMK" / red "MANAGEMENT LLC" wordmark.

## How to view locally

Just open `index.html` in a browser, or run a tiny local server:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Things to customize before launch

Search the project for these placeholders and replace them:

1. **Contact details** — phone `(313) 555-0142`, email `hello@doublemmk.com`,
   and the Detroit office address (in every page footer + `contact.html`).
2. **Landlord Studio portal links** — in `tenants.html`, the "Pay Rent" and
   "Tenant Portal Login" buttons use `href="#"`. Replace with your Landlord
   Studio tenant portal URL (look for the `TODO` comments).
3. **Logo & photos** — replace `assets/img/logo.svg` and the `📷` placeholder
   blocks with real imagery (Detroit neighborhoods, properties, your team).
4. **Listings** — `listings.html` and the homepage use sample properties.
   Update manually, or wire up a live feed from Landlord Studio.
5. **Stats & testimonials** — replace sample numbers and quotes with real ones.
6. **Pricing** — `owners.html` shows sample management fees; confirm your rates.
7. **Forms** — currently show a confirmation message but don't send anywhere.
   Connect them to a real handler (see below).
8. **Social links & map** — footer social icons and the `contact.html` map are
   placeholders.

## Connecting the forms

The forms (`data-demo` attribute) are front-end only. To receive submissions,
point them at a form service — e.g. [Formspree](https://formspree.io) or
[Netlify Forms](https://docs.netlify.com/forms/setup/):

```html
<!-- Formspree example -->
<form action="https://formspree.io/f/your-id" method="POST">
```

Then remove the `data-demo` attribute so the browser submits normally.

## Deploying

**GitHub Pages (automated):** a workflow at `.github/workflows/deploy-pages.yml`
deploys the site automatically. One-time setup: in the repo go to
**Settings → Pages → Build and deployment → Source: "GitHub Actions"**. After
that, every push to this branch (or `main`) publishes a live preview URL, shown
in the Actions run and under Settings → Pages.

**Netlify / Cloudflare Pages:** connect the repo, no build command, publish
directory `/`.

### Set your domain

The site uses `https://www.doublemmk.com` as a placeholder in several SEO files.
Once you know the final domain, update it in:

- `sitemap.xml` and `robots.txt`
- the `og:`/`twitter:`/`canonical` tags in each `*.html` `<head>`
- the JSON-LD block in `index.html`

## SEO & sharing

Already included: per-page titles & descriptions, Open Graph + Twitter cards
(with a branded share image at `assets/img/og-image.svg`), `sitemap.xml`,
`robots.txt`, a `RealEstateAgent` JSON-LD block on the home page, and a custom
`404.html`. For best social-preview compatibility, export `og-image.svg` to a
1200×630 **PNG** and update the `og:image` / `twitter:image` URLs.

---

© Double MMK Management · Detroit, Michigan · Equal Housing Opportunity
