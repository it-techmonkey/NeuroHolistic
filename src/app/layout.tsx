import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BookingModalProvider } from "@/components/booking/BookingModalProvider";
import { AuthProvider } from "@/lib/auth/context";
import { LayoutContent } from "./LayoutContent";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
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
      <body className={`${inter.variable} antialiased min-h-screen bg-[#F8FAFC] text-slate-900`} suppressHydrationWarning>
        <AuthProvider>
          <BookingModalProvider>
            <LayoutContent>{children}</LayoutContent>
          </BookingModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
