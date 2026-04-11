import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sentinel Guard | Insurance Fraud Detection",
  description: "Enterprise SaaS for High-Risk Claim Evaluation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex h-screen overflow-hidden antialiased bg-slate-50`}>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-8 pb-32">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
