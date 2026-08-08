import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";

import { ThemeToggle } from "./theme-toggle";
import "./globals.css";

const pixelDisplay = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prefix Sat Names Tracker",
  description: "Enumerate sat name series for a prefix and their Bitcoin blocks.",
};

const themeInitScript = `(function(){try{var t=localStorage.getItem("pst-theme");document.documentElement.setAttribute("data-theme",(t==="light"||t==="dark")?t:"dark");}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={pixelDisplay.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
