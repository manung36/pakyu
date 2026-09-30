import type { Metadata, Viewport } from "next";
import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PAK Konversi Dosen — PermenPANRB No. 1 Tahun 2023",
  description:
    "Aplikasi Pembuat Dokumen PAK Konversi Dosen dan Perhitungan Angka Kredit (AK) mengikut PermenPANRB No. 1 Tahun 2023.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "oklch(1 0 0)" },
    { media: "(prefers-color-scheme: dark)", color: "oklch(0.145 0 0)" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 lg:ml-72 p-6 lg:p-8">{children}</main>
        </div>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
