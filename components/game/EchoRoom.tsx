'use client';

import { useEffect, useMemo, useState } from 'react';
import type { EchoState, HotspotId, WorldMemory } from '../../types/game';
import {
  awakenDoor,
  discover,
  findEcho,
  getWorldConsequences,
  initialEchoState,
  initialWorldMemory,
} from '../../lib/game-state';
import {
  clearEchoState,
  loadEchoState,
  loadWorldMemory,
  saveEchoState,
  saveWorldMemory,
} from '../../lib/storage';
import Atmosphere from './Atmosphere';
import MemoryOrb from './MemoryOrb';
import MysteryDoor from './MysteryDoor';

const spots: Record<HotspotId, [number, number]> = {
  orb: [48, 59],
  door: [76, 22],
  window: [20, 23],
  stone: [25, 75],
};

const names: Record<HotspotId, string> = {
  orb: 'the strange light',
  door: 'the door',
  window: 'the window',
  stone: 'the stone',
};

type Point = [number, number];
type ChoiceTarget = 'orb' | 'window' | 'stone' | null;
type Choice =
  | 'orb-taken'
  | 'orb-left'
  | 'window-opened'
  | 'window-closed'
  | 'stone-moved'
  | 'stone-kept';

const choiceCopy: Record<Choice, string> = {
  'orb-taken': 'The light collapses into your hand. The room goes darker.',
  'orb-left': 'You leave the light where it is. It follows you with its gaze.',
  'window-opened': 'You open the window. The rain comes in, but there is no sky.',
  'window-closed': 'You close the window. The rain outside stops instantly.',
  'stone-moved': 'You move the stone. Beneath it is a second fingerprint.',
  'stone-kept': 'You leave the stone untouched. Somewhere, something exhales.',
};

