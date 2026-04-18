import type { Metadata } from "next";
import { Syne, DM_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar, BottomTabBar } from "@/components/Sidebar";
import { ToastProvider } from "@/components/ToastProvider";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Motion Falcon Content Engine",
  description:
    "Autonomous content marketing engine for Motion Falcon — a 3D CGI animation studio.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${dmMono.variable}`}>
      <body className="bg-bg text-white min-h-screen antialiased">
        <ToastProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 w-full max-w-full overflow-x-hidden pb-24 md:pb-10">
              {children}
            </main>
          </div>
          <BottomTabBar />
        </ToastProvider>
      </body>
    </html>
  );
}
