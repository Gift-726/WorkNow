import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "WorkNow – Casual Jobs. Real Pay. Safe and Simple.",
  description:
    "WorkNow is a safety-first casual job marketplace connecting Nigerian workers and employers. Find local jobs, hire verified workers, and get paid securely through escrow.",
  keywords: "casual jobs, Nigeria, gig work, event workers, artisans, OPay, escrow, verified jobs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased" style={{ background: '#ffffff', color: '#111827' }}>
        {children}
      </body>
    </html>
  );
}
