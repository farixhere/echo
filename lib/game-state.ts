import type { EchoState } from '../types/game';

export const initialEchoState: EchoState = {
  orbTouched: false,
  doorUnlocked: false,
  memoryCount: 0,
  hasSeenEcho: false,
};

export function parseEchoState(value: string | null): EchoState {
  if (!value) return initialEchoState;
  try {
    const parsed = JSON.parse(value) as Partial<EchoState>;
    return {
      orbTouched: Boolean(parsed.orbTouched),
      doorUnlocked: Boolean(parsed.doorUnlocked),
      memoryCount:
        typeof parsed.memoryCount === 'number' && Number.isFinite(parsed.memoryCount)
          ? Math.max(0, Math.floor(parsed.memoryCount))
          : 0,
      hasSeenEcho: Boolean(parsed.hasSeenEcho),
    };
  } catch {
    return initialEchoState;
  }
}

export function touchMemoryOrb(state: EchoState): EchoState {
  return { ...state, orbTouched: true, memoryCount: state.memoryCount + 1 };
}

export function inspectMemoryDoor(state: EchoState): EchoState {
  return state.orbTouched ? { ...state, doorUnlocked: true } : state;
}

export function enterMemoryDoor(state: EchoState): EchoState {
  return state.doorUnlocked ? { ...state, hasSeenEcho: true } : state;
}
