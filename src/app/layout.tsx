import type { Metadata } from "next";
import "./globals.css";
import { AccessibilityProvider } from "@/context/AccessibilityContext";

export const metadata: Metadata = {
  title: "RationTrack - Public Ration Shop Stock Visibility Portal (SC-09)",
  description: "Check real-time stock availability at your local Fair Price Shop (Ration Shop) before visiting. Accessible for elderly and low-literacy users.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <AccessibilityProvider>{children}</AccessibilityProvider>
      </body>
    </html>
  );
}
