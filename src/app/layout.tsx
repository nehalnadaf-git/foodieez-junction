import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans, Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const restaurantSchema = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "FoodieeZ Junction Gateway",
  description:
    "Authentic street food restaurant in Hubballi serving freshly made, hygienic & spicy dishes.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bengeri",
    addressLocality: "Hubballi",
    addressRegion: "Karnataka",
    addressCountry: "IN",
  },
  telephone: "+919743862836",
  openingHours: ["Mo-Su 14:00-23:00"],
  servesCuisine: ["Street Food", "Indian", "Chinese"],
  priceRange: "₹",
  url: "https://foodieezjunction.com",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "120",
  },
};

export const metadata: Metadata = {
  metadataBase: new URL("https://foodieezjunction.com"),
  title: {
    template: "%s | FoodieeZ Junction",
    default: "FoodieeZ Junction – Authentic Street Food, Hubballi",
  },
  description:
    "Freshly made, hygienic & spicy street food near Bengeri, Hubballi. Best dine-in & takeaway. Open 2 PM – 11 PM daily.",
  keywords: [
    "street food Hubballi",
    "FoodieeZ Junction",
    "Bengeri restaurant",
    "momos Hubballi",
    "Chinese food Hubballi",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "FoodieeZ Junction",
    title: "FoodieeZ Junction – Authentic Street Food, Hubballi",
    description:
      "Freshly made, hygienic & spicy street food near Bengeri, Hubballi.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FoodieeZ Junction – Authentic Street Food",
    description: "Best street food in Hubballi. Open 2 PM – 11 PM.",
  },
  icons: {
    icon: "/new-hero-plate.png",
    shortcut: "/new-hero-plate.png",
    apple: "/new-hero-plate.png",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${jakarta.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
