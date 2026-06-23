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
  var parallaxEls = [];
  document.querySelectorAll(".photo-band, [data-parallax]").forEach(function (el) {
    parallaxEls.push({
      el: el,
      isBand: el.classList.contains("photo-band"),
      speed: parseFloat(el.getAttribute("data-parallax")) || 0.18
    });
  });

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
        var shift = -center * p.speed;
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
    }
    ticking = false;
  }
  function requestScroll() { if (!ticking) { ticking = true; requestAnimationFrame(onScrollEffects); } }
  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll, { passive: true });
  onScrollEffects();

  /* ============================================================
     8) PAGE-LOAD INTRO (homepage only, once per session)
     ============================================================ */
  (function intro() {
    if (reduce) return;
    var isHome = !!document.querySelector(".hero") || !!document.getElementById("home");
    if (!isHome) return;
    try { if (sessionStorage.getItem("dmmk_intro")) return; sessionStorage.setItem("dmmk_intro", "1"); } catch (e) {}

    var c = document.createElement("div");
    c.className = "intro";
    c.setAttribute("aria-hidden", "true");
    c.innerHTML =
      '<div class="intro-inner">' +
      '<span class="intro-mark">Double <em>MMK</em></span>' +
      '<span class="intro-sub">Detroit property, managed right.</span>' +
      '</div>';
    document.body.appendChild(c);
    document.body.classList.add("intro-lock");
    requestAnimationFrame(function () { c.classList.add("intro--show"); });
    setTimeout(function () { c.classList.add("intro--out"); document.body.classList.remove("intro-lock"); }, 1500);
    setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 2400);
  })();

  /* ============================================================
     9) SMOOTH MOMENTUM SCROLL (desktop fine-pointer only)
         scrollTo-based so sticky headers + anchor links keep working.
         Set ENABLE_MOMENTUM = false to turn off.
     ============================================================ */
  var ENABLE_MOMENTUM = true;
  if (ENABLE_MOMENTUM && finePointer && !reduce && !("ontouchstart" in window)) {
    var target = window.scrollY, current = window.scrollY, running = false;
    var maxY = function () { return document.documentElement.scrollHeight - window.innerHeight; };

    function frame() {
      current = lerp(current, target, 0.14);
      if (Math.abs(target - current) < 0.4) { current = target; running = false; }
      window.scrollTo(0, current);
      if (running) requestAnimationFrame(frame);
    }
    function kick() { if (!running) { running = true; requestAnimationFrame(frame); } }

    window.addEventListener("wheel", function (e) {
      if (e.ctrlKey) return;                 // pinch-zoom
      if (e.deltaMode !== 0) return;         // line/page mode — let native handle
      target = clamp(target + e.deltaY, 0, maxY());
      e.preventDefault();
      kick();
    }, { passive: false });

    // keep target synced when scroll comes from elsewhere (keyboard, anchors, drag)
    window.addEventListener("scroll", function () {
      if (!running) { target = current = window.scrollY; }
    }, { passive: true });
    window.addEventListener("resize", function () { target = current = window.scrollY; });
  }

})();
