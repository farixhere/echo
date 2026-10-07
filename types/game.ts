export type HotspotId = 'orb' | 'door' | 'window' | 'stone';
export type MemoryChoice = 'taken' | 'left' | 'opened' | 'closed' | 'moved' | 'kept';

export type ReplayRecord = {
  id: string;
  run: number;
  endingId: string;
  finalChoice: 'leave' | 'stay' | 'follow';
  orbChoice?: 'taken' | 'left';
  windowChoice?: 'opened' | 'closed';
  stoneChoice?: 'moved' | 'kept';
  memories: number;
  timestamp: number;
};

export type WorldMemory = {
  runs: number;
  runHistory?: ReplayRecord[];
  newGamePlus?: boolean;
  orbChoice?: 'taken' | 'left';
  windowChoice?: 'opened' | 'closed';
  stoneChoice?: 'moved' | 'kept';
  echoResolved?: boolean;
  endingsSeen?: string[];
  secretsFound?: string[];
  secretFlags?: Record<string, boolean>;
};

export type EchoState = {
  playerX: number;
  playerY: number;
  memoryCount: number;
  discovered: HotspotId[];
  doorAwake: boolean;
  hasSeenEcho: boolean;
  echoPhase: import('../lib/echo-encounter').EchoEncounterPhase;
  orbTouched?: boolean;
  doorUnlocked?: boolean;
  windowSeen?: boolean;
  stoneMarked?: boolean;
};

export type ChoiceTarget = Exclude<HotspotId, 'door'> | null;

export type WorldConsequence = {
  memories: number;
  orbTaken: boolean;
  windowOpened: boolean;
  stoneMoved: boolean;
  hasCompleteSet: boolean;
};