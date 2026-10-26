/**
 * Scroll-reveal, done the site's way: one inline script, no client component,
 * no hydration cost. It marks <html> with js-reveal (so the hidden start state
 * only applies when JS is present), then reveals each [data-reveal] element as
 * it enters the viewport. Honours prefers-reduced-motion by revealing
 * everything immediately.
 */
const REVEAL_SCRIPT = `
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;
  root.classList.add("js-reveal");
  function start() {
    var targets = document.querySelectorAll("[data-reveal]:not(.is-visible)");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
`;

export function ScrollReveal() {
  return <script dangerouslySetInnerHTML={{ __html: REVEAL_SCRIPT }} />;
}
