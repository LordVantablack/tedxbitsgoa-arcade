import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PwaServiceWorker } from "./PwaServiceWorker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TEDxBITSGoa Arcade",
  description: "Play, place on the board, and join the TEDxBITSGoa side quest.",
  openGraph: {
    title: "TEDxBITSGoa Arcade",
    description: "Play, place on the board, and join the TEDxBITSGoa side quest.",
    images: [{ url: "/og-arcade.png", width: 1731, height: 909, alt: "A red-lit arcade cabinet" }],
  },
  icons: {
    icon: "/arcade-icon.svg",
    shortcut: "/arcade-icon.svg",
    apple: "/arcade-icon.svg",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "TEDx Arcade", statusBarStyle: "black-translucent" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PwaServiceWorker />
        {children}
      </body>
    </html>
  );
}
