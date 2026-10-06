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


## Stage 10 — Replay / Ending Memory

The replay layer is now complete. ECHO remembers not only what happened inside a run, but which endings and choices shaped previous runs.

- 8-ending archive with locked/unlocked states and discovery clues
- Persistent run history / branch map
- “What Changed” comparison panel
- New Game+ state after the first ending
- Ending collection survives replay
- Run records preserve the three memory choices and final decision
- Replay history is stored locally and capped to the most recent 24 completed runs
- Mobile-friendly archive UI and reduced-motion support

No backend is required; replay memory remains local to the player's browser.


## Stage 14 — Final Release Polish

ECHO is release-ready on the production deployment.

- Production metadata, canonical URL and OpenGraph/Twitter description
- Browser/app icon and installable web manifest
- Robots policy for the public game route
- Dedicated 404 recovery screen
- Runtime error boundary with safe retry/reload actions
- Mobile viewport configuration and dark theme hints
- No runtime errors observed in the latest 7-day production scan

**Production:** https://echo-dupekingsam-7855.vercel.app
