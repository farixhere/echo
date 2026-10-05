import type { WorldMemory } from '../types/game';

export type StoryStage = 'awakening' | 'first-memory' | 'the-pattern' | 'the-revelation';
export type StoryRoute = 'unwritten' | 'keeper' | 'witness' | 'thief' | 'breach';

export type StoryState = {
  stage: StoryStage;
  route: StoryRoute;
  title: string;
  objective: string;
  narration: string;
  clue: string;
};

export function getStoryState(world: WorldMemory): StoryState {
  const choices = Number(Boolean(world.orbChoice)) + Number(Boolean(world.windowChoice)) + Number(Boolean(world.stoneChoice));

  if (choices === 0) {
    return {
      stage: 'awakening',
      route: 'unwritten',
      title: 'THE ROOM BEFORE MEMORY',
      objective: 'Find the first thing the room remembers.',
      narration: 'You woke inside a place that feels unfinished. Nothing asks you to leave. Something asks you to remember.',
      clue: 'The room is waiting for a choice.',
    };
  }

  if (choices === 1) {
    const route =
      world.orbChoice === 'taken' ? 'thief'
      : world.windowChoice === 'opened' ? 'witness'
      : world.stoneChoice === 'moved' ? 'breach'
      : 'keeper';

    return {
      stage: 'first-memory',
      route,
      title: route === 'thief' ? 'THE HAND THAT TOOK' : route === 'witness' ? 'THE WINDOW THAT SAW' : route === 'breach' ? 'THE THING BENEATH' : 'THE ONE WHO LEFT',
      objective: 'Explore the room and find what changed because of your choice.',
      narration:
        route === 'thief'
          ? 'The room became darker when you took the light. It did not become empty.'
          : route === 'witness'
            ? 'Opening the window did not reveal the outside. It revealed that the outside was watching.'
            : route === 'breach'
              ? 'Moving the stone exposed a mark that should have been hidden. You were not the first person to find it.'
              : 'Leaving everything where it was made the room strangely calm. Calm is not the same as safe.',
      clue: 'Your first choice has changed the meaning of another object.',
    };
  }

  const breach = world.windowChoice === 'opened' && world.stoneChoice === 'moved';
  const thief = world.orbChoice === 'taken';
  const route: StoryRoute = breach ? 'breach' : thief ? 'thief' : 'witness';

  if (choices === 2) {
    return {
      stage: 'the-pattern',
      route,
      title: breach ? 'THE PATTERN IS OPEN' : thief ? 'THE ROOM KNOWS YOUR HAND' : 'THE ROOM IS WATCHING',
      objective: 'Return to the door. It is beginning to understand the pattern.',
      narration: breach
        ? 'Rain, stone, and your own absence have formed a pattern. The door is no longer waiting for a memory. It is waiting for a decision.'
        : thief
          ? 'Every object now points back to the moment you took the light. The room has started arranging itself around what you did.'
          : 'Two memories are enough for the room to stop pretending these things are separate. They are parts of the same event.',
      clue: 'The door is the only place where all three memories can meet.',
    };
  }

  return {
    stage: 'the-revelation',
    route: breach ? 'breach' : thief ? 'thief' : world.orbChoice === 'left' && world.windowChoice === 'closed' && world.stoneChoice === 'kept' ? 'keeper' : 'witness',
    title: 'THE MEMORY UNDERNEATH',
    objective: 'Return to the door and face what the room has reconstructed.',
    narration:
      breach
        ? 'The room has reconstructed the moment: someone opened the window, moved the stone, and found the mark. The memory is yours—but the footsteps are not.'
        : thief
          ? 'The room has reconstructed the moment you took the light. The missing glow reveals a second figure standing where you should have been.'
          : world.orbChoice === 'left' && world.windowChoice === 'closed' && world.stoneChoice === 'kept'
            ? 'You changed almost nothing. That may be why the room can finally show you what happened before you arrived.'
            : 'The three memories align. For one second, the room shows you a version of yourself that made different choices.',
    clue: 'The door is no longer an exit. It is the memory itself.',
  };
}