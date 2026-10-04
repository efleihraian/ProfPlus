import type { Metadata } from "next";
import "./globals.css";
import {ProfPlusThemeProvider} from "./theme-controls";

export const metadata: Metadata = {
  title: "ProfPlus — Conversație AI",
  description: "Spațiul tău pentru conversații cu AI.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body className="antialiased"><ProfPlusThemeProvider>{children}</ProfPlusThemeProvider></body>
    </html>
  );
}
