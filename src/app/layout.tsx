import type { Metadata } from "next";

import { ThemeToggle } from "./theme-toggle";
import "./globals.css";

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
    <html lang="en" data-theme="dark" suppressHydrationWarning>
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
