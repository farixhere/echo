'use client';

import { useEffect, useMemo, useState } from 'react';
import type { EchoState, HotspotId } from '../../types/game';
import { awakenDoor, discover, findEcho, initialEchoState } from '../../lib/game-state';
import { clearEchoState, loadEchoState, saveEchoState } from '../../lib/storage';
import Atmosphere from './Atmosphere';
import MemoryOrb from './MemoryOrb';
import MysteryDoor from './MysteryDoor';

const spots: Record<HotspotId, [number, number]> = { orb: [48,59], door: [76,22], window: [20,23], stone: [25,75] };
const names: Record<HotspotId, string> = { orb: 'the strange light', door: 'the door', window: 'the window', stone: 'the stone' };

export default function EchoRoom() {
  const [state, setState] = useState<EchoState>(initialEchoState);
  const [message, setMessage] = useState('You wake in a room you do not remember entering. Explore.');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setState(loadEchoState()); setHydrated(true); }, []);
  useEffect(() => { if (hydrated) saveEchoState(state); }, [hydrated, state]);

  const nearest = useMemo(() => {
    let best: HotspotId | null = null; let distance = Infinity;
    (Object.keys(spots) as HotspotId[]).forEach((id) => {
      const [x,y] = spots[id]; const d = Math.hypot(state.playerX-x, state.playerY-y);
      if (d < distance) { distance = d; best = id; }
    });
    return distance < 10 ? best : null;
  }, [state.playerX, state.playerY]);

  function moveTo(x: number, y: number) {
    setState((s) => ({ ...s, playerX: x, playerY: y }));
    setMessage('');
  }

  function moveBy(dx: number, dy: number) {
    moveTo(Math.min(92, Math.max(8, state.playerX + dx)), Math.min(90, Math.max(12, state.playerY + dy)));
  }

  function interact() {
    if (!nearest) return;
    if (nearest === 'door' && !state.doorAwake) {
      if (!state.discovered.includes('orb')) { setMessage('The door has no handle. Something in the room must come first.'); return; }
      setState((s) => awakenDoor(discover(s, 'door'))); setMessage('The door remembers you. It opens without being touched.'); return;
    }
    if (nearest === 'door' && state.doorAwake) { setState(findEcho); setMessage('You step through. Somewhere behind you, your first footsteps happen again.'); return; }
    setState((s) => discover(s, nearest));
    const text: Record<HotspotId,string> = { orb: 'You reach toward the light. It pulses in time with your movement.', window: 'Outside: rain, but no sky. You feel certain you have seen this view before.', stone: 'A small stone. There is a fingerprint pressed into its surface — yours.', door: 'The door is older than the room. It seems to be waiting for a memory.' };
    setMessage(text[nearest]);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') moveBy(0,-3);
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') moveBy(0,3);
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') moveBy(-3,0);
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') moveBy(3,0);
      if (e.key === ' ' || e.key === 'Enter') interact();
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  });

  function reset() { setState(initialEchoState); setMessage('The room forgets. You wake again.'); clearEchoState(); }
  const status = state.hasSeenEcho ? 'ECHO FOUND' : state.doorAwake ? 'DOOR AWAKE' : state.discovered.length ? 'EXPLORING' : 'DORMANT';

  return <main className="game-shell">
    <header className="hud"><div><span className="eyebrow">PROJECT 03 · MEMORY 01</span><h1>ECHO</h1><p>Nothing here tells you what to do.</p></div><button className="reset" onClick={reset} type="button">Reset memory</button></header>
    <section className={`room ${state.discovered.length ? 'awakened' : ''}`} aria-label="An explorable memory room" onClick={(e) => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); moveTo(((e.clientX-r.left)/r.width)*100, ((e.clientY-r.top)/r.height)*100); } }}>
      <Atmosphere discovered={state.discovered} onMove={moveTo} />
      <MysteryDoor awake={state.doorAwake} discovered={state.discovered.includes('door')} onMove={() => moveTo(...spots.door)} />
      <MemoryOrb discovered={state.discovered.includes('orb')} onMove={() => moveTo(...spots.orb)} />
      <div className={`player ${nearest ? 'near' : ''}`} style={{ left: `${state.playerX}%`, top: `${state.playerY}%` }} aria-label="You" />
      {state.hasSeenEcho && <div className="echo-trace" aria-hidden="true" />}
      {nearest && <button className="interact" onClick={interact} type="button">{nearest === 'door' && state.doorAwake ? 'ENTER' : `EXAMINE ${nearest ? names[nearest].toUpperCase() : ''}`} <span>SPACE</span></button>}
      <div className="hint">CLICK TO MOVE · WASD / ARROWS · EXAMINE WHEN CLOSE</div>
    </section>
    <section className="message" aria-live="polite"><span className="dot" aria-hidden="true" />{message || 'The room listens.'}</section>
    <div className="progress"><span>MEMORIES</span><strong>{state.memoryCount}</strong><span className="separator">·</span><span>{status}</span><span className="separator">·</span><span>{state.discovered.length}/4 FOUND</span></div>
  </main>;
}
