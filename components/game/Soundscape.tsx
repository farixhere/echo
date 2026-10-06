'use client';

import { useEffect, useRef, useState } from 'react';
import {
  isAudioEnabled,
  setAudioEnabled,
  soundEcho,
  soundEnding,
  soundInspect,
  soundChoice,
  soundDoor,
  soundStep,
  startAudio,
  updateAudioScene,
} from '../../lib/audio';

type Props = {
  scene: { intensity: number; echoDanger: number; memoryComplete: boolean };
  moveTick: number;
  interaction?: { kind: 'orb' | 'window' | 'stone' | 'door'; token: number };
  choice?: { kind: 'orb' | 'window' | 'stone'; positive: boolean; token: number };
  echoPhase?: 'dormant' | 'glimpse' | 'stalking' | 'confrontation' | 'resolved';
  endingIndex?: number | null;
};

export default function Soundscape({ scene, moveTick, interaction, choice, echoPhase, endingIndex }: Props) {
  const [enabled, setEnabled] = useState(true);
  const [started, setStarted] = useState(false);
  const lastMove = useRef(0);
  const lastInteraction = useRef(0);
  const lastChoice = useRef(0);
  const lastEcho = useRef<string>('dormant');
  const lastEnding = useRef<number | null>(null);

  useEffect(() => setEnabled(isAudioEnabled()), []);

  useEffect(() => {
    updateAudioScene(scene);
  }, [scene]);

  useEffect(() => {
    if (!moveTick || moveTick === lastMove.current) return;
    lastMove.current = moveTick;
    if (started) soundStep();
  }, [moveTick, started]);

  useEffect(() => {
    if (!interaction || interaction.token === lastInteraction.current) return;
    lastInteraction.current = interaction.token;
    if (started) soundInspect(interaction.kind);
  }, [interaction, started]);

  useEffect(() => {
    if (!choice || choice.token === lastChoice.current) return;
    lastChoice.current = choice.token;
    if (started) soundChoice(choice.kind, choice.positive);
  }, [choice, started]);

  useEffect(() => {
    if (!echoPhase || echoPhase === lastEcho.current) return;
    lastEcho.current = echoPhase;
    if (started && echoPhase !== 'dormant') soundEcho(echoPhase);
  }, [echoPhase, started]);

  useEffect(() => {
    if (endingIndex == null || endingIndex === lastEnding.current) return;
    lastEnding.current = endingIndex;
    if (started) soundEnding(endingIndex);
  }, [endingIndex, started]);

  async function enableAudio() {
    if (!enabled) {
      setAudioEnabled(true);
      setEnabled(true);
    }
    const ok = await startAudio();
    setStarted(ok);
  }

  function toggle() {
    const next = !enabled;
    setAudioEnabled(next);
    setEnabled(next);
    if (next) void enableAudio();
  }

  return (
    <>
      {!started && enabled && (
        <button className="sound-start" onClick={enableAudio} type="button" aria-label="Enable ECHO sound">
          SOUND ON <span>START</span>
        </button>
      )}
      <button className="sound-toggle" onClick={toggle} type="button" aria-label={enabled ? 'Mute sound' : 'Unmute sound'}>
        {enabled ? 'SOUND · ON' : 'SOUND · OFF'}
      </button>
    </>
  );
}
