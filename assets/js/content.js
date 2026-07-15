/* Double MMK Management — editable site content from Supabase
   ------------------------------------------------------------------
   Elements opt in with one of:
     data-content="<key>"       -> replaces the element's text
     data-content-src="<key>"   -> replaces an <img> src (image blocks)
     data-content-href="<key>"  -> replaces a link/href
   Values come from the `site_content` table (key/value). If a key has no
   row (or the fetch fails), the hardcoded default in the HTML is kept — so
   this can never blank out the page. The owner edits these in /admin.
   ------------------------------------------------------------------ */
(function (root) {
  "use strict";
  var cfg = root.DMMK || {};
  var url = cfg.SUPABASE_URL, key = cfg.SUPABASE_ANON_KEY;
  if (!url || !key || key.indexOf("PASTE_") === 0) return; // backend not wired
  var nodes = document.querySelectorAll("[data-content],[data-content-src],[data-content-href]");
  if (!nodes.length) return; // nothing on this page is editable

  fetch(url.replace(/\/$/, "") + "/rest/v1/site_content?select=key,value", {
    headers: { apikey: key, Authorization: "Bearer " + key },
    cache: "no-store"
  })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (rows) {
      var map = {};
      for (var i = 0; i < rows.length; i++) map[rows[i].key] = rows[i].value;
      nodes.forEach(function (el) {
        var t = el.getAttribute("data-content");
        var s = el.getAttribute("data-content-src");
        var h = el.getAttribute("data-content-href");
        if (t && map[t] != null && String(map[t]) !== "") el.textContent = map[t];
        if (s && map[s] != null && String(map[s]) !== "") el.setAttribute("src", map[s]);
        if (h && map[h] != null && String(map[h]) !== "") el.setAttribute("href", map[h]);
      });
    })
    .catch(function (err) { if (root.console) root.console.warn("Site content not loaded:", err && err.message); });
})(typeof window !== "undefined" ? window : this);
