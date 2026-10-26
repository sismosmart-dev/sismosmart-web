import { withBasePath } from "@/lib/base-path";

export const assetPaths = {
  android192: withBasePath("/images/icons/android-chrome-192x192.png"),
  android512: withBasePath("/images/icons/android-chrome-512x512.png"),
  appleTouchIcon: withBasePath("/images/icons/apple-touch-icon.png"),
  favicon16: withBasePath("/images/icons/favicon-16x16.png"),
  favicon32: withBasePath("/images/icons/favicon-32x32.png"),
  ogImage: withBasePath("/images/og/sismosmart-og.png"),
} as const;
