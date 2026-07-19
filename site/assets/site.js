/* Great Expectations — global behaviour (zero deps)
   Positive/Negative theme inversion + reveal-on-scroll. */
(function () {
  "use strict";

  var root = document.documentElement;

  // --- Theme: default positive; restore persisted; else honour OS ----
  try {
    var saved = localStorage.getItem("ge-theme");
    if (saved === "negative" || saved === "positive") {
      root.setAttribute("data-theme", saved);
    } else if (window.matchMedia &&
               window.matchMedia("(prefers-color-scheme: dark)").matches) {
      root.setAttribute("data-theme", "negative");
    }
  } catch (e) {}

  function toggleTheme() {
    var next = root.getAttribute("data-theme") === "negative" ? "positive" : "negative";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("ge-theme", next); } catch (e) {}
  }

  var btn = document.getElementById("theme-toggle");
  function syncLabel() {
    if (!btn) return;
    var cur = root.getAttribute("data-theme");
    btn.textContent = cur === "negative" ? "POSITIVE" : "NEGATIVE";
  }
  syncLabel();
  if (btn) btn.addEventListener("click", function () { toggleTheme(); syncLabel(); });

  // --- Reveal on scroll (respects reduced motion) ----
  var reduce = window.matchMedia &&
               window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nodes = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    nodes.forEach(function (n) { n.classList.add("in"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  nodes.forEach(function (n) { io.observe(n); });
})();
