import "./globals.css";
import type { Metadata } from "next";
import { Inter, Press_Start_2P } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel"
});

export const metadata: Metadata = {
  title: "PixelCode",
  description: "Gamified LeetCode progress tracking with pixel-art flair."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${pressStart.variable} font-sans`}>{children}</body>
    </html>
  );
}
