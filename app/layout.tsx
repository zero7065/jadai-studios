import React from 'react';
import './globals.css';
import { ThemeProvider } from '../components/providers/ThemeProvider';
import { LanguageProvider } from '../components/providers/LanguageProvider';
import { ToastProvider } from '../components/providers/ToastProvider';

export const metadata = {
  title: 'Jadai Studios — BUILD DIFFERENT',
  description: 'JADAI STUDIOS — BUILD DIFFERENT. High-tier architecture, AI systems, site diagnostics, and creative technology suite.',
  manifest: '/manifest.json',
  openGraph: {
    title: 'Jadai Studios — BUILD DIFFERENT',
    description: 'High-tier architecture, AI systems, site diagnostics, and creative technology suite.',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/assets/logo/icon-192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#050404] text-[#c4c0bb] min-h-screen">
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
