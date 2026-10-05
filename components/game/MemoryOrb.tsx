'use client';

type Props = { discovered: boolean; onMove: () => void };
export default function MemoryOrb({ discovered, onMove }: Props) {
  return <button className={`hotspot orb ${discovered ? 'active' : ''}`} style={{ left: '48%', top: '59%' }} onClick={onMove} aria-label="Move toward the strange light" type="button"><span className="orb-core" />{discovered && <><span className="ring ring-one" /><span className="ring ring-two" /></>}</button>;
}
