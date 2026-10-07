'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { EchoState, HotspotId, ReplayRecord, WorldMemory } from '../../types/game';
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
import { getStoryProgress, getStoryState } from '../../lib/story';
import { getEchoBehavior, getEchoEncounter, nextEchoPhase } from '../../lib/echo-encounter';
import { getEnding, type FinalChoice, type EndingState } from '../../lib/endings';
import Soundscape from './Soundscape';
import EnvironmentEvolution from './EnvironmentEvolution';
import GameMenu from './GameMenu';

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
  const [finalChoice, setFinalChoice] = useState(false);
  const [ending, setEnding] = useState<EndingState | null>(null);
  const [moveTick, setMoveTick] = useState(0);
  const [interaction, setInteraction] = useState<{ kind: HotspotId; token: number } | undefined>();
  const [choiceSound, setChoiceSound] = useState<{ kind: 'orb' | 'window' | 'stone'; positive: boolean; token: number } | undefined>();
  const [impact, setImpact] = useState<'none' | 'soft' | 'strong'>('none');
  const roomRef = useRef<HTMLElement | null>(null);
  const impactTimer = useRef<number | null>(null);
  const [secretHint, setSecretHint] = useState<string | null>(null);
  const [replayPanel, setReplayPanel] = useState<'none' | 'archive' | 'map' | 'changes'>('none');
  const [menuOpen, setMenuOpen] = useState(true);

  const consequences = useMemo(() => getWorldConsequences(world), [world]);
  const story = useMemo(() => getStoryState(world), [world]);
  const storyProgress = useMemo(() => getStoryProgress(world), [world]);
  const echoBehavior = useMemo(() => getEchoBehavior(world), [world]);
  const encounter = useMemo(() => getEchoEncounter(world, state.echoPhase), [world, state.echoPhase]);

  useEffect(() => {
    setState(loadEchoState());
    setWorld(loadWorldMemory());
    setHydrated(true);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
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

  const echoActive = state.echoPhase !== 'dormant' && state.echoPhase !== 'resolved' && !state.hasSeenEcho;

  useEffect(() => {
    const nextPhase = nextEchoPhase(state.echoPhase, state.discovered.length, path.length, state.hasSeenEcho);
    if (nextPhase !== state.echoPhase) {
      setState((current) => ({ ...current, echoPhase: nextPhase }));
    }
  }, [path.length, state.discovered.length, state.echoPhase, state.hasSeenEcho]);

  useEffect(() => {
    if (!echoActive) {
      setEchoIndex(0);
      return;
    }

    const timer = window.setInterval(
      () => setEchoIndex((index) => (index + 1) % path.length),
      Math.max(130, Math.round(260 / encounter.speed)),
    );

    return () => window.clearInterval(timer);
  }, [echoActive, encounter.speed, path.length]);

  const replayIndex = echoBehavior === 'witness' ? Math.max(0, path.length - 1 - echoIndex) : echoIndex;
  const replayPoint = path[replayIndex] ?? path[0] ?? [50, 72];
  const breachPoint: Point = echoBehavior === 'breach' && consequences.stoneMoved ? spots.stone : replayPoint;
  const echoPosition: Point = state.echoPhase === 'confrontation'
    ? [state.playerX + (breachPoint[0] - state.playerX) * 0.35, state.playerY + (breachPoint[1] - state.playerY) * 0.35]
    : breachPoint;
  const echoNearPlayer =
    echoActive &&
    Math.hypot(state.playerX - echoPosition[0], state.playerY - echoPosition[1]) < (encounter.canApproach ? 8 : 6);

  useEffect(() => {
    if (!echoNearPlayer || state.hasSeenEcho) return;

    setState((current) => ({ ...findEcho(current), echoPhase: 'resolved' }));
    setWorld((current) => ({ ...current, echoResolved: true }));
    setMessage(
      world.runs > 0
        ? `${encounter.label} stops where your last run ended. ${story.route === 'thief' ? 'It holds out an empty hand.' : story.route === 'breach' ? 'It points toward the mark beneath the stone.' : story.route === 'witness' ? 'It turns toward the window before you do.' : 'It has been waiting.'}`
        : `${encounter.label} stands exactly where you stood moments ago. It is not you.`,
    );
  }, [echoNearPlayer, state.hasSeenEcho, world.runs]);

  function triggerImpact(kind: 'soft' | 'strong' = 'soft') {
    setImpact(kind);
    if (impactTimer.current) window.clearTimeout(impactTimer.current);
    impactTimer.current = window.setTimeout(() => setImpact('none'), kind === 'strong' ? 360 : 220);
  }

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
    setMoveTick((tick) => tick + 1);
    triggerImpact('soft');
    setState((current) => ({ ...current, playerX: nextX, playerY: nextY }));
    setMessage('');
    setChoiceTarget(null);
  }

  function moveBy(dx: number, dy: number) {
    moveTo(state.playerX + dx, state.playerY + dy);
  }

  const secretsFound = world.secretsFound ?? [];
  const secretFlags = world.secretFlags ?? [];

  function revealSecret(id: string, text: string) {
    if (secretsFound.includes(id)) return;
    const nextWorld = {
      ...world,
      secretsFound: [...secretsFound, id],
      secretFlags: { ...world.secretFlags, [id]: true },
    };
    setWorld(nextWorld);
    saveWorldMemory(nextWorld);
    setSecretHint(text);
    triggerImpact('strong');
  }

  function checkSecrets(id: HotspotId) {
    if (id === 'stone' && consequences.stoneMoved && world.runs > 0) {
      revealSecret('second-fingerprint', 'SECRET MEMORY · The second fingerprint belongs to the person who left the first echo.');
    } else if (id === 'window' && consequences.windowOpened && consequences.orbTaken) {
      revealSecret('mirror-run', 'SECRET MEMORY · The glass is showing another run. Someone is still inside it.');
    } else if (id === 'orb' && world.orbChoice === 'left' && world.runs > 0) {
      revealSecret('orb-whisper', 'SECRET MEMORY · The light remembers every hand that refused to take it.');
    } else if (id === 'door' && consequences.hasCompleteSet && state.hasSeenEcho) {
      revealSecret('echo-name', 'SECRET MEMORY · The Echo is not a creature. It is the room remembering a missing person.');
    }
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
    setInteraction({ kind: nearest, token: performance.now() });
    checkSecrets(nearest);
    triggerImpact(nearest === 'door' ? 'strong' : 'soft');

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
        story.stage === 'the-revelation'
          ? 'The door remembers everything. It opens onto the moment the room has reconstructed.'
          : consequences.stoneMoved
            ? 'The door remembers the stone. It opens without being touched.'
            : 'The door remembers you. It opens without being touched.',
      );
      return;
    }

    if (nearest === 'door' && state.doorAwake) {
      if (consequences.hasCompleteSet && !ending) {
        setFinalChoice(true);
        setMessage('The door opens onto the memory beneath every choice. It asks what you will do with it.');
        return;
      }

      setState(findEcho);
      setMessage(
        story.stage === 'the-revelation'
          ? `${story.narration} The memory is not an ending. Something is still missing.`
          : consequences.hasCompleteSet
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
    setChoiceSound({ kind: choiceTarget, positive: choice.endsWith('taken') || choice.endsWith('opened') || choice.endsWith('moved'), token: performance.now() });
    triggerImpact('strong');
    setState((current) => discover(current, choiceTarget));
    setChoiceTarget(null);
    setMessage(`${choiceCopy[choice]} ${getStoryState(nextWorld).clue}`);
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'escape') {
        event.preventDefault();
        setMenuOpen((open) => !open);
        setReplayPanel('none');
        setChoiceTarget(null);
        return;
      }
      if (menuOpen || replayPanel !== 'none' || choiceTarget || finalChoice || ending) return;
      if (event.key === 'ArrowUp' || key === 'w') { event.preventDefault(); moveBy(0, -3); }
      if (event.key === 'ArrowDown' || key === 's') { event.preventDefault(); moveBy(0, 3); }
      if (event.key === 'ArrowLeft' || key === 'a') { event.preventDefault(); moveBy(-3, 0); }
      if (event.key === 'ArrowRight' || key === 'd') { event.preventDefault(); moveBy(3, 0); }
      if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); interact(); }
    };
    const onVisibility = () => { if (document.hidden) setMenuOpen(true); };
    window.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [choiceTarget, ending, finalChoice, menuOpen, replayPanel]);

  const hasProgress = world.runs > 0 || state.discovered.length > 0 || (world.endingsSeen?.length ?? 0) > 0 || Boolean(world.orbChoice || world.windowChoice || world.stoneChoice);

  function startNewGame() {
    if (hasProgress) resetRun();
    setMenuOpen(false);
    setReplayPanel('none');
  }

  function resetRun() {
    const nextRun = world.runs + 1;
    const nextWorld = { ...world, runs: nextRun, newGamePlus: Boolean(world.endingsSeen?.length) };

    setWorld(nextWorld);
    saveWorldMemory(nextWorld);
    setState(initialEchoState);
    setPath([[50, 72]]);
    setEchoIndex(0);
    setChoiceTarget(null);
    setFinalChoice(false);
    setEnding(null);
    setMessage('The room forgets your body. It does not forget your choices.');
    clearEchoState();
  }

  function chooseEnding(choice: FinalChoice) {
    const result = getEnding(world, choice);
    const seen = Array.from(new Set([...(world.endingsSeen ?? []), result.id]));
    const record: ReplayRecord = {
      id: `${Date.now()}-${result.id}`,
      run: world.runs + 1,
      endingId: result.id,
      finalChoice: choice,
      orbChoice: world.orbChoice,
      windowChoice: world.windowChoice,
      stoneChoice: world.stoneChoice,
      memories: consequences.memories,
      timestamp: Date.now(),
    };
    const nextWorld = {
      ...world,
      endingsSeen: seen,
      runHistory: [...(world.runHistory ?? []), record].slice(-24),
      newGamePlus: true,
      echoResolved: world.echoResolved ?? state.hasSeenEcho,
    };
    setWorld(nextWorld);
    saveWorldMemory(nextWorld);
    setFinalChoice(false);
    setEnding(result);
    setMessage(result.consequence);
  }

  const soundScene = useMemo(() => ({
    intensity: Math.min(1, state.discovered.length / 4 + (consequences.hasCompleteSet ? 0.18 : 0)),
    echoDanger: echoActive ? (state.echoPhase === 'confrontation' ? 1 : state.echoPhase === 'stalking' ? 0.72 : 0.34) : 0,
    memoryComplete: consequences.hasCompleteSet,
  }), [consequences.hasCompleteSet, echoActive, state.discovered.length, state.echoPhase]);

  const endingIndex = ending ? ['the-release','the-keeper','the-witness','the-hunt','the-breach','the-return','the-empty-room','the-last-echo'].indexOf(ending.id) : null;
  const endingCount = world.endingsSeen?.length ?? 0;
  const replayCompletion = Math.round((endingCount / 8) * 100);
  const history = [...(world.runHistory ?? [])].reverse();
  const previousRun = history[1] ?? history[0];
  const currentChoices = `${world.orbChoice === 'taken' ? 'T' : world.orbChoice === 'left' ? 'L' : '—'} · ${world.windowChoice === 'opened' ? 'O' : world.windowChoice === 'closed' ? 'C' : '—'} · ${world.stoneChoice === 'moved' ? 'M' : world.stoneChoice === 'kept' ? 'K' : '—'}`;

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
      <GameMenu
        open={menuOpen}
        hasProgress={hasProgress}
        newGamePlus={Boolean(world.newGamePlus)}
        endingCount={endingCount}
        memories={consequences.memories}
        onContinue={() => setMenuOpen(false)}
        onNewGame={startNewGame}
        onOpenArchive={() => { setMenuOpen(false); setReplayPanel('archive'); }}
      />
      <Soundscape scene={soundScene} moveTick={moveTick} interaction={interaction} choice={choiceSound} echoPhase={state.echoPhase} endingIndex={endingIndex} />

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
        <div className="hud-actions">
          <button className="menu-trigger" onClick={() => setMenuOpen(true)} type="button" aria-label="Open ECHO menu">MENU</button>
          <button className="reset" onClick={resetRun} type="button">
            {world.newGamePlus ? 'Begin again · NG+' : 'Begin again'}
          </button>
        </div>
      </header>


      <section className={`replay-bar ${world.newGamePlus ? 'ng-plus' : ''}`} aria-label="Replay and ending archive">
        <div className="replay-tabs">
          <button className={replayPanel === 'archive' ? 'active' : ''} onClick={() => setReplayPanel(replayPanel === 'archive' ? 'none' : 'archive')} type="button">ENDINGS</button>
          <button className={replayPanel === 'map' ? 'active' : ''} onClick={() => setReplayPanel(replayPanel === 'map' ? 'none' : 'map')} type="button">BRANCH MAP</button>
          <button className={replayPanel === 'changes' ? 'active' : ''} onClick={() => setReplayPanel(replayPanel === 'changes' ? 'none' : 'changes')} type="button">WHAT CHANGED</button>
        </div>
        <div className="replay-progress"><span>{world.newGamePlus ? 'NEW GAME+' : 'FIRST RUN'}</span><b>{endingCount}/8</b><span>{replayCompletion}%</span></div>
      </section>

      {replayPanel !== 'none' && (
        <section className="replay-panel" aria-live="polite">
          {replayPanel === 'archive' && (
            <>
              <div className="replay-heading"><div><span className="eyebrow">MEMORY ARCHIVE</span><h2>Eight ways the room can remember you.</h2></div><strong>{endingCount}/8</strong></div>
              <div className="replay-grid">
                {(['the-release','the-keeper','the-witness','the-hunt','the-breach','the-return','the-empty-room','the-last-echo'] as string[]).map((id, index) => {
                  const unlocked = (world.endingsSeen ?? []).includes(id);
                  const titles = ['THE RELEASE','THE KEEPER','THE WITNESS','THE HUNT','THE BREACH','THE RETURN','THE EMPTY ROOM','THE LAST ECHO'];
                  const clues = [
                    'Leave after all three memories are complete.',
                    'Stay when the room has nothing left to show.',
                    'Follow the Echo after opening the window.',
                    'Follow after taking the light.',
                    'Follow after opening the window and moving the stone.',
                    'Leave after the Echo has already been resolved.',
                    'Reach an ending without triggering a special memory.',
                    'Stay after a previous run has already changed the room.'
                  ];
                  return (
                    <article key={id} className={`replay-card ${unlocked ? 'unlocked' : ''}`}>
                      <span className="num">{String(index + 1).padStart(2,'0')}</span>
                      <h3>{unlocked ? titles[index] : 'UNKNOWN MEMORY'}</h3>
                      <p>{unlocked ? 'This ending is part of your remembered history.' : 'The room has not shown you this route yet.'}</p>
                      <small>{unlocked ? 'UNLOCKED' : clues[index]}</small>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {replayPanel === 'map' && (
            <>
              <div className="replay-heading"><div><span className="eyebrow">RUN HISTORY</span><h2>Every attempt leaves a branch.</h2></div><strong>{history.length} RUNS</strong></div>
              {history.length === 0 ? (
                <div className="replay-empty">Finish an ending and the branch map will begin recording your path.</div>
              ) : (
                <div className="replay-runs">
                  {history.map((run) => (
                    <div className="replay-run" key={run.id}>
                      <span className="run-id">RUN {String(run.run).padStart(2,'0')}</span>
                      <div><div className="run-title">{run.endingId.replaceAll('-', ' ').toUpperCase()}</div><div className="run-meta">{run.memories}/3 memories · {run.orbChoice ?? 'orb —'} · {run.windowChoice ?? 'window —'} · {run.stoneChoice ?? 'stone —'}</div></div>
                      <span className="run-choice">{run.finalChoice.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {replayPanel === 'changes' && (
            <>
              <div className="replay-heading"><div><span className="eyebrow">WHAT CHANGED</span><h2>The next run is never identical.</h2></div><strong>{world.newGamePlus ? 'NG+' : 'RUN 01'}</strong></div>
              <div className="replay-diff">
                <article><span>CHOICES</span><b>{currentChoices}</b><small>The three persistent choices currently shaping the room.</small></article>
                <article><span>PREVIOUS ENDING</span><b>{previousRun ? previousRun.endingId.replaceAll('-', ' ').toUpperCase() : '—'}</b><small>{previousRun ? 'The last completed route remains in memory.' : 'Complete an ending to create replay memory.'}</small></article>
                <article><span>ECHO</span><b>{world.echoResolved ? 'RESOLVED' : 'UNRESOLVED'}</b><small>{world.echoResolved ? 'The room has already learned how your Echo behaves.' : 'This run can still define the Echo.'}</small></article>
                <article><span>COLLECTION</span><b>{endingCount}/8</b><small>{endingCount === 8 ? 'Every ending is remembered.' : `${8 - endingCount} ending${8-endingCount===1?'':'s'} still hidden.`}</small></article>
              </div>
              <div className="replay-cta"><button onClick={() => setReplayPanel('archive')} type="button">OPEN ENDING ARCHIVE</button></div>
            </>
          )}
        </section>
      )}

      <section className="story-card" aria-live="polite">
        <div className="story-topline">
          <span>{story.chapter}</span>
          <span>{story.route === 'unwritten' ? 'PATH UNWRITTEN' : `PATH: ${story.route.toUpperCase()} · ${story.branchKey}`}</span>
        </div>
        <p>{story.narration}</p>
        <div className="story-progress" aria-label={`Story progress ${storyProgress}%`}><span style={{ width: `${storyProgress}%` }} /></div>
        <small>{story.objective}</small>
      </section>

      <section
        ref={roomRef}
        onPointerMove={(event) => {
          if (event.pointerType === 'touch') return;
          const rect = event.currentTarget.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
          const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
          event.currentTarget.style.setProperty('--camera-x', (x * 2.8).toFixed(2) + 'deg');
          event.currentTarget.style.setProperty('--camera-y', (y * -2).toFixed(2) + 'deg');
        }}
        onPointerLeave={(event) => {
          event.currentTarget.style.setProperty('--camera-x', '0deg');
          event.currentTarget.style.setProperty('--camera-y', '0deg');
        }}
        className={[
          'room',
          state.discovered.length ? 'awakened' : '',
          echoActive ? 'echo-active' : '',
          `echo-phase-${state.echoPhase}`,
          `echo-behavior-${echoBehavior}`,
          consequences.orbTaken ? 'orb-missing' : '',
          consequences.windowOpened ? 'window-opened' : '',
          consequences.stoneMoved ? 'stone-moved' : '',
          consequences.hasCompleteSet ? 'memory-complete' : '',
          `route-${story.route}`,
          world.newGamePlus ? 'ng-plus' : '',
          impact !== 'none' ? `impact-${impact}` : '',
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
        <div className="game-gesture" aria-hidden="true" />
        {secretHint && <button className="secret-discovery" onClick={() => setSecretHint(null)} type="button"><span>DISCOVERY FOUND</span><strong>{secretHint}</strong><em>TAP TO CONTINUE</em></button>}
        <EnvironmentEvolution orbTaken={consequences.orbTaken} windowOpened={consequences.windowOpened} stoneMoved={consequences.stoneMoved} complete={consequences.hasCompleteSet} route={story.route} echoActive={echoActive} echoResolved={world.echoResolved === true} />
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

        {finalChoice && (
          <div className="ending-choice-card" role="dialog" aria-label="Choose the fate of the memory">
            <span className="choice-kicker">THE FINAL MEMORY</span>
            <strong>WHAT WILL YOU DO WITH IT?</strong>
            <p>The room can finally let you go. The Echo cannot decide for you.</p>
            <div className="choice-actions ending-actions">
              <button onClick={() => chooseEnding('leave')}>LEAVE IT BEHIND</button>
              <button onClick={() => chooseEnding('stay')}>STAY WITH IT</button>
              <button onClick={() => chooseEnding('follow')}>FOLLOW THE ECHO</button>
            </div>
          </div>
        )}

        {ending && (
          <div className="ending-card" role="dialog" aria-label="Ending revealed">
            <span className="ending-kicker">ENDING DISCOVERED · {ending.id.replaceAll('-', ' ').toUpperCase()}</span>
            <strong>{ending.title}</strong>
            <em>{ending.subtitle}</em>
            <p>{ending.narration}</p>
            <div className="ending-footer"><span>{world.endingsSeen?.length ?? 0}/8 ENDINGS</span><button onClick={() => { setEnding(null); setReplayPanel('archive'); }} type="button">VIEW ARCHIVE</button><button onClick={() => { setEnding(null); resetRun(); }} type="button">BEGIN AGAIN</button></div>
          </div>
        )}

        {choiceTarget && !finalChoice && (
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
        <div className="mobile-controls" aria-label="Mobile movement controls">
          <button onClick={() => moveBy(0, -3)} aria-label="Move up">↑</button>
          <div><button onClick={() => moveBy(-3, 0)} aria-label="Move left">←</button><button onClick={() => interact()} aria-label="Interact">✦</button><button onClick={() => moveBy(3, 0)} aria-label="Move right">→</button></div>
          <button onClick={() => moveBy(0, 3)} aria-label="Move down">↓</button>
        </div>

        {echoActive && !echoNearPlayer && (
          <div className="echo-whisper">{encounter.whisper}</div>
        )}

        {echoActive && (
          <div className="echo-state" aria-live="polite">
            {encounter.label} · {state.echoPhase.toUpperCase()}
          </div>
        )}

        {secretsFound.length > 0 && <div className="secret-counter">{secretsFound.length}/4 SECRETS</div>}

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
