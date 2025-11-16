import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TRPCProvider from "@/components/trpc-provider";
import { Separator } from "@/components/ui/separator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shram",
  description: "Task Management App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TRPCProvider>
          <nav className="fixed top-0 h-16 left-0 right-0 py-4 px-6 z-10 border-b bg-background">
            <span className="text-xl font-bold">Shram0</span>
          </nav>
          <div className="pt-16 w-full"> {/* Add padding to account for fixed nav */}
            {children}
          </div>
        </TRPCProvider>
      </body>
    </html>
  );
}
