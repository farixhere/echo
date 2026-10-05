'use client';

import { useEffect, useState } from 'react';
import type { EchoState } from '../../types/game';
import {
  enterMemoryDoor,
  initialEchoState,
  inspectMemoryDoor,
  touchMemoryOrb,
} from '../../lib/game-state';
import { clearEchoState, loadEchoState, saveEchoState } from '../../lib/storage';
import Atmosphere from './Atmosphere';
import MemoryOrb from './MemoryOrb';
import MysteryDoor from './MysteryDoor';

const INITIAL_MESSAGE = 'The room is quiet. Something is waiting.';

export default function EchoRoom() {
  const [state, setState] = useState<EchoState>(initialEchoState);
  const [message, setMessage] = useState(INITIAL_MESSAGE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadEchoState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveEchoState(state);
  }, [hydrated, state]);

  function touchOrb() {
    const wasTouched = state.orbTouched;
    setState((current) => touchMemoryOrb(current));
    setMessage(wasTouched ? 'It remembers your touch.' : 'A pulse moves through the room.');
  }

  function inspectDoor() {
    if (!state.orbTouched) {
      setMessage('The door is silent. Perhaps the room wants you to notice something else.');
      return;
    }
    setState((current) => inspectMemoryDoor(current));
    setMessage('The door reacts to something you did before.');
  }

  function enterDoor() {
    if (!state.doorUnlocked) {
      setMessage('The door will not move.');
      return;
    }
    setState((current) => enterMemoryDoor(current));
    setMessage('Beyond the door, you hear the exact pulse you made earlier.');
  }

  function reset() {
    setState(initialEchoState);
    setMessage('Memory erased. The room is quiet again.');
    clearEchoState();
  }

  const status = state.hasSeenEcho
    ? 'ECHO FOUND'
    : state.doorUnlocked
      ? 'DOOR AWAKE'
      : state.orbTouched
        ? 'ROOM AWAKE'
        : 'DORMANT';

  return (
    <main className="game-shell">
      <header className="hud">
        <div>
          <span className="eyebrow">PROJECT 03</span>
          <h1>ECHO</h1>
          <p>The world remembers what you do.</p>
        </div>
        <button className="reset" onClick={reset} type="button">Reset memory</button>
      </header>

      <section className={`room ${state.orbTouched ? 'awakened' : ''}`} aria-label="The Room That Remembers">
        <Atmosphere />
        <div className="door-zone">
          <MysteryDoor
            unlocked={state.doorUnlocked}
            onInspect={inspectDoor}
            onEnter={enterDoor}
          />
        </div>
        <MemoryOrb active={state.orbTouched} onTouch={touchOrb} />
        {state.hasSeenEcho && <div className="echo-trace" aria-hidden="true" />}
      </section>

      <section className="message" aria-live="polite">
        <span className="dot" aria-hidden="true" />
        {message}
      </section>

      <div className="progress" aria-label={`Memory ${state.memoryCount}. Status ${status}`}>
        <span>MEMORY</span>
        <strong>{state.memoryCount}</strong>
        <span className="separator">·</span>
        <span>{status}</span>
      </div>
    </main>
  );
}
