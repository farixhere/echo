'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('ECHO runtime error', error); }, [error]);

  return (
    <main style={{ minHeight: '100svh', display: 'grid', placeItems: 'center', background: '#05070a', color: '#d7edf5', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ maxWidth: 560, textAlign: 'center' }}>
        <p style={{ color: '#ff9eaa', letterSpacing: '.2em', fontSize: 11 }}>ECHO · RECOVERY</p>
        <h1 style={{ fontSize: 'clamp(40px, 10vw, 76px)', lineHeight: .95, margin: '14px 0' }}>THE MEMORY STUTTERED</h1>
        <p style={{ color: '#718390', lineHeight: 1.7 }}>The room hit an unexpected error. Your saved memory is stored separately, so a recovery should not erase it.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 9, flexWrap: 'wrap', marginTop: 20 }}>
          <button onClick={reset} style={{ border: 0, borderRadius: 10, padding: '11px 16px', background: '#d7f5ff', color: '#061019', fontWeight: 700, cursor: 'pointer' }}>Try again</button>
          <a href="/" style={{ border: '1px solid #2a3a46', borderRadius: 10, padding: '10px 15px', color: '#b8d4df', textDecoration: 'none' }}>Reload room</a>
        </div>
      </section>
    </main>
  );
}
