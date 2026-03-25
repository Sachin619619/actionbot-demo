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
          src="https://actionbot-next.vercel.app/widget.js"
          data-tenant="castle-674545ded691fc48edc66366bc5a754d"
          data-api="https://actionbot-next.vercel.app"
          data-color="#1B1C15"
        />
      </body>
    </html>
  );
}
