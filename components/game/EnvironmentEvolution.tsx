'use client';

import type { CSSProperties } from 'react';

type Props = {
  orbTaken: boolean;
  windowOpened: boolean;
  stoneMoved: boolean;
  complete: boolean;
  route: string;
  echoActive: boolean;
  echoResolved: boolean;
};

export default function EnvironmentEvolution({ orbTaken, windowOpened, stoneMoved, complete, route, echoActive, echoResolved }: Props) {
  const rain = Array.from({ length: 18 }, (_, i) => i);
  const dust = Array.from({ length: 10 }, (_, i) => i);
  const memoryLevel = Number(orbTaken) + Number(windowOpened) + Number(stoneMoved);
  const runLevel = 0;
  const instability = Math.min(1, memoryLevel / 3 + (runLevel > 0 ? 0.12 : 0));
  const style = { '--instability': instability } as CSSProperties;

  return (
    <div className={['environment-evolution',`memory-stage-${memoryLevel}`,complete?'environment-final':'',echoActive?'environment-echo':'',echoResolved?'environment-echo-resolved':'',orbTaken?'environment-orb-taken':'',windowOpened?'environment-window-open':'',stoneMoved?'environment-stone-moved':'',`environment-route-${route}`].filter(Boolean).join(' ')} style={style} aria-hidden="true">
      <div className="environment-ceiling" /><div className="ceiling-light" />
      <div className="ceiling-fissure fissure-a" /><div className="ceiling-fissure fissure-b" />
      <div className="wall-plane wall-left" /><div className="wall-plane wall-right" />
      <div className="wall-crack wall-crack-a" /><div className="wall-crack wall-crack-b" /><div className="wall-crack wall-crack-c" />
      <div className="floor-shadow" /><div className="floor-seam seam-a" /><div className="floor-seam seam-b" /><div className="floor-seam seam-c" />
      <div className="door-light" /><div className="door-aura" /><div className="window-aura" /><div className="orb-aura" /><div className="room-vignette" />
      {windowOpened && <div className="rain-field">{rain.map((i) => <i key={i} style={{ '--rain-i': i } as CSSProperties} />)}</div>}
      {orbTaken && <div className="missing-light" />}
      {stoneMoved && <><div className="fingerprint-mark" /><div className="floor-breach" /></>}
      {complete && <div className="memory-resonance" />}
      <div className="memory-fractures"><i className="fracture fracture-1" /><i className="fracture fracture-2" /><i className="fracture fracture-3" /><i className="fracture fracture-4" /><i className="fracture fracture-5" /></div>
      <div className="floating-dust">{dust.map((i) => <i key={i} style={{ '--dust-i': i } as CSSProperties} />)}</div>
      {echoActive && <div className="echo-shadow" />}{echoResolved && <div className="resolved-silence" />}
      <div className="route-aura route-aura-thief" /><div className="route-aura route-aura-witness" /><div className="route-aura route-aura-breach" /><div className="route-aura route-aura-keeper" />
      <div className="environment-instability" /><div className="environment-final-glow" />
    </div>
  );
}
