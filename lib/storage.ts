import type { EchoState, WorldMemory } from '../types/game';
import { initialEchoState, initialWorldMemory, parseEchoState, parseWorldMemory } from './game-state';

export const SAVE_KEY = 'echo-v1-state';
export const WORLD_KEY = 'echo-v2-world';

export function loadEchoState(): EchoState {
  if (typeof window === 'undefined') return initialEchoState;
  try { return parseEchoState(window.localStorage.getItem(SAVE_KEY)); } catch { return initialEchoState; }
}

export function saveEchoState(state: EchoState) {
  try { window.localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch {}
}

export function loadWorldMemory(): WorldMemory {
  if (typeof window === 'undefined') return initialWorldMemory;
  try { return parseWorldMemory(window.localStorage.getItem(WORLD_KEY)); } catch { return initialWorldMemory; }
}

export function saveWorldMemory(memory: WorldMemory) {
  try { window.localStorage.setItem(WORLD_KEY, JSON.stringify(memory)); } catch {}
}

export function clearEchoState() {
  try { window.localStorage.removeItem(SAVE_KEY); } catch {}
}

export function clearAllMemory() {
  try {
    window.localStorage.removeItem(SAVE_KEY);
    window.localStorage.removeItem(WORLD_KEY);
  } catch {}
}
