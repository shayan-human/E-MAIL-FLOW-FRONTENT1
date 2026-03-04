import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ToastProvider } from '@/components/ui/toast-provider';
import { InsforgeProvider } from './providers';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
});

export const metadata: Metadata = {
  title: 'Aur — Smart Campaign Platform',
  description: 'Orchestrate your email campaigns with intelligence.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.variable} suppressHydrationWarning>
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
