import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import { InsforgeProvider } from "./providers";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "EmailFlow — Cold Email OS for Agencies",
  description: "Run multi-client cold outreach from a single dashboard: connect inboxes, launch sequences, and manage replies with client context.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakarta.variable} suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground font-sans">
        <ThemeProvider>
          <InsforgeProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </InsforgeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
