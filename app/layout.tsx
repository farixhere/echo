import type { Metadata, Viewport } from 'next';
import './globals.css';

const siteUrl = 'https://echo-dupekingsam-7855.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'ECHO — The Room That Remembers',
  description: 'An atmospheric browser game where the room remembers what you do.',
  applicationName: 'ECHO',
  generator: 'Next.js',
  keywords: ['ECHO', 'browser game', 'indie game', 'interactive story', 'memory game'],
  authors: [{ name: 'ECHO' }],
  alternates: { canonical: '/' },
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'ECHO — The Room That Remembers',
    description: 'The world remembers what you do.',
    siteName: 'ECHO',
  },
  twitter: {
    card: 'summary',
    title: 'ECHO — The Room That Remembers',
    description: 'The world remembers what you do.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#05070a',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
