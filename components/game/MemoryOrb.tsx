'use client';

type MemoryOrbProps = {
  active: boolean;
  onTouch: () => void;
};

export default function MemoryOrb({ active, onTouch }: MemoryOrbProps) {
  return (
    <button
      className={`orb ${active ? 'active' : ''}`}
      onClick={onTouch}
      aria-label="Touch the memory orb"
      type="button"
    >
      <span className="orb-core" />
      {active && <span className="ring ring-one" aria-hidden="true" />}
      {active && <span className="ring ring-two" aria-hidden="true" />}
    </button>
  );
}
