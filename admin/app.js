/* Double MMK — Site Manager
   Buildless admin: Supabase Auth + listings/content CRUD + photo upload.
   Loads supabase-js from a CDN (ESM); the public site itself uses no library. */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cfg = window.DMMK || {};
const configured = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && cfg.SUPABASE_ANON_KEY.indexOf("PASTE_") !== 0;
const supabase = configured ? createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;

const $ = (id) => document.getElementById(id);
const show = (el, on = true) => { el.hidden = !on; };
function flash(el, text, kind) {
  el.textContent = text;
  el.className = "msg show " + (kind === "err" ? "msg--err" : "msg--ok");
  if (kind !== "err") setTimeout(() => el.classList.remove("show"), 3500);
}
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ============================ AUTH ============================ */
const loginView = $("login-view");
const appView = $("app-view");

async function refreshSession() {
  if (!supabase) { // no backend configured yet — still let the owner see the UI shell
    show(loginView, false); show(appView, true);
    $("config-banner").hidden = false;
    $("who-email").textContent = "(offline preview)";
    return;
  }
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    show(loginView, false); show(appView, true);
    $("who-email").textContent = data.session.user.email || "";
    loadListings(); loadContent();
  } else {
    show(loginView, true); show(appView, false);
  }
}

$("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const err = $("login-error"); err.classList.remove("show");
  const btn = $("login-btn"); const orig = btn.textContent;
  if (!supabase) { flash(err, "Backend isn't connected yet. Add your Supabase key to go live.", "err"); return; }
  btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Signing in…';
  const { error } = await supabase.auth.signInWithPassword({ email: $("email").value.trim(), password: $("password").value });
  btn.disabled = false; btn.textContent = orig;
  if (error) { flash(err, error.message || "Sign-in failed. Check your email and password.", "err"); return; }
  refreshSession();
});

$("signout").addEventListener("click", async () => { if (supabase) await supabase.auth.signOut(); refreshSession(); });

/* ============================ TABS ============================ */
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    $("tab-" + tab.dataset.tab).classList.add("active");
  });
});

/* modal helpers */
function openModal(id) { $(id).classList.add("show"); }
function closeModal(id) { $(id).classList.remove("show"); }
document.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", (e) => e.target.closest(".modal").classList.remove("show")));
document.querySelectorAll(".modal").forEach((m) => m.addEventListener("click", (e) => { if (e.target === m) m.classList.remove("show"); }));

/* ============================ LISTINGS ============================ */
const badgeFor = (s) => {
  s = String(s || "").toLowerCase();
  if (s.indexOf("coming") === 0 || /coming/.test(s)) return '<span class="badge badge--coming">Coming soon</span>';
  if (/leased|rented/.test(s)) return '<span class="badge badge--leased">Leased</span>';
  return '<span class="badge badge--available">Available</span>';
};

async function loadListings() {
  if (!supabase) return;
  const msg = $("listings-msg");
  const { data, error } = await supabase.from("listings").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false });
  if (error) { flash(msg, "Couldn't load listings: " + error.message, "err"); return; }
  renderListings(data || []);
}

function renderListings(rows) {
  const list = $("listings-list");
  $("listings-count").textContent = rows.length + (rows.length === 1 ? " property" : " properties");
  if (!rows.length) { list.innerHTML = '<div class="empty">No properties yet. Click <b>+ Add property</b> to create your first listing.</div>'; return; }
  list.innerHTML = rows.map((r) => {
    const title = esc(r.address || r.neighborhood || "Untitled");
    const bits = [];
    if (r.rent) bits.push("$" + Number(r.rent).toLocaleString() + "/mo");
    if (r.beds) bits.push(r.beds + " bd");
    if (r.baths) bits.push(r.baths + " ba");
    if (r.neighborhood && r.address) bits.push(esc(r.neighborhood));
    const img = r.photo_url ? `<img src="${esc(r.photo_url)}" alt="" />` : `<div class="noimg">No photo</div>`;
    return `<div class="item" data-id="${esc(r.id)}">
      ${img}
      <div><div class="t">${title} ${badgeFor(r.status)}</div><div class="m">${bits.join(" · ") || "—"}</div></div>
      <div class="acts">
        <button class="btn btn--sm" data-edit="${esc(r.id)}">Edit</button>
        <button class="btn btn--sm btn--danger" data-del="${esc(r.id)}">Delete</button>
      </div>
    </div>`;
  }).join("");
  list.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => editListing(b.dataset.edit, rows)));
  list.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => deleteListing(b.dataset.del, rows)));
}

let selectedFile = null;
$("l-photo").addEventListener("change", (e) => {
  selectedFile = e.target.files[0] || null;
  const prev = $("l-photo-preview");
  if (selectedFile) { prev.src = URL.createObjectURL(selectedFile); prev.classList.add("show"); }
  else prev.classList.remove("show");
});

function blankListingForm() {
  $("listing-modal-title").textContent = "Add property";
  $("l-id").value = ""; $("l-status").value = "Available"; $("l-type").value = "";
  $("l-neighborhood").value = ""; $("l-address").value = "";
  $("l-rent").value = ""; $("l-beds").value = ""; $("l-baths").value = ""; $("l-sqft").value = "";
  $("l-sort").value = "0"; $("l-zillow").value = "";
  $("l-photo").value = ""; selectedFile = null; $("l-photo-preview").classList.remove("show");
}
$("add-listing").addEventListener("click", () => { blankListingForm(); openModal("listing-modal"); });

