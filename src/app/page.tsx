import type { Metadata } from "next";
import { Suspense } from "react";
import ScrollProgress from "@/components/ScrollProgress";
import Navbar from "@/components/Navbar";
import FloatingCart from "@/components/FloatingCart";
import HeroSection from "@/components/HeroSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import CategoriesGrid from "@/components/CategoriesGrid";
import MenuSection from "@/components/MenuSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import OrderModal from "@/components/OrderModal";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import TableIndicatorBanner from "@/components/TableIndicatorBanner";
import TableParamSync from "@/components/TableParamSync";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Explore our full menu of freshly made, hygienic street food — momos, chicken, noodles, rice & more. Open 2 PM – 11 PM near Bengeri, Hubballi.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Grain overlay */}
      <div className="grain" />

      <ScrollProgress />
      <Suspense fallback={null}>
        <TableParamSync />
      </Suspense>
      <Navbar />
      <TableIndicatorBanner />
      <FloatingCart />
      <HeroSection />

      <CategoriesGrid />
      <MenuSection />
      <WhyChooseUs />
      <ReviewsSection />

      <AboutSection />
      <ContactSection />
      <Footer />
      <CartDrawer />
      <OrderModal />
    </div>
  );
}
