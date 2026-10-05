import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ECHO — The world remembers',
  description: 'A small atmospheric browser game about persistent consequences.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
