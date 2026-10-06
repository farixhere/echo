export type HotspotId = 'orb' | 'door' | 'window' | 'stone';
export type MemoryChoice = 'taken' | 'left' | 'opened' | 'closed' | 'moved' | 'kept';

export type WorldMemory = {
  runs: number;
  orbChoice?: 'taken' | 'left';
  windowChoice?: 'opened' | 'closed';
  stoneChoice?: 'moved' | 'kept';
};

export type EchoState = {
  playerX: number;
  playerY: number;
  memoryCount: number;
  discovered: HotspotId[];
  doorAwake: boolean;
  hasSeenEcho: boolean;
  echoPhase: import('../lib/echo-encounter').EchoEncounterPhase;
};

export type ChoiceTarget = Exclude<HotspotId, 'door'> | null;

export type WorldConsequence = {
  memories: number;
  orbTaken: boolean;
  windowOpened: boolean;
  stoneMoved: boolean;
  hasCompleteSet: boolean;
};