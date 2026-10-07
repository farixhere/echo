import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'ECHO — The world remembers',
  description: 'ECHO is an atmospheric narrative browser game about memory, consequence, and a room that remembers what you do.',
  applicationName: 'ECHO',
  keywords: ['ECHO','browser game','narrative game','indie game','memory game'],
  icons: { icon: '/icon.svg', shortcut: '/icon.svg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#050605',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
