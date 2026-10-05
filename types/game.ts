export type HotspotId = 'orb' | 'door' | 'window' | 'stone';

export type EchoState = {
  playerX: number;
  playerY: number;
  memoryCount: number;
  discovered: HotspotId[];
  doorAwake: boolean;
  hasSeenEcho: boolean;
};
