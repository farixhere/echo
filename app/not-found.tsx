export default function NotFound() {
  return (
    <main style={{ minHeight: '100svh', display: 'grid', placeItems: 'center', background: '#05070a', color: '#d7edf5', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <section style={{ maxWidth: 520, textAlign: 'center' }}>
        <p style={{ color: '#9be2ff', letterSpacing: '.2em', fontSize: 11 }}>ECHO · 404</p>
        <h1 style={{ fontSize: 'clamp(48px, 12vw, 96px)', lineHeight: .9, margin: '14px 0' }}>THE ROOM IS GONE</h1>
        <p style={{ color: '#718390', lineHeight: 1.7 }}>This path does not belong to the room that remembers you.</p>
        <a href="/" style={{ display: 'inline-block', marginTop: 20, color: '#061019', background: '#d7f5ff', padding: '11px 16px', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>Return to ECHO</a>
      </section>
    </main>
  );
}
