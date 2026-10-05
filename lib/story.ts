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
  title: string;
  objective: string;
  narration: string;
  clue: string;
  chapter: string;
  routeLabel: string;
};

function routeFor(world: WorldMemory): StoryRoute {
  if (world.windowChoice === 'opened' && world.stoneChoice === 'moved') return 'breach';
  if (world.orbChoice === 'taken') return 'thief';
  if (world.windowChoice === 'opened') return 'witness';
  if (world.orbChoice === 'left' && world.windowChoice === 'closed' && world.stoneChoice === 'kept') return 'keeper';
  if (world.stoneChoice === 'moved') return 'breach';
  return 'keeper';
}

export function getStoryState(world: WorldMemory): StoryState {
  const choices =
    Number(Boolean(world.orbChoice)) +
    Number(Boolean(world.windowChoice)) +
    Number(Boolean(world.stoneChoice));

  const route = routeFor(world);

  if (choices === 0) {
    return {
      stage: 'awakening',
      route: 'unwritten',
      chapter: 'CHAPTER I · ARRIVAL',
      routeLabel: 'PATH UNWRITTEN',
      title: 'THE ROOM BEFORE MEMORY',
      objective: 'Find the first thing the room remembers.',
      narration:
        'You woke inside a place that feels unfinished. Nothing asks you to leave. Something asks you to remember.',
      clue: 'The room is waiting for a choice.',
    };
  }

  if (choices === 1) {
    const firstRoute =
      world.orbChoice === 'taken'
        ? 'thief'
        : world.windowChoice === 'opened'
          ? 'witness'
          : world.stoneChoice === 'moved'
            ? 'breach'
            : 'keeper';

    return {
      stage: 'first-memory',
      route: firstRoute,
      chapter: 'CHAPTER I · THE FIRST MEMORY',
      routeLabel: firstRoute === 'thief'
        ? 'THE TAKING'
        : firstRoute === 'witness'
          ? 'THE WATCHER'
          : firstRoute === 'breach'
            ? 'THE BREACH'
            : 'THE KEEPER',
      title:
        firstRoute === 'thief'
          ? 'THE HAND THAT TOOK'
          : firstRoute === 'witness'
            ? 'THE WINDOW THAT SAW'
            : firstRoute === 'breach'
              ? 'THE THING BENEATH'
              : 'THE ONE WHO LEFT',
      objective: 'Explore the room and find what changed because of your choice.',
      narration:
        firstRoute === 'thief'
          ? 'The room became darker when you took the light. It did not become empty.'
          : firstRoute === 'witness'
            ? 'Opening the window did not reveal the outside. It revealed that the outside was watching.'
            : firstRoute === 'breach'
              ? 'Moving the stone exposed a mark that should have been hidden. You were not the first person to find it.'
              : 'Leaving everything where it was made the room strangely calm. Calm is not the same as safe.',
      clue: 'Your first choice has changed the meaning of another object.',
    };
  }

  const breach = world.windowChoice === 'opened' && world.stoneChoice === 'moved';
  const thief = world.orbChoice === 'taken';

  if (choices === 2) {
    return {
      stage: 'the-pattern',
      route,
      chapter: 'CHAPTER II · THE PATTERN',
      routeLabel: breach ? 'THE BREACH' : thief ? 'THE TAKING' : 'THE WATCHER',
      title: breach
        ? 'THE PATTERN IS OPEN'
        : thief
          ? 'THE ROOM KNOWS YOUR HAND'
          : 'THE ROOM IS WATCHING',
      objective: 'Return to the door. It is beginning to understand the pattern.',
      narration: breach
        ? 'Rain, stone, and your own absence have formed a pattern. The door is no longer waiting for a memory. It is waiting for a decision.'
        : thief
          ? 'Every object now points back to the moment you took the light. The room has started arranging itself around what you did.'
          : 'Two memories are enough for the room to stop pretending these things are separate. They are parts of the same event.',
      clue: 'The door is the only place where all three memories can meet.',
    };
  }

  const keeper =
    world.orbChoice === 'left' &&
    world.windowChoice === 'closed' &&
    world.stoneChoice === 'kept';

  return {
    stage: 'the-revelation',
    route: keeper ? 'keeper' : route,
    chapter: 'CHAPTER II · THE RECONSTRUCTION',
    routeLabel: keeper
      ? 'THE KEEPER'
      : route === 'breach'
        ? 'THE BREACH'
        : route === 'thief'
          ? 'THE TAKING'
          : 'THE WATCHER',
    title: keeper ? 'THE MEMORY THAT STAYED' : 'THE MEMORY UNDERNEATH',
    objective: 'Return to the door and face what the room has reconstructed.',
    narration: breach
      ? 'The room has reconstructed the moment: someone opened the window, moved the stone, and found the mark. The memory is yours—but the footsteps are not.'
      : thief
        ? 'The room has reconstructed the moment you took the light. The missing glow reveals a second figure standing where you should have been.'
        : keeper
          ? 'You changed almost nothing. That may be why the room can finally show you what happened before you arrived.'
          : 'The three memories align. For one second, the room shows you a version of yourself that made different choices.',
    clue: keeper
      ? 'The door is no longer an exit. It is the room remembering without changing anything.'
      : 'The door is no longer an exit. It is the memory itself.',
  };
}

export function getStoryProgress(world: WorldMemory): number {
  const choices =
    Number(Boolean(world.orbChoice)) +
    Number(Boolean(world.windowChoice)) +
    Number(Boolean(world.stoneChoice));

  return choices === 0 ? 0 : choices === 1 ? 33 : choices === 2 ? 66 : 100;
}