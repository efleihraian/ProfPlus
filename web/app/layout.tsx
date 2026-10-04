import type { Metadata } from "next";
import "./globals.css";
import {ProfosThemeProvider} from "./theme-controls";

export const metadata: Metadata = {
  title: "ProfOS — Conversație AI",
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
      <body className="antialiased"><ProfosThemeProvider>{children}</ProfosThemeProvider></body>
    </html>
  );
}
