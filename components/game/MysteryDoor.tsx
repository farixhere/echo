'use client';

type Props = { awake: boolean; discovered: boolean; onMove: () => void };
export default function MysteryDoor({ awake, discovered, onMove }: Props) {
  return <button className={`hotspot door ${awake ? 'unlocked' : ''} ${discovered ? 'noticed' : ''}`} style={{ left: '76%', top: '22%' }} onClick={onMove} aria-label="Move toward the door" type="button"><span>{awake ? 'OPEN' : 'DOOR'}</span></button>;
}
