'use client';

type MysteryDoorProps = {
  unlocked: boolean;
  onInspect: () => void;
  onEnter: () => void;
};

export default function MysteryDoor({ unlocked, onInspect, onEnter }: MysteryDoorProps) {
  return (
    <button
      className={`door ${unlocked ? 'unlocked' : ''}`}
      onClick={unlocked ? onEnter : onInspect}
      aria-label={unlocked ? 'Enter the awakened door' : 'Inspect the mysterious door'}
      type="button"
    >
      <span>{unlocked ? 'ENTER' : 'DOOR'}</span>
    </button>
  );
}