export default function EchoRoom() {
  const [state, setState] = useState<EchoState>(initialEchoState);
  const [world, setWorld] = useState<WorldMemory>(initialWorldMemory);
  const [message, setMessage] = useState('You wake in a room you do not remember entering. Explore.');
  const [choiceTarget, setChoiceTarget] = useState<ChoiceTarget>(null);
  const [hydrated, setHydrated] = useState(false);
  const [path, setPath] = useState<Point[]>([[50, 72]]);
  const [echoIndex, setEchoIndex] = useState(0);

  const consequences = useMemo(() => getWorldConsequences(world), [world]);

  useEffect(() => {
    setState(loadEchoState());
    setWorld(loadWorldMemory());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveEchoState(state);
  }, [hydrated, state]);

  useEffect(() => {
    if (hydrated) saveWorldMemory(world);
  }, [hydrated, world]);

  const nearest = useMemo<HotspotId | null>(() => {
    let best: HotspotId | null = null;
    let distance = Infinity;

    (Object.keys(spots) as HotspotId[]).forEach((id) => {
      const [x, y] = spots[id];
      const d = Math.hypot(state.playerX - x, state.playerY - y);
      if (d < distance) {
        distance = d;
        best = id;
      }
    });

    return distance < 10 ? best : null;
  }, [state.playerX, state.playerY]);

  const echoActive = state.discovered.length >= 2 && path.length >= 5 && !state.hasSeenEcho;

  useEffect(() => {
    if (!echoActive) {
      setEchoIndex(0);
      return;
    }

    const timer = window.setInterval(
      () => setEchoIndex((index) => (index + 1) % path.length),
      260,
    );

    return () => window.clearInterval(timer);
  }, [echoActive, path.length]);

  const echoPosition = path[echoIndex] ?? path[0] ?? [50, 72];
  const echoNearPlayer =
    echoActive &&
    Math.hypot(state.playerX - echoPosition[0], state.playerY - echoPosition[1]) < 7;

  useEffect(() => {
    if (!echoNearPlayer || state.hasSeenEcho) return;

    setState((current) => findEcho(current));
    setMessage(
      world.runs > 0
        ? 'The echo stops where your last run ended. It has been waiting.'
        : 'You find someone standing exactly where you stood moments ago. It is not you.',
    );
  }, [echoNearPlayer, state.hasSeenEcho, world.runs]);

  function rememberStep(x: number, y: number) {
    setPath((previous) => {
      const last = previous[previous.length - 1];
      if (last && Math.hypot(last[0] - x, last[1] - y) < 1.5) return previous;
      return [...previous.slice(-31), [x, y]];
    });
  }

  function moveTo(x: number, y: number) {
    const nextX = Math.min(92, Math.max(8, x));
    const nextY = Math.min(90, Math.max(12, y));

    rememberStep(nextX, nextY);
    setState((current) => ({ ...current, playerX: nextX, playerY: nextY }));
    setMessage('');
    setChoiceTarget(null);
  }

  function moveBy(dx: number, dy: number) {
    moveTo(state.playerX + dx, state.playerY + dy);
  }

  function inspectMessage(id: HotspotId): string {
    if (id === 'orb') {
      if (consequences.orbTaken && consequences.windowOpened) {
        return 'The light is gone. In the glass, you can still see it in your hand.';
      }
      if (consequences.orbTaken) {
        return 'The empty place where the light was still feels warm. Your hand remembers holding it.';
      }
      if (consequences.windowOpened) {
        return 'The light contains a reflection of the room. It should not be able to do that.';
      }
      if (world.orbChoice === 'left') {
        return 'The light pulses. It remembers being left behind.';
      }
      return 'The light pulses in time with your movement.';
    }

    if (id === 'window') {
      if (consequences.windowOpened && consequences.stoneMoved) {
        return 'Rainwater has reached the stone. The fingerprint beneath it is slowly filling with water.';
      }
      if (consequences.orbTaken) {
        return 'The glass reflects your hand holding something that is no longer here.';
      }
      if (consequences.windowOpened) {
        return 'Rain is falling inward now. The room has changed its mind.';
      }
      if (world.windowChoice === 'closed') {
        return 'The window is shut. Something outside is waiting.';
      }
      return 'There is rain beyond the glass, but no sky.';
    }

    if (id === 'stone') {
      if (consequences.stoneMoved && consequences.windowOpened) {
        return 'The stone is wet. Beneath it, the second fingerprint is filled with rain.';
      }
      if (consequences.stoneMoved) {
        return 'The stone is gone. But its fingerprint remains on the floor.';
      }
      if (consequences.orbTaken) {
        return 'The stone feels cold. It seems to be keeping the light you took.';
      }
      if (world.stoneChoice === 'kept') {
        return 'The stone has not moved. It feels heavier than before.';
      }
      return 'A small stone. The surface carries a fingerprint shaped exactly like yours.';
    }

    if (consequences.stoneMoved && consequences.orbTaken) {
      return 'A second fingerprint now sits where the handle should be. The door knows what you took.';
    }
    if (consequences.windowOpened) {
      return 'Rain has found its way beneath the door. It was not there before.';
    }
    if (consequences.stoneMoved) {
      return 'The door is warm now. Something on the other side has noticed the missing stone.';
    }
    return 'The door is older than the room. It seems to be waiting for a memory.';
  }

  function interact() {
    if (!nearest) return;

    if (nearest === 'door' && !state.doorAwake) {
      if (!state.discovered.includes('orb')) {
        setMessage(
          consequences.orbTaken
            ? 'The light is gone, and the door will not open without another memory.'
            : 'The door has no handle. Something in the room must come first.',
        );
        return;
      }

      setState((current) => awakenDoor(current));
      setMessage(
        consequences.stoneMoved
          ? 'The door remembers the stone. It opens without being touched.'
          : 'The door remembers you. It opens without being touched.',
      );
      return;
    }

    if (nearest === 'door' && state.doorAwake) {
      setState(findEcho);
      setMessage(
        consequences.hasCompleteSet
          ? 'You step through. Behind you, the room remembers every choice you made.'
          : 'You step through. Somewhere behind you, your first footsteps happen again.',
      );
      return;
    }

    const needsChoice =
      (nearest === 'orb' && !world.orbChoice) ||
      (nearest === 'window' && !world.windowChoice) ||
      (nearest === 'stone' && !world.stoneChoice);

    if (needsChoice) {
      setChoiceTarget(nearest);
      return;
    }

    setState((current) => discover(current, nearest));
    setMessage(inspectMessage(nearest));
  }

  function choose(choice: Choice) {
    if (!choiceTarget) return;

    const nextWorld: WorldMemory = { ...world };

    if (choice.startsWith('orb-')) {
      nextWorld.orbChoice = choice === 'orb-taken' ? 'taken' : 'left';
    }
    if (choice.startsWith('window-')) {
      nextWorld.windowChoice = choice === 'window-opened' ? 'opened' : 'closed';
    }
    if (choice.startsWith('stone-')) {
      nextWorld.stoneChoice = choice === 'stone-moved' ? 'moved' : 'kept';
    }

    setWorld(nextWorld);
    setState((current) => discover(current, choiceTarget));
    setChoiceTarget(null);
    setMessage(choiceCopy[choice]);
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (choiceTarget) return;

      if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') moveBy(0, -3);
      if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') moveBy(0, 3);
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') moveBy(-3, 0);
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') moveBy(3, 0);
      if (event.key === ' ' || event.key === 'Enter') interact();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function resetRun() {
    const nextWorld = { ...world, runs: world.runs + 1 };

    setWorld(nextWorld);
    saveWorldMemory(nextWorld);
    setState(initialEchoState);
    setPath([[50, 72]]);
    setEchoIndex(0);
    setChoiceTarget(null);
    setMessage('The room forgets your body. It does not forget your choices.');
    clearEchoState();
  }

  const status = state.hasSeenEcho
    ? 'ECHO FOUND'
    : echoActive
      ? 'SOMETHING REMEMBERS'
      : state.doorAwake
        ? 'DOOR AWAKE'
        : state.discovered.length
          ? 'EXPLORING'
          : 'DORMANT';

  return (
    <main className="game-shell">
      <header className="hud">
        <div>
          <span className="eyebrow">PROJECT 03 · MEMORY 01</span>
          <h1>ECHO</h1>
          <p>
            {world.runs
              ? `RUN ${world.runs + 1} · THE ROOM REMEMBERS`
              : 'Nothing here tells you what to do.'}
          </p>
        </div>
        <button className="reset" onClick={resetRun} type="button">
          Begin again
        </button>
      </header>

      <section
        className={[
          'room',
          state.discovered.length ? 'awakened' : '',
          echoActive ? 'echo-active' : '',
          consequences.orbTaken ? 'orb-missing' : '',
          consequences.windowOpened ? 'window-opened' : '',
          consequences.stoneMoved ? 'stone-moved' : '',
          consequences.hasCompleteSet ? 'memory-complete' : '',
        ].filter(Boolean).join(' ')}
        aria-label="An explorable memory room"
        onClick={(event) => {
          if (event.target === event.currentTarget && !choiceTarget) {
            const rect = event.currentTarget.getBoundingClientRect();
            moveTo(
              ((event.clientX - rect.left) / rect.width) * 100,
              ((event.clientY - rect.top) / rect.height) * 100,
            );
          }
        }}
      >
        <Atmosphere discovered={state.discovered} onMove={moveTo} />
        <MysteryDoor
          awake={state.doorAwake}
          discovered={state.discovered.includes('door')}
          onMove={() => moveTo(...spots.door)}
        />
        <MemoryOrb
          discovered={state.discovered.includes('orb')}
          onMove={() => moveTo(...spots.orb)}
        />

        {path.length > 2 && (
          <div className="memory-path" aria-hidden="true">
            {path
              .filter((_, index) => index % 3 === 0)
              .map(([x, y], index) => (
                <i key={`${x}-${y}-${index}`} style={{ left: `${x}%`, top: `${y}%` }} />
              ))}
          </div>
        )}

        {echoActive && (
          <div
            className={`echo-figure ${echoNearPlayer ? 'close' : ''}`}
            style={{ left: `${echoPosition[0]}%`, top: `${echoPosition[1]}%` }}
            aria-hidden="true"
          />
        )}

        <div
          className={`player ${nearest ? 'near' : ''}`}
          style={{ left: `${state.playerX}%`, top: `${state.playerY}%` }}
          aria-label="You"
        />

        {state.hasSeenEcho && <div className="echo-trace" aria-hidden="true" />}

        {choiceTarget && (
          <div className="choice-card" role="dialog" aria-label="A memory choice">
            <span className="choice-kicker">THE ROOM WILL REMEMBER THIS</span>
            <strong>
              {choiceTarget === 'orb'
                ? 'THE LIGHT'
                : choiceTarget === 'window'
                  ? 'THE WINDOW'
                  : 'THE STONE'}
            </strong>
            <p>
              {choiceTarget === 'orb'
                ? 'Take it, or leave it behind.'
                : choiceTarget === 'window'
                  ? 'Open it, or keep the rain outside.'
                  : 'Move it, or trust what is underneath.'}
            </p>
            <div className="choice-actions">
              {choiceTarget === 'orb' && (
                <>
                  <button onClick={() => choose('orb-taken')}>TAKE THE LIGHT</button>
                  <button onClick={() => choose('orb-left')}>LEAVE IT</button>
                </>
              )}
              {choiceTarget === 'window' && (
                <>
                  <button onClick={() => choose('window-opened')}>OPEN WINDOW</button>
                  <button onClick={() => choose('window-closed')}>KEEP IT CLOSED</button>
                </>
              )}
              {choiceTarget === 'stone' && (
                <>
                  <button onClick={() => choose('stone-moved')}>MOVE STONE</button>
                  <button onClick={() => choose('stone-kept')}>LEAVE IT</button>
                </>
              )}
            </div>
          </div>
        )}

        {nearest && !choiceTarget && (
          <button className="interact" onClick={interact} type="button">
            {nearest === 'door' && state.doorAwake
              ? 'ENTER'
              : `EXAMINE ${names[nearest].toUpperCase()}`}
            <span>SPACE</span>
          </button>
        )}

        <div className="hint">CLICK TO MOVE · WASD / ARROWS · EXAMINE WHEN CLOSE</div>

        {echoActive && !echoNearPlayer && (
          <div className="echo-whisper">SOMETHING IS WALKING YOUR OLD PATH</div>
        )}

        {consequences.memories > 0 && (
          <div className="memory-counter" aria-label={`${consequences.memories} persistent choices`}>
            {consequences.memories}/3 REMEMBERED
          </div>
        )}
      </section>

      <section className="message" aria-live="polite">
        <span className="dot" aria-hidden="true" />
        {message || 'The room listens.'}
      </section>

      <div className="progress">
        <span>RUNS</span>
        <strong>{world.runs + 1}</strong>
        <span className="separator">·</span>
        <span>MEMORIES</span>
        <strong>{state.memoryCount}</strong>
        <span className="separator">·</span>
        <span>{status}</span>
        <span className="separator">·</span>
        <span>{state.discovered.length}/4 FOUND</span>
      </div>
    </main>
  );
}
