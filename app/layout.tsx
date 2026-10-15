import type { Metadata } from "next";
import { Rubik, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/store/provider";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { BookingSuccessModal } from "@/components/modals/BookingSuccessModal";
import { AuthModal } from "@/components/modals/AuthModal";
import { FilterModal } from "@/components/modals/FilterModal";
import { ListingQuickViewModal } from "@/components/modals/ListingQuickViewModal";
import { SearchMobileModal } from "@/components/modals/SearchMobileModal";
import { DemoPersonaSwitcher } from "@/components/layout/DemoPersonaSwitcher";
import { Toaster } from "@/components/ui/sonner";

const rubik = Rubik({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Travistay - Curated Sanctuaries, Luxury Villas & Coastal Escapes",
  description:
    "Discover architectural masterpieces, mountain hideaways, and beachfront villas around the world.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${rubik.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#fcfbf9] dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 selection:bg-brand-primary selection:text-white transition-colors duration-200">
        <StoreProvider>
          <ThemeProvider>
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
            <MobileNav />
            <BookingSuccessModal />
            <AuthModal />
            <FilterModal />
            <ListingQuickViewModal />
            <SearchMobileModal />
            {/* <DemoPersonaSwitcher /> */}
            <Toaster />
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
