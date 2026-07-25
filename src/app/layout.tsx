import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents zooming on inputs
};

export const metadata: Metadata = {
  title: "Nexus Field Sales",
  description: "B2B Field Sales & Khata App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-primary text-foreground min-h-screen flex justify-center`}>
        {/* Mobile constrained wrapper */}
        <div className="w-full max-w-md min-h-screen relative shadow-2xl overflow-x-hidden border-x border-card bg-primary pb-20">
          {children}
        </div>
      </body>
    </html>
  );
}
