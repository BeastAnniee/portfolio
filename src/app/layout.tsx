import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aldair - Software Developer",
  description: "Portafolio profesional de Aldair, desarrollador de software especializado en React, Next.js y tecnologías modernas.",
  keywords: ["desarrollador", "software", "react", "next.js", "typescript", "javascript"],
  authors: [{ name: "Aldair" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        <SpeedInsights />
      {children}
      </body>
    </html>
  );
}
