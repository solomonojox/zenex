import type { Metadata } from "next";
import Nav from "@/components/nav/Nav";
import DemoBar from "@/components/nav/DemoBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zenex — Canada's Trusted Cleaning Marketplace",
  description: "Book vetted, insured cleaning professionals across Canada in under 3 minutes.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="size-full flex flex-col min-h-screen">
          <Nav />
          <main className="flex-1">{children}</main>
          {/* <DemoBar /> */}
        </div>
      </body>
    </html>
  );
}
