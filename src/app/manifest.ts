import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FoodieeZ Junction",
    short_name: "FoodieeZ",
    description:
      "Authentic street food restaurant in Hubballi — freshly made, hygienic & spicy.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d0b09",
    theme_color: "#f5a623",
    orientation: "portrait",
    icons: [
      {
        src: "/new-hero-plate.webp",
        sizes: "any",
        type: "image/webp",
        purpose: "any",
      },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

