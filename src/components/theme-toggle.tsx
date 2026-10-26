/**
 * Theme toggle built the same way as the rest of the site's interactivity: a
 * server-rendered control plus one inline script. No client component, so this
 * adds no hydration cost to a site that currently ships none.
 *
 * The companion pre-paint script lives in the root layout and must run before
 * first paint, otherwise a dark-mode visitor gets a white flash.
 */

const TOGGLE_SCRIPT = `
(function () {
  var KEY = "sismosmart-theme";
  function current() {
    var explicit = document.documentElement.getAttribute("data-theme");
    if (explicit) return explicit;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(KEY, theme); } catch (error) { /* private mode */ }
    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    });
  }
  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-theme-toggle]");
    if (!button) return;
    apply(current() === "dark" ? "light" : "dark");
  });
  apply(current());
})();
`;

export function ThemeToggle({ label }: { label: string }) {
  return (
    <>
      <button
        aria-label={label}
        aria-pressed="false"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/80 hover:border-white/50 hover:text-white"
        data-theme-toggle=""
        title={label}
        type="button"
      >
        <svg
          aria-hidden="true"
          fill="none"
          height="16"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
          width="16"
        >
          {/* Sun core plus rays; in dark mode the same glyph reads as "go light". */}
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
        </svg>
      </button>
      <script dangerouslySetInnerHTML={{ __html: TOGGLE_SCRIPT }} />
    </>
  );
}

/**
 * Runs in <head> before paint: reads the stored choice and stamps it on <html>
 * so the first frame is already the right theme.
 */
export const THEME_PREPAINT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("sismosmart-theme");
    if (stored === "dark" || stored === "light") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch (error) { /* private mode: fall back to prefers-color-scheme */ }
})();
`;
