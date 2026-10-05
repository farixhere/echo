# ECHO — Project 03

> The world remembers what you do.

ECHO is a small atmospheric browser game built around persistent consequences. The first vertical slice is **The Room That Remembers**.

## Current milestone

- Next.js + TypeScript foundation
- Single playable room
- Orb interaction
- Persistent memory state
- Door consequence
- Local save/load
- Reset memory
- Responsive mobile-first presentation
- Reduced-motion support

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Architecture

- `app/` — Next.js routes and global styling
- `components/EchoRoom.tsx` — first playable room and interaction logic
- `lib/game-state.ts` — persistent game-state model

## V1 boundaries

No accounts, backend, AI, multiplayer, payments, or database. The goal is a polished vertical slice before adding infrastructure.
