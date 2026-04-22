import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Quicksand, Noto_Nastaliq_Urdu, Tajawal } from "next/font/google";
import "./globals.css";
import { BookingModalProvider } from "@/components/booking/BookingModal";
import { AuthProvider } from "@/lib/auth/context";
import { LanguageProvider } from "@/lib/translations/LanguageContext";
import { LayoutContent } from "./LayoutContent";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  variable: "--font-urdu",
  display: "swap",
  weight: ["400", "700"],
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "NeuroHolistic Institute™ | Restore the System. Transform Your Life.",
  description:
    "The NeuroHolistic Method™ is a science-based approach that restores balance within the human system, supporting deep, long-lasting transformation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} ${quicksand.variable} ${notoNastaliqUrdu.variable} ${tajawal.variable} antialiased min-h-screen bg-[#F8FAFC] text-slate-900`} suppressHydrationWarning>
        <AuthProvider>
          <LanguageProvider>
            <BookingModalProvider>
              <LayoutContent>{children}</LayoutContent>
            </BookingModalProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
