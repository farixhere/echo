import type { WorldMemory } from '../types/game';

export type EchoEncounterPhase = 'dormant' | 'glimpse' | 'stalking' | 'confrontation' | 'resolved';
export type EchoBehavior = 'mirror' | 'hunter' | 'witness' | 'keeper' | 'breach';

export type EchoEncounter = {
  phase: EchoEncounterPhase;
  behavior: EchoBehavior;
  label: string;
  whisper: string;
  canApproach: boolean;
  speed: number;
};

export function getEchoBehavior(world: WorldMemory): EchoBehavior {
  if (world.orbChoice === 'taken') return 'hunter';
  if (world.windowChoice === 'opened' && world.stoneChoice === 'moved') return 'breach';
  if (world.windowChoice === 'opened') return 'witness';
  if (world.stoneChoice === 'moved') return 'breach';
  if (world.orbChoice === 'left' && world.windowChoice === 'closed' && world.stoneChoice === 'kept') return 'keeper';
  return 'mirror';
}

export function getEchoEncounter(world: WorldMemory, phase: EchoEncounterPhase): EchoEncounter {
  const behavior = getEchoBehavior(world);
  const copy: Record<EchoBehavior, Omit<EchoEncounter, 'phase' | 'behavior'>> = {
    mirror: {
      label: 'MIRROR ECHO',
      whisper: 'IT REMEMBERS YOUR STEPS',
      canApproach: true,
      speed: 1,
    },
    hunter: {
      label: 'THE HUNGRY ECHO',
      whisper: 'GIVE IT BACK',
      canApproach: true,
      speed: 1.28,
    },
    witness: {
      label: 'THE WATCHING ECHO',
      whisper: 'DON’T TURN AROUND',
      canApproach: false,
      speed: .82,
    },
    keeper: {
      label: 'THE WAITING ECHO',
      whisper: 'IT KEPT YOUR PLACE',
      canApproach: false,
      speed: .62,
    },
    breach: {
      label: 'THE BREACHED ECHO',
      whisper: 'THE OTHER RUN IS OPEN',
      canApproach: true,
      speed: 1.08,
    },
  };
  return { phase, behavior, ...copy[behavior] };
}

export function nextEchoPhase(
  current: EchoEncounterPhase,
  discovered: number,
  pathLength: number,
  hasSeenEcho: boolean,
): EchoEncounterPhase {
  if (hasSeenEcho) return 'resolved';
  if (discovered < 2 || pathLength < 5) return 'dormant';
  if (current === 'dormant') return 'glimpse';
  if (current === 'glimpse' && pathLength >= 9) return 'stalking';
  if (current === 'stalking' && pathLength >= 15) return 'confrontation';
  return current;
}
