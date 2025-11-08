import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3D Image to Video",
  description: "Convert images to 3D animated videos for social media",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
