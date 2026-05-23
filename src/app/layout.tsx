import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./Providers";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "NGO Command Center — Resource & Impact Orchestrator",
  description: "High-level NGO oversight and donor presentation portal. Track field interventions, monitor impact metrics, and generate accountability reports in real-time.",
  keywords: ["NGO", "field operations", "impact reporting", "command center", "donor portal", "transparency"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: '#111113',
                border: '1px solid rgba(255,255,255,0.07)',
                color: '#e4e4e7',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
