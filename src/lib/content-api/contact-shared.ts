import type { ContentDocument } from "@/lib/content-api/contracts";
import type { RoutePagesCopy } from "@/lib/page-copy";

/** Keep original mailto/web links and submission wiring; update labels only. */
export function mergeContactCopy(pages: RoutePagesCopy, content: ContentDocument<"page.contact.copy"> | null): RoutePagesCopy {
  if (!content || pages.contact.channels.length !== content.channels.length) return pages;
  const channels = pages.contact.channels.map((channel, i) => ({ ...channel, ...content.channels[i] }));
  return { ...pages, contact: { ...pages.contact, channels, form: content.form } };
}
