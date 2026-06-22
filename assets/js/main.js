/* Double MMK Management — site interactions
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  /* ---- Mobile nav toggle ---- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // close menu when a link is tapped (mobile)
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && window.innerWidth <= 940) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
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

  /* ---- Reveal on scroll ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Demo form handling (no backend yet) ----
     Replace with a real handler (Formspree, Netlify Forms, or your CRM)
     when contact/owner details are connected. For now it shows a
     confirmation message so the UX is complete. */
  document.querySelectorAll("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var success = form.querySelector(".form-success");
      if (success) {
        success.classList.add("show");
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      form.reset();
    });
  });

  /* ---- Simple client-side listing filter ---- */
  var filterForm = document.getElementById("listing-filter");
  if (filterForm) {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-listing]"));
    var countEl = document.getElementById("listing-count");

    function applyFilters() {
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

  /* ---- Footer year ---- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
