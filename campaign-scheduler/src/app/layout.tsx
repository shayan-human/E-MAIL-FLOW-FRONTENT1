import type { Metadata } from 'next';
import { Public_Sans } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ToastProvider } from '@/components/ui/toast-provider';
import { InsforgeProvider } from './providers';

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-public-sans',
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
    <html lang="en" className={publicSans.variable} suppressHydrationWarning>
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
