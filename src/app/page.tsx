import { permanentRedirect } from "next/navigation";

import { withBasePath } from "@/lib/base-path";
import { defaultLocale } from "@/lib/site";

export default function RootPage() {
  permanentRedirect(withBasePath(`/${defaultLocale}`));
}
