export type EchoChoice = 'orb' | 'window' | 'stone' | null;

export type EchoState = {
  orbTouched: boolean;
  doorUnlocked: boolean;
  memoryCount: number;
  hasSeenEcho: boolean;
  lastChoice?: EchoChoice;
  windowSeen?: boolean;
  stoneMarked?: boolean;
};

export const initialEchoState: EchoState = {
  orbTouched: false,
  doorUnlocked: false,
  memoryCount: 0,
  hasSeenEcho: false,
  lastChoice: null,
  windowSeen: false,
  stoneMarked: false
};