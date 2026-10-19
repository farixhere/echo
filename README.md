# ECHO — The World Remembers

> An atmospheric browser mystery where your choices leave traces.

ECHO is an interactive narrative game built around exploration, meaningful choices, and persistent consequences. Its first playable experience, **The Room That Remembers**, explores what it means for a place to remember what happened inside it.

<p>
  <a href="https://echo-dupekingsam-7855.vercel.app/"><img src="https://img.shields.io/badge/Play-ECHO-6C63FF?style=for-the-badge" alt="Play ECHO" /></a>
  <a href="https://github.com/farixhere/echo"><img src="https://img.shields.io/badge/Source-GitHub-181717?style=for-the-badge&logo=github" alt="ECHO source on GitHub" /></a>
</p>

## What makes ECHO different?

ECHO is designed around memory: choices are not just dialogue options, they become part of the player's continuing story.

### Current experience

- **Explore a story room** built as a focused, atmospheric playable scene.
- **Make memory choices** that shape later moments and consequences.
- **Interact with the memory orb** and experience the room's response.
- **Save and resume locally** using browser storage.
- **Discover multiple endings** through replay and branching decisions.
- **Review your journey** with an ending archive, run history, and a branch comparison.
- **Replay with New Game+** after reaching an ending.
- **Play on mobile** with responsive layout and reduced-motion support.

The project currently keeps game progress in the player's browser. Accounts, multiplayer, a hosted database, and online save sync are outside the current scope.

## Play

**[Launch the production build](https://echo-dupekingsam-7855.vercel.app/)**

The production URL is the one recorded in this repository's release notes. If it is unavailable, use the source code and run the game locally.

## Run locally

### Requirements

- Node.js and npm
- A modern browser

### Start the development server

```bash
git clone https://github.com/farixhere/echo.git
cd echo
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other available scripts:

```bash
npm run build
npm run start
```

## Built with

- **Next.js**
- **React**
- **TypeScript**
- Browser storage for local save data

## Project structure

| Path | Purpose |
| --- | --- |
| `app/` | Application route and global styling |
| `components/game/` | Game scene and interactive components |
| `lib/` | Game-state transitions and browser persistence |
| `types/` | Shared game types |
| `public/` | Static assets |

## Design principles

- Choices should have visible consequences.
- A replay should reveal something new.
- The game should remain usable on smaller screens.
- Motion should respect the player's reduced-motion preference.
- Local progress should be parsed and reset safely.

## Project status

ECHO is being developed as a polished, browser-playable narrative experience. This repository documents the current vertical slice and its replay systems; it should not be read as a claim that online accounts or cloud saves are available.

---

Created by [Faris](https://github.com/farixhere).