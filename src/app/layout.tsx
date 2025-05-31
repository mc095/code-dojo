import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppStateProvider from '@/components/AppStateProvider'; // Renamed and created new for state

export const metadata: Metadata = {
  title: 'AlgoRace - DSA Challenge',
  description: 'Race to solve DSA problems with your cousin!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen flex flex-col">
        <AppStateProvider>
          {children}
        </AppStateProvider>
        <Toaster />
      </body>
    </html>
  );
}
