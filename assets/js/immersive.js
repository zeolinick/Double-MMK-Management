/* Double MMK Management — immersive layer
   ------------------------------------------------------------------
   Self-contained, dependency-free. Auto-enhances existing markup.
   Everything is gated behind the `.js` class and respects
   prefers-reduced-motion, so the no-JS experience is fully intact.
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var lerp = function (a, b, n) { return (1 - n) * a + n * b; };
  var clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };

  /* ============================================================
     0) ACTIVE NAV — works for real pages (pathname) AND the
        single-file build's hash routes (#owners, #services, …)
     ============================================================ */
  (function activeNav() {
    var links = document.querySelectorAll(".nav-links a");
    if (!links.length) return;
    function setActive() {
      var hash = location.hash;
      var page = location.pathname.split("/").pop() || "index.html";
      links.forEach(function (a) {
        var href = a.getAttribute("href") || "", on;
        if (href.charAt(0) === "#") on = hash ? href === hash : href === "#home";
        else on = href.split("#")[0] === page;
        a.classList.toggle("active", on);
        if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
      });
    }
    setActive();
    window.addEventListener("hashchange", setActive);
  })();

  /* ============================================================
     0b) HERO VIDEO — desktop only, lazy (don't burn mobile data),
         respects reduced motion. Fades in once it can play.
     ============================================================ */
  (function heroVideo() {
    var v = document.querySelector(".hero-video");
    if (!v) return;
    var src = v.getAttribute("data-hero-src");
    if (!src || reduce || !finePointer || window.innerWidth < 1000) return;
    var hero = v.closest(".hero");
    if (hero) hero.classList.add("has-video");
    v.setAttribute("preload", "auto");
    v.src = src;
    v.addEventListener("canplay", function () { v.classList.add("is-ready"); });
    var p = v.play && v.play();
    if (p && p.catch) p.catch(function () {});
  })();

  /* ============================================================
     0c) RENT ESTIMATE CALCULATOR (Owners page) — instant ballpark
     ============================================================ */
  (function rentCalc() {
    var form = document.getElementById("rent-calc");
    if (!form) return;
    var out = document.getElementById("rc-out");
    var hood = document.getElementById("rc-hood"), beds = document.getElementById("rc-beds"),
        baths = document.getElementById("rc-baths"), sqft = document.getElementById("rc-sqft");
    function money(n) { return "$" + Math.round(n).toLocaleString(); }
    function calc() {
      var f = parseFloat(hood.value) || 0.85,
          b = parseInt(beds.value, 10) || 1,
          ba = parseFloat(baths.value) || 1,
          sf = Math.max(300, Math.min(6000, parseInt(sqft.value, 10) || 1000));
      var est = (sf * 0.78 + b * 170 + ba * 90) * f;
      var lo = Math.round(est * 0.92 / 10) * 10, hi = Math.round(est * 1.09 / 10) * 10;
      out.textContent = money(lo) + " – " + money(hi);
    }
    form.addEventListener("input", calc);
    form.addEventListener("change", calc);
    calc();
  })();

  /* ============================================================
     0d) MOBILE ACTION BAR — quiet two-button bar, mobile only,
         appears after scrolling. Clear direction, not pushy.
     ============================================================ */
  (function mobileBar() {
    if (window.innerWidth >= 760) return;
    var spa = !!document.querySelector(".page");           // single-file build uses .page routes
    var cta = spa ? "#owners" : "owners.html#quote";
    var bar = document.createElement("div");
    bar.className = "mobile-bar";
    bar.innerHTML =
      '<a class="mb-call" href="tel:+13136036064">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.07 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg> Call</a>' +
      '<a class="mb-cta" href="' + cta + '">Free Rental Analysis</a>';
    document.body.appendChild(bar);
    function toggle() { bar.classList.toggle("show", (window.scrollY || 0) > 560); }
    window.addEventListener("scroll", toggle, { passive: true });
    toggle();
  })();

  /* ============================================================
     0e) CONTACT REASON HINT — quiet fastest-path helper under the
         "I'm reaching out as a..." dropdown. Build-aware links.
     ============================================================ */
  (function reasonHint() {
    var sel = document.getElementById("c-reason");
    var hint = document.querySelector(".reason-hint");
    if (!sel || !hint) return;
    var spa = !!document.querySelector(".page");
    var L = spa
      ? { maint: "#tenants", listings: "#properties", estimate: "#owners" }
      : { maint: "tenants.html#request-form", listings: "listings.html", estimate: "owners.html#estimate" };
    var map = {
      "Current resident": 'Maintenance issue? Fastest path: <a href="' + L.maint + '">submit a request</a>. Emergency? Call <a href="tel:+13136036064">(313) 603-6064</a> now.',
      "Prospective tenant": 'Browsing? <a href="' + L.listings + '">See what’s available</a> right now.',
      "Property owner / investor": 'Want numbers first? Try the <a href="' + L.estimate + '">instant rent estimate</a> — no form required.'
    };
    sel.addEventListener("change", function () {
      hint.innerHTML = map[sel.value] || "";
    });
  })();

  /* ============================================================
     1) SCROLL-REVEAL — staggered, with directional variants
     ============================================================ */
  (function reveals() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) {
      var parent = el.parentElement;
      var idx = parent ? Array.prototype.indexOf.call(parent.children, el) : 0;
      if (!el.style.transitionDelay) el.style.transitionDelay = (Math.min(idx, 8) * 75) + "ms";
      io.observe(el);
    });
  })();

  /* ============================================================
     2) SCROLL PROGRESS BAR (top)
     ============================================================ */
  var bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);

  /* ============================================================
     3) 3D TILT on cards (subtle, refined)
     ============================================================ */
  if (finePointer && !reduce) {
    var tiltEls = document.querySelectorAll(".card, .path-card, .portal-card, .quote");
    tiltEls.forEach(function (el) {
      el.classList.add("tilt");
      var raf = null, tx = 0, ty = 0;
      el.addEventListener("mousemove", function (ev) {
        var r = el.getBoundingClientRect();
        var px = (ev.clientX - r.left) / r.width - 0.5;
        var py = (ev.clientY - r.top) / r.height - 0.5;
        tx = clamp(-py * 6, -6, 6);
        ty = clamp(px * 6, -6, 6);
        if (!raf) raf = requestAnimationFrame(function apply() {
          el.style.transform = "perspective(900px) rotateX(" + tx + "deg) rotateY(" + ty + "deg) translateY(-4px)";
          raf = null;
        });
      });
      el.addEventListener("mouseleave", function () {
        el.style.transform = "";
      });
    });
  }

  /* ============================================================
     4) MAGNETIC buttons (primary CTAs)
     ============================================================ */
  if (finePointer && !reduce) {
    document.querySelectorAll(".btn--primary").forEach(function (btn) {
      btn.classList.add("magnetic");
      btn.addEventListener("mousemove", function (ev) {
        var r = btn.getBoundingClientRect();
        var mx = ev.clientX - (r.left + r.width / 2);
        var my = ev.clientY - (r.top + r.height / 2);
        btn.style.transform = "translate(" + (mx * 0.18) + "px," + (my * 0.28) + "px)";
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });
  }

  /* ============================================================
     5) STEP-BY-STEP progress (How it works / process)
     ============================================================ */
  var stepGroups = [].slice.call(document.querySelectorAll(".steps"));
  stepGroups.forEach(function (g) { g.classList.add("steps-progress"); });

  /* ============================================================
     6) PARALLAX — photo bands + tagged elements
     ============================================================ */
  /* desktop only — background-position parallax is a repaint cost that
     makes mobile scrolling feel janky, so we skip it on touch/coarse */
  var parallaxEls = [];
  if (finePointer && !reduce) {
    document.querySelectorAll(".photo-band, [data-parallax]").forEach(function (el) {
      parallaxEls.push({
        el: el,
        isBand: el.classList.contains("photo-band"),
        speed: parseFloat(el.getAttribute("data-parallax")) || 0.12
      });
    });
  }

  /* ============================================================
     6b) SCROLL-INTO-FOCUS cards (touch devices only — the mobile
         counterpart to desktop tilt). Subtle: ~2% lift near center.
         Driven via a CSS var so tap-press feedback still composes.
     ============================================================ */
  var focusOn = !finePointer && !reduce;
  var focusVisible = [];
  if (focusOn && "IntersectionObserver" in window) {
    var fobs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var i = focusVisible.indexOf(e.target);
        if (e.isIntersecting && i === -1) focusVisible.push(e.target);
        else if (!e.isIntersecting && i !== -1) { focusVisible.splice(i, 1); e.target.style.setProperty("--f", "1"); }
      });
    }, { rootMargin: "10% 0px 10% 0px" });
    document.querySelectorAll(".card, .path-card").forEach(function (el) { fobs.observe(el); });
  }

  /* ============================================================
     7) AGGREGATE SCROLL-DRIVEN EFFECTS (single rAF loop)
     ============================================================ */
  var vh = window.innerHeight;
  window.addEventListener("resize", function () { vh = window.innerHeight; }, { passive: true });

  var ticking = false;
  function onScrollEffects() {
    var y = window.scrollY || window.pageYOffset;
    var docH = document.documentElement.scrollHeight - vh;
    bar.style.transform = "scaleX(" + (docH > 0 ? clamp(y / docH, 0, 1) : 0) + ")";

    if (!reduce) {
      // parallax
      for (var i = 0; i < parallaxEls.length; i++) {
        var p = parallaxEls[i], r = p.el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        var center = r.top + r.height / 2 - vh / 2;
        var shift = clamp(-center * p.speed, -44, 44);
        if (p.isBand) {
          p.el.style.backgroundPosition = "center calc(50% + " + shift.toFixed(1) + "px)";
        } else {
          p.el.style.transform = "translate3d(0," + shift.toFixed(1) + "px,0)";
        }
      }
      // step progress
      for (var s = 0; s < stepGroups.length; s++) {
        var g = stepGroups[s], gr = g.getBoundingClientRect();
        var prog = clamp((vh * 0.85 - gr.top) / (gr.height + vh * 0.2), 0, 1);
        g.style.setProperty("--progress", prog.toFixed(3));
        var steps = g.children, n = steps.length;
        for (var k = 0; k < n; k++) {
          if (prog >= (k + 0.4) / n) steps[k].classList.add("step--active");
        }
      }
      // scroll-into-focus cards (touch) — only the few cards in view
      for (var f = 0; f < focusVisible.length; f++) {
        var fe = focusVisible[f];
        if (!fe.classList.contains("in")) continue;
        if (!fe.classList.contains("focus-card")) fe.classList.add("focus-card");
        var fr = fe.getBoundingClientRect();
        var d = Math.abs((fr.top + fr.height / 2) - vh / 2) / vh;
        fe.style.setProperty("--f", (1 + 0.022 * clamp(1 - d * 2.2, 0, 1)).toFixed(3));
      }
    }
    ticking = false;
  }
  function requestScroll() { if (!ticking) { ticking = true; requestAnimationFrame(onScrollEffects); } }
  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll, { passive: true });
  onScrollEffects();

})();
