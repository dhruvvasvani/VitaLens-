import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RumProvider from "@/components/RumProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VitaLens – Frontend Performance Monitoring",
  description:
    "AI-powered Real User Monitoring. Capture Core Web Vitals, detect regressions, and get actionable optimization insights powered by AI.",
  keywords: ["performance monitoring", "web vitals", "RUM", "AI analysis", "LCP", "CLS", "INP"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <RumProvider>
          {children}
        </RumProvider>
      </body>
    </html>
  );
}
