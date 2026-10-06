import type { WorldMemory } from '../types/game';

export type FinalChoice = 'leave' | 'stay' | 'follow';

export type EndingId =
  | 'the-release'
  | 'the-keeper'
  | 'the-witness'
  | 'the-hunt'
  | 'the-breach'
  | 'the-return'
  | 'the-empty-room'
  | 'the-last-echo';

export type EndingState = {
  id: EndingId;
  title: string;
  subtitle: string;
  narration: string;
  consequence: string;
};

function key(world: WorldMemory) {
  return [
    world.orbChoice === 'taken' ? '1' : '0',
    world.windowChoice === 'opened' ? '1' : '0',
    world.stoneChoice === 'moved' ? '1' : '0',
  ].join('');
}

export function getEnding(world: WorldMemory, choice: FinalChoice): EndingState {
  const k = key(world);
  const echoResolved = Boolean(world.echoResolved);
  const id: EndingId =
    choice === 'follow' && world.orbChoice === 'taken' ? 'the-hunt' :
    choice === 'follow' && world.windowChoice === 'opened' && world.stoneChoice === 'moved' ? 'the-breach' :
    choice === 'stay' && k === '000' ? 'the-keeper' :
    choice === 'stay' && echoResolved ? 'the-last-echo' :
    choice === 'follow' && world.windowChoice === 'opened' ? 'the-witness' :
    choice === 'leave' && k === '111' ? 'the-release' :
    choice === 'leave' && echoResolved ? 'the-return' :
    'the-empty-room';

  const endings: Record<EndingId, EndingState> = {
    'the-release': {
      id, title: 'THE RELEASE', subtitle: 'YOU LET THE MEMORY GO',
      narration: 'The light leaves your hand. Rain leaves the room. The hidden mark fades. For the first time, the door opens onto somewhere that has never remembered you.',
      consequence: 'The room keeps the story. You keep your life.',
    },
    'the-keeper': {
      id, title: 'THE KEEPER', subtitle: 'YOU STAYED WITH WHAT WAS LEFT',
      narration: 'You refuse the door. The room settles around you, no longer waiting. Across the floor, another set of footsteps appears and stops beside yours.',
      consequence: 'You are no longer trapped here. You are part of what protects it.',
    },
    'the-witness': {
      id, title: 'THE WITNESS', subtitle: 'YOU FOLLOWED THE OTHER ROOM',
      narration: 'Beyond the window is another version of this room. You step through the rain and see yourself arriving from the other side.',
      consequence: 'The loop does not close. It watches.',
    },
    'the-hunt': {
      id, title: 'THE HUNT', subtitle: 'YOU FOLLOWED WHAT YOU TOOK',
      narration: 'The darkness follows your hand through the doorway. You run, but every corridor leads back to the place where the light first disappeared.',
      consequence: 'You escaped the room. The room did not escape you.',
    },
    'the-breach': {
      id, title: 'THE BREACH', subtitle: 'YOU OPENED WHAT SHOULD STAY CLOSED',
      narration: 'The mark beneath the stone completes itself. The Echo steps through first. Behind it is not another room, but every run you have ever abandoned.',
      consequence: 'The boundary is gone.',
    },
    'the-return': {
      id, title: 'THE RETURN', subtitle: 'YOU LEFT, BUT NOT ALONE',
      narration: 'You cross the threshold. Your footsteps stop. Another pair continues for three more steps before becoming silent.',
      consequence: 'Something came back with you.',
    },
    'the-last-echo': {
      id, title: 'THE LAST ECHO', subtitle: 'YOU CHOSE TO REMAIN',
      narration: 'The Echo finally stands beside you instead of ahead of you. It has your posture, your hesitation, your memory. Then it becomes still.',
      consequence: 'One memory remains alive after everything else is quiet.',
    },
    'the-empty-room': {
      id, title: 'THE EMPTY ROOM', subtitle: 'NOTHING FOLLOWED',
      narration: 'You leave. The door closes behind you. When you turn around, there is no room, no doorway, and no evidence that you were ever there.',
      consequence: 'Some memories disappear because they have finished their work.',
    },
  };

  return endings[id];
}
