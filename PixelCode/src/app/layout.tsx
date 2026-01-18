import "./globals.css";
import type { Metadata } from "next";

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
      <body>{children}</body>
    </html>
  );
}
