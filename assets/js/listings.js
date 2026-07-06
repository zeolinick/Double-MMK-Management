/* Double MMK Management — live listings from a Google Sheet
   ------------------------------------------------------------------
   Pulls available rentals from a published Google Sheet (CSV) and
   renders them into the listings grid — no backend, no login on the
   site, and no API key to leak (the sheet is published read-only).

   SETUP (see LISTINGS-SETUP.md for screenshots-level detail):
     1. Make a Google Sheet with this header row (row 1), any order:
          Status | Neighborhood | Address | Rent | Beds | Baths | Sqft | Type | Photo | Zillow
     2. Add one row per rental. Status = Available, Coming Soon, or Leased
        (Leased rows are hidden). Photo = an image URL. Zillow = the listing link.
     3. File -> Share -> Publish to web -> choose the sheet -> "Comma-separated
        values (.csv)" -> Publish. Copy the URL it gives you.
     4. Paste that URL between the quotes below, then commit/deploy.

   Until the URL is set, the page keeps showing the built-in sample cards.
   ------------------------------------------------------------------ */
(function (root) {
  "use strict";

  /* ===== PASTE YOUR PUBLISHED GOOGLE SHEET CSV URL HERE ===== */
  var SHEET_CSV_URL = "";
  /* e.g. "https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?gid=0&single=true&output=csv" */

  /* ---- inline icons (match the existing card markup) ---- */
  var SVG_BED  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 4v16"/><path d="M2 9h18a2 2 0 0 1 2 2v9"/><path d="M2 16h20"/><path d="M6 9v5"/></svg>';
  var SVG_BATH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.7s6 5.7 6 10.3a6 6 0 0 1-12 0c0-4.6 6-10.3 6-10.3z"/></svg>';
  var SVG_SQFT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';
  var SVG_ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
  var SVG_EXT  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>';

  /* ---- helpers ---- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function safeUrl(u) {
    u = String(u == null ? "" : u).trim();
    return (/^https?:\/\//i.test(u) || /^assets\//.test(u)) ? u : "";
  }
  function toInt(v) { var n = parseInt(String(v).replace(/[^0-9.]/g, ""), 10); return isNaN(n) ? 0 : n; }
  function toNum(v) { var n = parseFloat(String(v).replace(/[^0-9.]/g, "")); return isNaN(n) ? 0 : n; }
  function fmtNum(n) { return (Math.round(n * 10) / 10).toString().replace(/\.0$/, ""); }

  /* ---- CSV parser (handles quotes, commas & newlines inside cells) ---- */
  function parseCSV(text) {
    var rows = [], row = [], val = "", i = 0, inQ = false, c;
    text = String(text).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    while (i < text.length) {
      c = text.charAt(i);
      if (inQ) {
        if (c === '"') {
          if (text.charAt(i + 1) === '"') { val += '"'; i += 2; continue; }
          inQ = false; i++; continue;
        }
        val += c; i++; continue;
      }
      if (c === '"') { inQ = true; i++; continue; }
      if (c === ",") { row.push(val); val = ""; i++; continue; }
      if (c === "\n") { row.push(val); rows.push(row); row = []; val = ""; i++; continue; }
      val += c; i++;
    }
    if (val.length || row.length) { row.push(val); rows.push(row); }
    return rows;
  }

  function toObjects(matrix) {
    if (!matrix.length) return [];
    var header = matrix[0].map(function (h) { return String(h).trim().toLowerCase(); });
    var out = [];
    for (var r = 1; r < matrix.length; r++) {
      var cells = matrix[r];
      var blank = cells.every(function (x) { return String(x).trim() === ""; });
      if (blank) continue;
      var o = {};
      for (var c = 0; c < header.length; c++) o[header[c]] = cells[c] != null ? String(cells[c]).trim() : "";
      out.push(o);
    }
    return out;
  }

  /* map a sheet row to a listing (or null to skip) */
  function toListing(o) {
    function get() {
      for (var i = 0; i < arguments.length; i++) {
        var k = arguments[i];
        if (o[k] != null && String(o[k]).trim() !== "") return String(o[k]).trim();
      }
      return "";
    }
    var status = get("status", "availability").toLowerCase();
    if (/leased|rented|unavailable|not avail|inactive|hidden|sold|^off$|^no$/.test(status)) return null;
    var neighborhood = get("neighborhood", "city", "area");
    var address = get("address", "street", "full address");
    if (!neighborhood && !address) return null; // blank row
    return {
      comingSoon: /coming/.test(status),
      neighborhood: neighborhood,
      address: address,
      rent: toInt(get("rent", "price", "monthly rent")),
      beds: toNum(get("beds", "bed", "bedrooms")),
      baths: toNum(get("baths", "bath", "bathrooms")),
      sqft: toInt(get("sqft", "square feet", "sq ft", "size")),
      type: get("type", "property type").toLowerCase(),
      photo: safeUrl(get("photo", "photo url", "image", "img", "image url")),
      zillow: safeUrl(get("zillow", "zillow link", "link", "url", "listing url"))
    };
  }

  function cardHTML(L) {
    var city = L.neighborhood || L.address;
    var addr = L.address ? L.address : (L.neighborhood ? L.neighborhood + ", Detroit" : "Detroit");
    var priceMain = L.rent ? "$" + L.rent.toLocaleString() : "Ask";
    var priceSuffix = L.rent ? "/ mo" : "for pricing";
    var badgeCls = L.comingSoon ? "listing-badge listing-badge--rented" : "listing-badge";
    var badgeLabel = L.comingSoon ? "Coming Soon" : "Available";
    var photo = L.photo || "assets/img/il-house-a.svg";
    var alt = L.photo ? ("Photo of " + addr) : ("Illustration of a " + (L.neighborhood || "Detroit") + " property");

    var meta = "";
    if (L.beds)  meta += '<span>' + SVG_BED + ' ' + esc(fmtNum(L.beds)) + ' bed</span>';
    if (L.baths) meta += '<span>' + SVG_BATH + ' ' + esc(fmtNum(L.baths)) + ' bath</span>';
    if (L.sqft)  meta += '<span>' + SVG_SQFT + ' ' + esc(L.sqft.toLocaleString()) + ' sqft</span>';

    var zillow = L.zillow
      ? '<a class="listing-zillow" href="' + esc(L.zillow) + '" target="_blank" rel="noopener">View on Zillow ' + SVG_EXT + '</a>'
      : '';

    return '<article class="listing" data-listing data-type="' + esc(L.type) + '" data-beds="' + Math.floor(L.beds) + '" data-price="' + L.rent + '" data-city="' + esc(city) + '">'
      + '<div class="listing-photo"><span class="' + badgeCls + '">' + badgeLabel + '</span>'
      + '<img src="' + esc(photo) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async" /></div>'
      + '<div class="listing-body">'
      + '<div class="listing-price">' + esc(priceMain) + '<span> ' + esc(priceSuffix) + '</span></div>'
      + '<div class="listing-addr">' + esc(addr) + '</div>'
      + (meta ? '<div class="listing-meta">' + meta + '</div>' : '')
      + '<div class="listing-actions' + (zillow ? ' listing-actions--dual' : '') + '">'
      + '<a class="listing-ask" href="#inquire" data-ask>Ask about this home ' + SVG_ARROW + '</a>'
      + zillow
      + '</div>'
      + '</div></article>';
  }

  /* ---- DOM: render listings into the grid, keep filter/count in sync ---- */
  function render(listings) {
    var grid = document.querySelector(".listing-grid");
    if (!grid) return;
    grid.innerHTML = listings.map(cardHTML).join("");

    var note = document.getElementById("listing-source-note");
    if (note) note.style.display = "none";

    var count = document.getElementById("listing-count");
    if (count) count.textContent = listings.length + (listings.length === 1 ? " property" : " properties");

    var filter = document.getElementById("listing-filter");
    if (filter) {
      filter.dispatchEvent(new Event("input", { bubbles: true })); // re-runs the filter over the new cards
    } else {
      var empty = document.getElementById("listing-empty");
      if (empty) empty.classList.toggle("hide", listings.length !== 0);
    }
  }

  function init() {
    if (!SHEET_CSV_URL || !document.querySelector(".listing-grid")) return; // not configured / not the listings page
    fetch(SHEET_CSV_URL, { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
      .then(function (text) {
        var objs = toObjects(parseCSV(text));
        if (!objs.length) return; // header only / empty sheet -> keep the sample cards
        var listings = [];
        for (var i = 0; i < objs.length; i++) { var L = toListing(objs[i]); if (L) listings.push(L); }
        render(listings); // may be [] if everything is Leased -> shows the empty state
      })
      .catch(function (err) { if (root.console) root.console.warn("Live listings not loaded:", err && err.message); });
  }

  if (typeof document !== "undefined") init(); // script is deferred, so the DOM is ready

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { parseCSV: parseCSV, toObjects: toObjects, toListing: toListing, cardHTML: cardHTML };
  }
})(typeof window !== "undefined" ? window : this);
