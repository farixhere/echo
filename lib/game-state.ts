import type { EchoState, HotspotId } from '../types/game';

export const initialEchoState: EchoState = {
  playerX: 50,
  playerY: 72,
  memoryCount: 0,
  discovered: [],
  doorAwake: false,
  hasSeenEcho: false,
};

export function parseEchoState(value: string | null): EchoState {
  if (!value) return initialEchoState;
  try {
    const parsed = JSON.parse(value) as Partial<EchoState>;
    const valid: HotspotId[] = ['orb', 'door', 'window', 'stone'];
    return {
      playerX: typeof parsed.playerX === 'number' ? Math.min(92, Math.max(8, parsed.playerX)) : 50,
      playerY: typeof parsed.playerY === 'number' ? Math.min(90, Math.max(12, parsed.playerY)) : 72,
      memoryCount: typeof parsed.memoryCount === 'number' ? Math.max(0, Math.floor(parsed.memoryCount)) : 0,
      discovered: Array.isArray(parsed.discovered) ? parsed.discovered.filter((id): id is HotspotId => valid.includes(id as HotspotId)) : [],
      doorAwake: Boolean(parsed.doorAwake),
      hasSeenEcho: Boolean(parsed.hasSeenEcho),
    };
  } catch { return initialEchoState; }
}

export function discover(state: EchoState, id: HotspotId): EchoState {
  if (state.discovered.includes(id)) return state;
  const next = [...state.discovered, id];
  return { ...state, discovered: next, memoryCount: state.memoryCount + 1, doorAwake: id === 'orb' || state.doorAwake };
}

export function awakenDoor(state: EchoState): EchoState {
  return state.discovered.includes('orb') ? { ...state, doorAwake: true } : state;
}

export function findEcho(state: EchoState): EchoState {
  return state.doorAwake ? { ...state, hasSeenEcho: true } : state;
}
