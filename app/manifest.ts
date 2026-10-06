import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ECHO — The Room That Remembers',
    short_name: 'ECHO',
    description: 'An atmospheric browser game where the room remembers what you do.',
    start_url: '/',
    display: 'standalone',
    background_color: '#05070a',
    theme_color: '#05070a',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}
