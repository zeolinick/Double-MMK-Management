# Live listings — how to add & manage rentals

Your `listings.html` page can pull available rentals straight from a **Google
Sheet you control**. You add a row, the website updates — no code, no login on
the website, and no API key (the sheet is published read-only, so nothing
secret is ever exposed).

Each listing shows a photo, price, beds/baths/sqft, and a **“View on Zillow”**
button that opens the full Zillow listing. Until you connect a sheet, the page
keeps showing the built-in sample cards, so nothing breaks in the meantime.

> **About the Zillow link:** Zillow has no public feed we can legally pull
> photos/price from, so the Zillow link becomes a **button** on each card.
> You enter the card’s basic info once (below); the button sends renters to
> the full Zillow listing for the rest.

---

## The 4 steps

### 1. Create the Google Sheet
Make a new Google Sheet and put these **column headers in row 1** (any order,
capitalization doesn’t matter):

```
Status | Neighborhood | Address | Rent | Beds | Baths | Sqft | Type | Photo | Zillow
```

Then add **one row per rental**. Example:

| Status | Neighborhood | Address | Rent | Beds | Baths | Sqft | Type | Photo | Zillow |
|--------|--------------|---------|------|------|-------|------|------|-------|--------|
| Available | Corktown | 123 Bagley St | 1600 | 3 | 2 | 1650 | House | | https://zillow.com/… |
| Coming Soon | Midtown | | 950 | 1 | 1 | 700 | Apartment | | https://zillow.com/… |
| Leased | Bagley | | 1250 | 2 | 1 | 1050 | Duplex | | |

### 2. Publish the sheet as CSV
In Google Sheets: **File → Share → Publish to web** → in the dialog pick your
sheet tab and choose **“Comma-separated values (.csv)”** → click **Publish** →
copy the link it gives you (it looks like
`https://docs.google.com/spreadsheets/d/e/2PACX-…/pub?gid=0&single=true&output=csv`).

> “Publish to web” only shares the columns above (all public listing info). It
> does **not** share your whole Google account or other sheets.

### 3. Paste the link into the site
Open **`assets/js/listings.js`** and paste your link between the quotes near the
top:

```js
var SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-…/output=csv";
```

### 4. Save & deploy
Commit/push (or re-upload). Done — `listings.html` now shows your live rentals.

---

## Column reference

| Column | Required? | What to put |
|--------|-----------|-------------|
| **Status** | recommended | `Available`, `Coming Soon`, or `Leased`. **Leased rows are hidden** from the site. Blank = treated as Available. |
| **Neighborhood** | yes* | e.g. `Corktown`. Used for the address line and the neighborhood filter. |
| **Address** | optional | Street address if you want it shown; otherwise the card shows “Neighborhood, Detroit”. |
| **Rent** | recommended | Monthly rent. `1600` or `$1,600` both work. Blank shows “Ask for pricing”. |
| **Beds** | recommended | e.g. `3`. Drives the “min bedrooms” filter. |
| **Baths** | recommended | e.g. `1.5`. |
| **Sqft** | optional | e.g. `1650`. |
| **Type** | recommended | `House`, `Apartment`, or `Duplex` (matches the property-type filter). |
| **Photo** | optional | An image URL. Leave blank to show a clean house illustration + the Zillow button. To show a real photo, drop the image into `assets/img/listings/` and put `assets/img/listings/yourphoto.jpg`, or paste any public image URL. |
| **Zillow** | optional | The Zillow listing link. When present, the card gets a “View on Zillow” button. |

\* Provide **Neighborhood or Address** — a row with neither is treated as blank and skipped.

---

## Good to know

- **Updates aren’t always instant.** Google caches a published sheet for a few
  minutes, so a new row can take ~5 minutes to appear. A hard refresh helps.
- **Removing a listing:** set its **Status to `Leased`** (keeps the record) or
  delete the row.
- **Order:** cards appear in the same order as the sheet rows — put featured
  homes near the top.
- **Nothing to break:** if the sheet is empty, unreachable, or the link isn’t
  set yet, the page falls back to the sample cards automatically.

## Prefer Airtable instead of Google Sheets?
That’s possible too, but Airtable’s API needs a token in the page (a minor
exposure even when read-only), whereas a published Google Sheet needs none —
which is why we set it up with Sheets. If you’d rather use Airtable for its
nicer interface, tell Nick/your developer and it’s a small change.
