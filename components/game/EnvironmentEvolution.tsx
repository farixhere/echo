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

export default function EnvironmentEvolution({
  orbTaken, windowOpened, stoneMoved, complete, route, echoActive, echoResolved,
}: Props) {
  const rain = Array.from({ length: 14 }, (_, i) => i);
  return (
    <div className="environment-evolution" aria-hidden="true">
      <div className="ceiling-light" />
      <div className="wall-crack wall-crack-a" />
      <div className="wall-crack wall-crack-b" />
      <div className="floor-shadow" />
      <div className="door-light" />
      <div className="room-vignette" />
      {windowOpened && (
        <div className="rain-field">
          {rain.map((i) => <i key={i} style={{ '--rain-i': i } as CSSProperties} />)}
        </div>
      )}
      {orbTaken && <div className="missing-light" />}
      {stoneMoved && <div className="fingerprint-mark" />}
      {complete && <div className="memory-resonance" />}
      {echoActive && <div className="echo-shadow" />}
      {echoResolved && <div className="resolved-silence" />}
      <div className={'route-aura route-aura-' + route} />
    </div>
  );
}
