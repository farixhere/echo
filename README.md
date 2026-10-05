# ECHO — Project 03

> The world remembers what you do.

ECHO is a small atmospheric browser game built around persistent consequences. The first vertical slice is **The Room That Remembers**.

## Current milestone

- Next.js + TypeScript foundation
- Componentized first playable room
- Memory orb interaction
- Door consequence and echo payoff
- Persistent local save/load
- Safe state parsing and reset
- Responsive mobile-first presentation
- Keyboard focus states and reduced-motion support

## Project structure

- `app/` — Next.js route and global styling
- `components/game/` — interactive game scene components
- `lib/` — game-state transitions and browser persistence
- `types/` — shared game types
- `public/` — future audio, artwork, and other static assets

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## V1 boundaries

No accounts, backend, AI, multiplayer, payments, or database. The goal is a polished vertical slice before adding infrastructure.