function editListing(id, rows) {
  const r = rows.find((x) => String(x.id) === String(id)); if (!r) return;
  blankListingForm();
  $("listing-modal-title").textContent = "Edit property";
  $("l-id").value = r.id; $("l-status").value = r.status || "Available"; $("l-type").value = r.type || "";
  $("l-neighborhood").value = r.neighborhood || ""; $("l-address").value = r.address || "";
  $("l-rent").value = r.rent ?? ""; $("l-beds").value = r.beds ?? ""; $("l-baths").value = r.baths ?? ""; $("l-sqft").value = r.sqft ?? "";
  $("l-sort").value = r.sort_order ?? 0; $("l-zillow").value = r.zillow_url || "";
  if (r.photo_url) { const p = $("l-photo-preview"); p.src = r.photo_url; p.classList.add("show"); }
  openModal("listing-modal");
}

/* client-side downscale so raw phone photos don't bloat pages */
async function downscale(file, max = 1600, quality = 0.82) {
  if (!/^image\//.test(file.type)) return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  let { width, height } = bitmap;
  if (Math.max(width, height) > max) {
    const s = max / Math.max(width, height);
    width = Math.round(width * s); height = Math.round(height * s);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
  const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", quality));
  return blob || file;
}

async function uploadPhoto(file) {
  const blob = await downscale(file);
  const stamp = Date.now() + "-" + Math.floor(Math.random() * 1e6);
  const path = "listings/" + stamp + ".jpg";
  const { error } = await supabase.storage.from("listing-photos").upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw error;
  return supabase.storage.from("listing-photos").getPublicUrl(path).data.publicUrl;
}

$("listing-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!supabase) return;
  const btn = $("listing-save"); const orig = btn.textContent;
  btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Saving…';
  try {
    let photoUrl;
    if (selectedFile) photoUrl = await uploadPhoto(selectedFile);
    const numOrNull = (v) => (v === "" || v == null ? null : Number(v));
    const rec = {
      status: $("l-status").value,
      type: $("l-type").value || null,
      neighborhood: $("l-neighborhood").value.trim(),
      address: $("l-address").value.trim() || null,
      rent: numOrNull($("l-rent").value),
      beds: numOrNull($("l-beds").value),
      baths: numOrNull($("l-baths").value),
      sqft: numOrNull($("l-sqft").value),
      sort_order: numOrNull($("l-sort").value) ?? 0,
      zillow_url: $("l-zillow").value.trim() || null
    };
    if (photoUrl) rec.photo_url = photoUrl;
    const id = $("l-id").value;
    const { error } = id
      ? await supabase.from("listings").update(rec).eq("id", id)
      : await supabase.from("listings").insert(rec);
    if (error) throw error;
    closeModal("listing-modal");
    flash($("listings-msg"), "Saved.", "ok");
    loadListings();
  } catch (err) {
    flash($("listings-msg"), "Couldn't save: " + (err.message || err), "err");
  } finally {
    btn.disabled = false; btn.textContent = orig;
  }
});

async function deleteListing(id, rows) {
  const r = rows.find((x) => String(x.id) === String(id));
  if (!confirm('Delete "' + (r ? (r.address || r.neighborhood) : "this property") + '"? This cannot be undone.')) return;
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) { flash($("listings-msg"), "Couldn't delete: " + error.message, "err"); return; }
  flash($("listings-msg"), "Deleted.", "ok");
  loadListings();
}

/* ============================ SITE CONTENT ============================ */
async function loadContent() {
  if (!supabase) return;
  const { data, error } = await supabase.from("site_content").select("*").order("key", { ascending: true });
  if (error) { flash($("content-msg"), "Couldn't load content: " + error.message, "err"); return; }
  renderContent(data || []);
}
function renderContent(rows) {
  const list = $("content-list");
  if (!rows.length) { list.innerHTML = '<div class="empty">No content blocks yet. These let you edit page text and images without code.</div>'; return; }
  list.innerHTML = rows.map((r) => `<div class="item" style="grid-template-columns:1fr auto">
    <div><div class="t">${esc(r.key)}</div><div class="m">${esc(String(r.value || "").slice(0, 80))}</div></div>
    <div class="acts">
      <button class="btn btn--sm" data-cedit="${esc(r.key)}">Edit</button>
      <button class="btn btn--sm btn--danger" data-cdel="${esc(r.key)}">Delete</button>
    </div></div>`).join("");
  list.querySelectorAll("[data-cedit]").forEach((b) => b.addEventListener("click", () => editContent(b.dataset.cedit, rows)));
  list.querySelectorAll("[data-cdel]").forEach((b) => b.addEventListener("click", () => deleteContent(b.dataset.cdel)));
}
$("add-content").addEventListener("click", () => {
  $("content-modal-title").textContent = "Add content block";
  $("c-key").value = ""; $("c-key").disabled = false; $("c-value").value = "";
  openModal("content-modal");
});
function editContent(key, rows) {
  const r = rows.find((x) => x.key === key); if (!r) return;
  $("content-modal-title").textContent = "Edit content block";
  $("c-key").value = r.key; $("c-key").disabled = true; $("c-value").value = r.value || "";
  openModal("content-modal");
}
$("content-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!supabase) return;
  const btn = $("content-save"); const orig = btn.textContent;
  btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Saving…';
  const rec = { key: $("c-key").value.trim(), value: $("c-value").value };
  const { error } = await supabase.from("site_content").upsert(rec, { onConflict: "key" });
  btn.disabled = false; btn.textContent = orig;
  if (error) { flash($("content-msg"), "Couldn't save: " + error.message, "err"); return; }
  closeModal("content-modal");
  flash($("content-msg"), "Saved.", "ok");
  loadContent();
});
async function deleteContent(key) {
  if (!confirm('Delete content block "' + key + '"?')) return;
  const { error } = await supabase.from("site_content").delete().eq("key", key);
  if (error) { flash($("content-msg"), "Couldn't delete: " + error.message, "err"); return; }
  loadContent();
}

/* ============================ BOOT ============================ */
refreshSession();
