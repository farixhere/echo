import type { EchoState } from '../types/game';
import { initialEchoState, parseEchoState } from './game-state';

export const SAVE_KEY = 'echo-v1-state';

export function loadEchoState(): EchoState {
  if (typeof window === 'undefined') return initialEchoState;
  try {
    return parseEchoState(window.localStorage.getItem(SAVE_KEY));
  } catch {
    return initialEchoState;
  }
}

export function saveEchoState(state: EchoState) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {}
}

export function clearEchoState() {
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch {}
}
