import { assetPaths } from "@/lib/asset-paths";
import { appBasePath, withBasePath } from "@/lib/base-path";

export const webManifest = {
  name: "SismoSmart",
  short_name: "SismoSmart",
  description:
    "Seismic monitoring for homes and small buildings: continuous measurement, an alert during an earthquake, and a record of how the building responded.",
  start_url: withBasePath("/en"),
  scope: appBasePath ? `${appBasePath}/` : "/",
  display: "standalone",
  background_color: "#f8fbf8",
  theme_color: "#2E7D32",
  icons: [
    {
      src: assetPaths.android192,
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: assetPaths.android512,
      sizes: "512x512",
      type: "image/png",
    },
  ],
} as const;
