import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import MotionProvider from "@/components/MotionProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  title: "Aldair Nava - Data Analyst & Automation Developer",
  description: "Portafolio profesional de Aldair Nava, Data Analyst con experiencia end-to-end en pipelines de datos, dashboards de BI y automatización, con capacidad full-stack en React y Next.js.",
  keywords: ["data analyst", "business intelligence", "automation", "python", "sql", "dashboards", "react", "next.js", "typescript"],
  authors: [{ name: "Aldair Nava" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${bricolage.variable} font-body antialiased`}>
        <SpeedInsights />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
