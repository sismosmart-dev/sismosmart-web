import { enExtraPages } from "@/lib/page-content/extra-pages/en";
import { esExtraPages } from "@/lib/page-content/extra-pages/es";
import { idExtraPages } from "@/lib/page-content/extra-pages/id";
import { itExtraPages } from "@/lib/page-content/extra-pages/it";
import { ptExtraPages } from "@/lib/page-content/extra-pages/pt";
import type { ExtraRoutePagesCopy } from "@/lib/page-content/extra-pages/shared";
import { trExtraPages } from "@/lib/page-content/extra-pages/tr";
import type { Locale } from "@/lib/site";

export const extraPagesByLocale: Record<Locale, ExtraRoutePagesCopy> = {
  tr: trExtraPages,
  en: enExtraPages,
  es: esExtraPages,
  it: itExtraPages,
  id: idExtraPages,
  pt: ptExtraPages,
};
