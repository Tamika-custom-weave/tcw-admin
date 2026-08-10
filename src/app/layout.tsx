import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { AuthProvider } from "@/providers/AuthProvider";
import { GlobalModals } from "@/components/GlobalModals";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TCW Admin | Tamika's Custom Weave",
  description: "Tamika's Custom Weave – Luxury Hair Management Admin Dashboard",
  icons: {
    icon: [
      { url: "/tcw-favicon.png", type: "image/png" },
    ],
    apple: "/tcw-favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex text-gray-900 relative">
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
          <Suspense fallback={null}>
            <GlobalModals />
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
