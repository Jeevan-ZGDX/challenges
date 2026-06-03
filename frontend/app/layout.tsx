import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'SpeakPro Challenge',
  description: 'Enterprise AI-powered reading and pronunciation assessment platform.',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
