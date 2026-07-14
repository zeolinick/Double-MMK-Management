/* Double MMK Management — site interactions
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  /* ============================================================
     SET THIS to your free Web3Forms access key to start receiving
     real leads by email. Get one in 30 seconds at https://web3forms.com
     (enter Doublemmkmanagement@gmail.com, copy the key it emails you,
     and paste it below). Until it's set, forms show the confirmation
     message but do NOT send anything.
     ============================================================ */
  var WEB3FORMS_KEY = "REPLACE_WITH_YOUR_WEB3FORMS_ACCESS_KEY";

  /* ---- Active nav: owned by immersive.js (hash-aware + aria-current) ---- */

  /* ---- Mobile nav toggle ---- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("menu-open", open);
    });
    // close menu when a link is tapped (mobile)
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && window.innerWidth <= 1200) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
      }
    });
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll(".faq-q").forEach(function (q) {
    q.addEventListener("click", function () {
      var item = q.closest(".faq-item");
      var answer = item.querySelector(".faq-a");
      var isOpen = item.classList.toggle("open");
      q.setAttribute("aria-expanded", isOpen ? "true" : "false");
      answer.style.maxHeight = isOpen ? answer.scrollHeight + "px" : null;
    });
  });
  // keep open answers un-clipped when the viewport re-wraps (e.g. rotation)
  window.addEventListener("resize", function () {
    document.querySelectorAll(".faq-item.open .faq-a").forEach(function (a) { a.style.maxHeight = a.scrollHeight + "px"; });
  }, { passive: true });

  /* ---- Reveal on scroll: handled by immersive.js ---- */

  /* ---- Back to top ---- */
  var toTop = document.createElement("button");
  toTop.className = "to-top";
  toTop.setAttribute("aria-label", "Back to top");
  toTop.innerHTML = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
  document.body.appendChild(toTop);
  toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  window.addEventListener("scroll", function () { toTop.classList.toggle("show", window.scrollY > 600); }, { passive: true });

  /* ---- Sub-nav scrollspy ---- */
  var subnav = document.querySelector(".subnav");
  if (subnav && "IntersectionObserver" in window) {
    var slinks = Array.prototype.slice.call(subnav.querySelectorAll("a"));
    var smap = {};
    slinks.forEach(function (a) { var id = (a.getAttribute("href") || "").slice(1); if (document.getElementById(id)) smap[id] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          slinks.forEach(function (l) { l.classList.remove("active"); });
          if (smap[e.target.id]) smap[e.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    Object.keys(smap).forEach(function (id) { spy.observe(document.getElementById(id)); });
  }

  /* ---- Condense header on scroll ---- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 16); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- Animated count-up for stats ---- */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function countUp(el) {
    var raw = el.getAttribute("data-count") || el.textContent;
    el.setAttribute("data-count", raw);
    var m = raw.match(/^([\d.]+)([^\d]*)$/);
    if (!m) return;
    if (reduceMotion) { el.textContent = raw; return; }
    var target = parseFloat(m[1]);
    var suffix = m[2];
    var decimals = (m[1].indexOf(".") !== -1) ? 1 : 0;
    var start = null, dur = 1400;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = m[1] + suffix;
    }
    requestAnimationFrame(frame);
  }
  var counters = document.querySelectorAll(".hero-trust strong, .stats .stat strong");
  if ("IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---- Form handling: real delivery via Web3Forms when a key is set,
          graceful confirmation-only fallback until then. ---- */
  var keyReady = WEB3FORMS_KEY && WEB3FORMS_KEY.indexOf("REPLACE_") !== 0;
  function showSuccess(form) {
    var success = form.querySelector(".form-success");
    if (success) {
      success.classList.add("show");
      success.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    form.reset();
  }
  document.querySelectorAll("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!keyReady) { showSuccess(form); return; }
      var btn = form.querySelector("button[type=submit]");
      var orig = btn ? btn.innerHTML : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      var data = new FormData(form);
      data.append("access_key", WEB3FORMS_KEY);
      data.append("subject", "New website lead — Double MMK Management");
      data.append("from_name", "Double MMK Website");
      fetch("https://api.web3forms.com/submit", { method: "POST", body: data })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res.success) { showSuccess(form); }
          else { alert("Sorry — something went wrong sending your message. Please call us at (313) 603-6064."); }
        })
        .catch(function () {
          alert("Sorry — we couldn't reach our server. Please call us at (313) 603-6064 or email Doublemmkmanagement@gmail.com.");
        })
        .finally(function () { if (btn) { btn.disabled = false; btn.innerHTML = orig; } });
    });
  });

  /* ---- Simple client-side listing filter ---- */
  var filterForm = document.getElementById("listing-filter");
  if (filterForm) {
    var countEl = document.getElementById("listing-count");

    function applyFilters() {
      // re-query each time so listings rendered later (from the sheet) are included
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-listing]"));
      var type = filterForm.type.value;
      var beds = filterForm.beds.value;
      var max = parseInt(filterForm.price.value, 10);
      var city = (filterForm.city.value || "").toLowerCase().trim();
      var shown = 0;

      cards.forEach(function (card) {
        var okType = !type || card.dataset.type === type;
        var okBeds = !beds || parseInt(card.dataset.beds, 10) >= parseInt(beds, 10);
        var okPrice = !max || parseInt(card.dataset.price, 10) <= max;
        var okCity = !city || card.dataset.city.toLowerCase().indexOf(city) !== -1;
        var visible = okType && okBeds && okPrice && okCity;
        card.classList.toggle("hide", !visible);
        if (visible) shown++;
      });

      if (countEl) {
        countEl.textContent = shown + (shown === 1 ? " property" : " properties");
      }
      var empty = document.getElementById("listing-empty");
      if (empty) empty.classList.toggle("hide", shown !== 0);
    }

    filterForm.addEventListener("input", applyFilters);
    filterForm.addEventListener("submit", function (e) { e.preventDefault(); applyFilters(); });
    filterForm.addEventListener("reset", function () { setTimeout(applyFilters, 0); });
  }

  /* ---- Hero rental search -> listings (click OR Enter key) ---- */
  var searchGo = document.querySelector("[data-search-go]");
  if (searchGo) {
    var goSearch = function (e) {
      var form = searchGo.closest("[data-search]");
      if (!form) return;
      e.preventDefault();
      var p = new URLSearchParams();
      ["city", "beds", "price"].forEach(function (k) {
        var el = form.querySelector("[name=" + k + "]");
        if (el && el.value) p.set(k, el.value);
      });
      var qs = p.toString();
      window.location.href = "listings.html" + (qs ? "?" + qs : "") + "#properties";
    };
    searchGo.addEventListener("click", goSearch);
    var sForm = searchGo.closest("[data-search]");
    if (sForm) sForm.addEventListener("submit", goSearch);
  }

  /* ---- Listings: prefill filter from URL params ---- */
  var lfEl = document.getElementById("listing-filter");
  if (lfEl && window.location.search) {
    var q = new URLSearchParams(window.location.search);
    ["city", "beds", "price", "type"].forEach(function (k) {
      var el = lfEl.querySelector("[name=" + k + "]");
      if (el && q.get(k) !== null) el.value = q.get(k);
    });
    lfEl.dispatchEvent(new Event("input"));
  }

  /* ---- Footer year ---- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
