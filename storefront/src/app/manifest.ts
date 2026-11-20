import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CommerceForge",
    short_name: "CommerceForge",
    start_url: "/",
    display: "standalone",
    background_color: "#F3EEE3",
    theme_color: "#D9541E",
    icons: [
      {
        src: "/assets/platform-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
