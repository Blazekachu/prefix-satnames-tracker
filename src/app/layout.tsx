import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prefix Satnames Tracker",
  description: "Enumerate sat-name series for a prefix and their Bitcoin blocks.",
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
