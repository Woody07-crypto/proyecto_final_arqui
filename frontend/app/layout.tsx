import type { Metadata } from "next";
import { Red_Hat_Display } from "next/font/google";

import { AppChrome } from "@/src/components/layout/AppChrome";

import "./globals.css";

const redHatDisplay = Red_Hat_Display({
  subsets: ["latin"],
  variable: "--font-red-hat-display",
});

export const metadata: Metadata = {
  title: "Event Flow",
  description: "Autenticacion del sistema de eventos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${redHatDisplay.variable} font-app`}>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
