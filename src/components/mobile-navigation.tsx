type MobileNavigationLink = {
  href: string;
  label: string;
};

type MobileNavigationLanguage = {
  href: string;
  isActive: boolean;
  label: string;
  locale: string;
};

type MobileNavigationProps = {
  closeLabel: string;
  ctaHref: string;
  ctaLabel: string;
  languages: MobileNavigationLanguage[];
  menuLabel: string;
  navigation: MobileNavigationLink[];
};

/**
 * The open panel is a fixed overlay that covers the <summary> toggle, so the
 * summary alone can't close it. This inline script closes the <details> when
 * the backdrop or the close button is clicked, and on Escape. It's a script
 * rather than a client component so the site keeps shipping zero hydration.
 */
const CLOSE_SCRIPT = `
(function () {
  function close(el) {
    if (!el) return;
    el.removeAttribute("open");
    var toggle = el.querySelector("summary");
    if (toggle && typeof toggle.focus === "function") toggle.focus();
  }
  document.addEventListener("click", function (event) {
    var backdrop = event.target.closest("[data-mobile-nav-backdrop]");
    if (backdrop && event.target === backdrop) return close(backdrop.closest("details"));
    var dismiss = event.target.closest("[data-mobile-nav-close]");
    if (dismiss) return close(dismiss.closest("details"));
  });
  document.addEventListener("keydown", function (event) {
    var openDetails = document.querySelector("details[data-mobile-nav][open]");
    if (!openDetails) return;
    if (event.key === "Escape") {
      close(openDetails);
      return;
    }
    if (event.key === "Tab") {
      var nav = openDetails.querySelector("nav");
      if (!nav) return;
      var focusables = nav.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  document.addEventListener("toggle", function (event) {
    var details = event.target;
    if (!details || !details.matches || !details.matches("details[data-mobile-nav]")) return;
    if (details.open) {
      var closeBtn = details.querySelector("[data-mobile-nav-close]");
      if (closeBtn && typeof closeBtn.focus === "function") {
        setTimeout(function () { closeBtn.focus(); }, 15);
      }
    }
  }, true);
})();
`;

function CloseGlyph() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="18"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function MobileNavigation({
  closeLabel,
  ctaHref,
  ctaLabel,
  languages,
  menuLabel,
  navigation,
}: MobileNavigationProps) {
  return (
    <details className="group lg:hidden" data-mobile-nav="">
      <summary
        aria-label={menuLabel}
        className="inline-flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-brand-bright/30 bg-brand-bright/10 text-white marker:hidden"
      >
        <span aria-hidden="true" className="grid gap-1.5 group-open:hidden">
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
        </span>
        <span aria-hidden="true" className="hidden group-open:block">
          <CloseGlyph />
        </span>
      </summary>

      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        data-mobile-nav-backdrop=""
      >
        <nav
          aria-label="Mobile primary"
          className="absolute right-0 top-0 flex h-full w-[min(86vw,22rem)] flex-col gap-6 overflow-y-auto bg-surface-2 p-6 text-fg shadow-2xl"
        >
          <div className="flex items-center justify-between gap-4">
            <p className="font-heading text-xl tracking-normal">SismoSmart</p>
            <button
              aria-label={closeLabel}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-fg hover:border-primary-600 hover:text-primary-600"
              data-mobile-nav-close=""
              type="button"
            >
              <CloseGlyph />
            </button>
          </div>

          <div className="grid gap-2">
            {navigation.map((item) => (
              <a
                key={item.href}
                className="rounded-md border border-border bg-surface px-4 py-3 font-medium text-fg hover:border-primary-300"
                href={item.href}
              >
                {item.label}
              </a>
            ))}
            <a
              className="rounded-md bg-primary-600 px-4 py-3 text-center font-semibold text-fg-on-primary"
              href={ctaHref}
            >
              {ctaLabel}
            </a>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            {languages.map((entry) => (
              <a
                key={entry.locale}
                className={`rounded-full border px-3 py-2 text-center ${
                  entry.isActive
                    ? "border-primary-600 bg-primary-50 text-primary-800"
                    : "border-border bg-surface text-fg-muted"
                }`}
                data-locale-switch={entry.locale}
                href={entry.href}
                hrefLang={entry.locale}
                lang={entry.locale}
              >
                {entry.label}
              </a>
            ))}
          </div>
        </nav>
      </div>
      <script dangerouslySetInnerHTML={{ __html: CLOSE_SCRIPT }} />
    </details>
  );
}
