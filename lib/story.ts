import type { WorldMemory } from '../types/game';

export type StoryStage =
  | 'awakening'
  | 'first-memory'
  | 'the-pattern'
  | 'the-revelation';

export type StoryRoute =
  | 'unwritten'
  | 'keeper'
  | 'witness'
  | 'thief'
  | 'breach';

export type StoryState = {
  stage: StoryStage;
  route: StoryRoute;
  branchKey: string;
  chapter: string;
  title: string;
  objective: string;
  narration: string;
  clue: string;
};

function branchKey(world: WorldMemory) {
  return [
    world.orbChoice === 'taken' ? '1' : '0',
    world.windowChoice === 'opened' ? '1' : '0',
    world.stoneChoice === 'moved' ? '1' : '0',
  ].join('');
}

function routeFor(world: WorldMemory): StoryRoute {
  if (world.orbChoice === 'taken') return 'thief';
  if (world.windowChoice === 'opened' && world.stoneChoice === 'moved') return 'breach';
  if (world.windowChoice === 'opened') return 'witness';
  if (world.stoneChoice === 'moved') return 'breach';
  if (
    world.orbChoice === 'left' &&
    world.windowChoice === 'closed' &&
    world.stoneChoice === 'kept'
  ) return 'keeper';
  return 'witness';
}

export function getStoryState(world: WorldMemory): StoryState {
  const key = branchKey(world);
  const choices = Number(Boolean(world.orbChoice))
    + Number(Boolean(world.windowChoice))
    + Number(Boolean(world.stoneChoice));

  if (choices === 0) {
    return {
      stage: 'awakening',
      route: 'unwritten',
      branchKey: key,
      chapter: 'CHAPTER I · THE AWAKENING',
      title: 'THE ROOM BEFORE MEMORY',
      objective: 'Find the first thing the room remembers.',
      narration:
        'You woke inside a place that feels unfinished. Nothing asks you to leave. Something asks you to remember.',
      clue: 'The room is waiting for a choice.',
    };
  }

  if (choices === 1) {
    const route = routeFor(world);
    return {
      stage: 'first-memory',
      route,
      branchKey: key,
      chapter: 'CHAPTER I · THE FIRST MEMORY',
      title:
        route === 'thief'
          ? 'THE HAND THAT TOOK'
          : route === 'witness'
            ? 'THE WINDOW THAT SAW'
            : route === 'breach'
              ? 'THE THING BENEATH'
              : 'THE ONE WHO LEFT',
      objective: 'Explore the room and find what changed because of your choice.',
      narration:
        route === 'thief'
          ? 'The room became darker when you took the light. It did not become empty. The darkness moved.'
          : route === 'witness'
            ? 'Opening the window did not reveal the outside. It revealed that the outside was watching.'
            : route === 'breach'
              ? 'Moving the stone exposed a mark that should have been hidden. You were not the first person to find it.'
              : 'Leaving everything where it was made the room strangely calm. Calm is not the same as safe.',
      clue: 'Your first choice has changed the meaning of another object.',
    };
  }

  if (choices === 2) {
    const route = routeFor(world);
    const patternCopy: Record<string, { title: string; narration: string; clue: string }> = {
      '10': {
        title: 'THE LIGHT LEFT A SHADOW',
        narration:
          'You took the light and opened the window. Now the rain reflects a second room, and the shadow in it is carrying what you stole.',
        clue: 'The door is beginning to connect the two memories.',
      },
      '01': {
        title: 'THE MARK THAT BREATHES',
        narration:
          'The window is open and the stone has moved. Cold rain reaches the hidden mark. For a moment, it pulses like a heartbeat.',
        clue: 'Something beneath the room is answering.',
      },
      '11': {
        title: 'THE PATTERN IS OPEN',
        narration:
          'Rain, stone, and your own absence have formed a pattern. The door is no longer waiting for a memory. It is waiting for a decision.',
        clue: 'The hidden mark and the window point to the same moment.',
      },
      '00': {
        title: 'THE ROOM IS WATCHING',
        narration:
          'You left the light and kept the window closed. The stone remains where it was, but the room has started moving around your restraint.',
        clue: 'Two quiet choices can still create a loud memory.',
      },
    };

    const entry = patternCopy[key] ?? patternCopy['00'];

    return {
      stage: 'the-pattern',
      route,
      branchKey: key,
      chapter: 'CHAPTER II · THE PATTERN',
      title: entry.title,
      objective: 'Return to the door. It is beginning to understand the pattern.',
      narration: entry.narration,
      clue: entry.clue,
    };
  }

  const route = routeFor(world);
  const revelationCopy: Record<string, { title: string; narration: string; clue: string }> = {
    '000': {
      title: 'THE MEMORY THAT WASN’T TOUCHED',
      narration:
        'You changed almost nothing. That is why the room can finally show you what happened before you arrived: someone stood here, waiting for you to make a choice.',
      clue: 'The door is no longer an exit. It is the memory itself.',
    },
    '001': {
      title: 'THE FINGERPRINT UNDER STONE',
      narration:
        'You moved the stone but left the light and window alone. Beneath it is a fingerprint that matches yours—and another beside it.',
      clue: 'Someone else made the same choice before you.',
    },
    '010': {
      title: 'THE ROOM OUTSIDE THE ROOM',
      narration:
        'You opened the window and left the stone untouched. Beyond the rain is a room identical to this one, except its door is already open.',
      clue: 'The open window is showing another run.',
    },
    '011': {
      title: 'THE BREACH REMEMBERS',
      narration:
        'You opened the window and moved the stone. The hidden mark completes itself in the rain. The footsteps belong to someone who made these choices before you.',
      clue: 'The room is replaying a previous visitor.',
    },
    '100': {
      title: 'THE MISSING LIGHT',
      narration:
        'You took the light and changed nothing else. Without it, the room reveals a second figure standing where your reflection should be.',
      clue: 'The thing you took was never only a light.',
    },
    '101': {
      title: 'THE DARKNESS UNDER STONE',
      narration:
        'You took the light and moved the stone. The darkness gathers around the hidden fingerprint until it forms a hand reaching toward you.',
      clue: 'The room remembers the shape of your hand.',
    },
    '110': {
      title: 'THE REFLECTION THAT FOLLOWED',
      narration:
        'You took the light and opened the window. The glass now reflects a version of you that stayed behind. It turns before you do.',
      clue: 'One of the echoes is no longer following your path.',
    },
    '111': {
      title: 'THE MOMENT THE ROOM REMEMBERED',
      narration:
        'You took the light, opened the window, and moved the stone. The three memories align and the room reconstructs a missing moment: two people entered, but only one left.',
      clue: 'The door is no longer an exit. It is the memory itself.',
    },
  };

  const entry = revelationCopy[key] ?? revelationCopy['000'];

  return {
    stage: 'the-revelation',
    route,
    branchKey: key,
    chapter: 'CHAPTER III · THE REVELATION',
    title: entry.title,
    objective: 'Return to the door and face what the room has reconstructed.',
    narration: entry.narration,
    clue: entry.clue,
  };
}

export function getStoryProgress(world: WorldMemory): number {
  const choices = Number(Boolean(world.orbChoice)) + Number(Boolean(world.windowChoice)) + Number(Boolean(world.stoneChoice));
  return choices === 0 ? 0 : choices === 1 ? 33 : choices === 2 ? 66 : 100;
}
