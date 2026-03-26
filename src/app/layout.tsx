import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ActionBotBridge from "@/components/ActionBotBridge";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ActionBot Demo — Castle Living",
  description: "See how the Castle Living AI chatbot integrates into any app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F4EDD9]">
        {children}
        <ActionBotBridge
          userId="demo-user-001"
          name="Demo User"
          email="demo@castle.app"
          phone=""
        />
        {/* ActionBot Widget Script — same config as Castle Living */}
        <script
          src="https://actionbot-psi.vercel.app/widget.js"
          data-tenant="a7dea8c407e17aa85cb8a6d117dbf8a6150a9e4b5afc2db34c2a475af99aa8ad"
          data-api="https://actionbot-psi.vercel.app"
          data-color="#1B1C15"
        />
      </body>
    </html>
  );
}
