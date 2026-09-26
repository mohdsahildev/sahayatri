import type { Metadata } from "next";
import { Hanken_Grotesk, Space_Grotesk } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/auth-provider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SahaYatri — Community Carpooling & Shared Journeys",
  description: "Community carpooling for everyday journeys.",
  icons: {
    icon: "/logo/SahaYatri-logo.svg",
    shortcut: "/logo/SahaYatri-logo.svg",
    apple: "/logo/SahaYatri-logo.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${hankenGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
