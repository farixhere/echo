import type { EchoState, HotspotId, WorldMemory, WorldConsequence } from '../types/game';
import type { EchoEncounterPhase } from './echo-encounter';

export const initialEchoState: EchoState = {
  playerX: 50,
  playerY: 72,
  memoryCount: 0,
  discovered: [],
  doorAwake: false,
  hasSeenEcho: false,
  echoPhase: 'dormant',
};

export const initialWorldMemory: WorldMemory = {
  runs: 0,
  runHistory: [],
  newGamePlus: false,
  endingsSeen: [],
  secretsFound: [],
  secretFlags: {},
};

export function parseEchoState(raw: string | null): EchoState {
  if (!raw) return initialEchoState;
  try {
    const value = JSON.parse(raw) as Partial<EchoState>;
    const phases: EchoEncounterPhase[] = ['dormant','glimpse','stalking','confrontation','resolved'];
    return {
      ...initialEchoState,
      ...value,
      playerX: typeof value.playerX === 'number' ? value.playerX : 50,
      playerY: typeof value.playerY === 'number' ? value.playerY : 72,
      memoryCount: typeof value.memoryCount === 'number' ? value.memoryCount : 0,
      discovered: Array.isArray(value.discovered) ? value.discovered.filter((x): x is HotspotId => ['orb','door','window','stone'].includes(x)) : [],
      echoPhase: phases.includes(value.echoPhase as EchoEncounterPhase) ? value.echoPhase as EchoEncounterPhase : 'dormant',
    };
  } catch { return initialEchoState; }
}

export function parseWorldMemory(raw: string | null): WorldMemory {
  if (!raw) return initialWorldMemory;
  try {
    const value = JSON.parse(raw) as Partial<WorldMemory>;
    return {
      ...initialWorldMemory,
      ...value,
      runs: typeof value.runs === 'number' ? value.runs : 0,
      runHistory: Array.isArray(value.runHistory) ? value.runHistory : [],
      endingsSeen: Array.isArray(value.endingsSeen) ? value.endingsSeen : [],
      secretsFound: Array.isArray(value.secretsFound) ? value.secretsFound : [],
      secretFlags: value.secretFlags && typeof value.secretFlags === 'object' ? value.secretFlags : {},
    };
  } catch { return initialWorldMemory; }
}

export function discover(state: EchoState, hotspot: HotspotId): EchoState {
  if (state.discovered.includes(hotspot)) return state;
  return {
    ...state,
    discovered: [...state.discovered, hotspot],
    memoryCount: state.memoryCount + 1,
  };
}

export function awakenDoor(state: EchoState): EchoState {
  return { ...state, doorAwake: true };
}

export function findEcho(state: EchoState): EchoState {
  return { ...state, hasSeenEcho: true, echoPhase: 'resolved' };
}

export function getWorldConsequences(world: WorldMemory): WorldConsequence {
  const orbTaken = world.orbChoice === 'taken';
  const windowOpened = world.windowChoice === 'opened';
  const stoneMoved = world.stoneChoice === 'moved';
  const memories = [world.orbChoice, world.windowChoice, world.stoneChoice].filter(Boolean).length;
  return {
    memories,
    orbTaken,
    windowOpened,
    stoneMoved,
    hasCompleteSet: memories >= 3,
  };
}