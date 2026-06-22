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

- **Style:** warm & approachable, Detroit-inspired
- **Colors** (defined as CSS variables in `assets/css/style.css`):
  - Navy `#16324f` (primary) · Amber `#e0922f` (accent) · Terracotta `#c0563b`
  - Cream `#fbf7f1` background · Sand `#f2ebe1` alt surface
- **Fonts:** Poppins (headings) + Inter (body), loaded from Google Fonts
- **Logo:** placeholder mark at `assets/img/logo.svg` — swap with the real logo

## How to view locally

Just open `index.html` in a browser, or run a tiny local server:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Things to customize before launch

Search the project for these placeholders and replace them:

1. **Contact details** — phone `(313) 555-0100`, email `info@doublemmk.com`,
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

**GitHub Pages:** push to GitHub → Settings → Pages → deploy from the branch
root. **Netlify / Cloudflare Pages:** connect the repo, no build command, publish
directory `/`.

---

© Double MMK Management · Detroit, Michigan · Equal Housing Opportunity
