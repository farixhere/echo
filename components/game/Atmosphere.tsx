'use client';

type Props = { discovered: string[]; onMove: (x: number, y: number) => void };
export default function Atmosphere({ discovered, onMove }: Props) {
  return <>
    <div className="ambient ambient-one" aria-hidden="true" />
    <div className="ambient ambient-two" aria-hidden="true" />
    <button className={`hotspot window ${discovered.includes('window') ? 'noticed' : ''}`} style={{ left: '20%', top: '23%' }} onClick={() => onMove(20,23)} aria-label="Move toward the window" type="button"><span /></button>
    <button className={`hotspot stone ${discovered.includes('stone') ? 'noticed' : ''}`} style={{ left: '25%', top: '75%' }} onClick={() => onMove(25,75)} aria-label="Move toward the stone" type="button" />
  </>;
}
