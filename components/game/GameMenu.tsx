'use client';

import { useEffect, useState } from 'react';
import { isAudioEnabled, setAudioEnabled, startAudio } from '../../lib/audio';

type Panel = 'menu' | 'settings' | 'controls' | 'credits';

type Props = {
  open: boolean;
  hasProgress: boolean;
  newGamePlus: boolean;
  endingCount: number;
  memories: number;
  onContinue: () => void;
  onNewGame: () => void;
  onOpenArchive: () => void;
};

const MOTION_KEY = 'echo-reduced-motion';

export default function GameMenu({
  open,
  hasProgress,
  newGamePlus,
  endingCount,
  memories,
  onContinue,
  onNewGame,
  onOpenArchive,
}: Props) {
  const [panel, setPanel] = useState<Panel>('menu');
  const [audio, setAudio] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setAudio(isAudioEnabled());
    const saved = window.localStorage.getItem(MOTION_KEY);
    const value = saved === null ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : saved === 'true';
    setReducedMotion(value);
    document.documentElement.classList.toggle('echo-reduced-motion', value);
  }, []);

  useEffect(() => {
    if (!open) setPanel('menu');
  }, [open]);

  if (!open) return null;

  function toggleAudio() {
    const next = !audio;
    setAudio(next);
    setAudioEnabled(next);
    window.dispatchEvent(new CustomEvent('echo:audio', { detail: next }));
    if (next) void startAudio();
  }

  function toggleMotion() {
    const next = !reducedMotion;
    setReducedMotion(next);
    window.localStorage.setItem(MOTION_KEY, String(next));
    document.documentElement.classList.toggle('echo-reduced-motion', next);
  }

  async function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch {}
  }

  const title = panel === 'menu' ? 'THE ROOM REMEMBERS' : panel === 'settings' ? 'SETTINGS' : panel === 'controls' ? 'CONTROLS' : 'CREDITS';

  return (
    <div className="game-menu" role="dialog" aria-modal="true" aria-label="ECHO main menu">
      <div className="game-menu-noise" aria-hidden="true" />
      <div className="game-menu-inner">
        <header className="menu-brand">
          <div>
            <span className="menu-eyebrow">A MEMORY GAME · STAGE 14</span>
            <h2>ECHO</h2>
          </div>
          <span className="menu-status"><i /> {newGamePlus ? 'MEMORY PERSISTS' : 'ROOM DORMANT'}</span>
        </header>

        {panel === 'menu' ? (
          <section className="menu-home">
            <div className="menu-hero">
              <span className="menu-index">01</span>
              <h3>{hasProgress ? 'You have been here before.' : 'You wake in a room.'}</h3>
              <p>
                {hasProgress
                  ? 'The room kept the choices you made. Continue where the memory is waiting, or begin another run.'
                  : 'Nothing tells you what to do. The room will remember what you choose.'}
              </p>
            </div>

            <nav className="menu-actions" aria-label="Main menu">
              <button className="menu-primary" type="button" onClick={hasProgress ? onContinue : onNewGame}>
                <span>{hasProgress ? 'CONTINUE' : 'NEW GAME'}</span><b>↵</b>
              </button>
              <button type="button" onClick={onNewGame}><span>{hasProgress ? 'NEW RUN' : 'BEGIN'}</span><b>01</b></button>
              <button type="button" onClick={onOpenArchive}><span>MEMORY ARCHIVE</span><b>{endingCount}/8</b></button>
              <button type="button" onClick={() => setPanel('settings')}><span>SETTINGS</span><b>⚙</b></button>
              <button type="button" onClick={() => setPanel('controls')}><span>CONTROLS</span><b>?</b></button>
              <button type="button" onClick={() => setPanel('credits')}><span>CREDITS</span><b>—</b></button>
            </nav>

            <div className="menu-stats">
              <div><span>MEMORIES</span><strong>{memories}/3</strong></div>
              <div><span>ENDINGS</span><strong>{endingCount}/8</strong></div>
              <div><span>MODE</span><strong>{newGamePlus ? 'NG+' : 'FIRST RUN'}</strong></div>
            </div>
          </section>
        ) : (
          <section className="menu-subpanel">
            <div className="menu-subhead"><span className="menu-index">0{panel === 'settings' ? '2' : panel === 'controls' ? '3' : '4'}</span><h3>{title}</h3></div>

            {panel === 'settings' && (
              <div className="settings-list">
                <button type="button" onClick={toggleAudio}>
                  <span><b>SOUND</b><small>Procedural ambience, footsteps and memory tones.</small></span>
                  <strong className={audio ? 'on' : ''}>{audio ? 'ON' : 'OFF'}</strong>
                </button>
                <button type="button" onClick={toggleMotion}>
                  <span><b>REDUCED MOTION</b><small>Limit camera movement, pulses and transitions.</small></span>
                  <strong className={reducedMotion ? 'on' : ''}>{reducedMotion ? 'ON' : 'OFF'}</strong>
                </button>
                <button type="button" onClick={toggleFullscreen}>
                  <span><b>FULLSCREEN</b><small>Use the full screen for a more focused game view.</small></span>
                  <strong>ENTER</strong>
                </button>
                <div className="settings-note">Your choices, endings and replay history are stored locally on this device.</div>
              </div>
            )}

            {panel === 'controls' && (
              <div className="controls-grid">
                <div><kbd>W A S D</kbd><span>MOVE</span></div>
                <div><kbd>↑ ↓ ← →</kbd><span>MOVE</span></div>
                <div><kbd>SPACE</kbd><span>EXAMINE / ENTER</span></div>
                <div><kbd>CLICK</kbd><span>MOVE TO A LOCATION</span></div>
                <div><kbd>✦</kbd><span>MOBILE INTERACT</span></div>
                <p>Get close to a memory hotspot, then examine it. Choices cannot be undone during a run.</p>
              </div>
            )}

            {panel === 'credits' && (
              <div className="credits-copy">
                <span>ECHO</span>
                <h4>The room remembers what you do.</h4>
                <p>Designed as an atmospheric exploration game about memory, consequence and the strange feeling that a place can know you.</p>
                <div><b>Built with</b><span>Next.js · React · TypeScript · Web Audio</span></div>
                <div><b>Project</b><span>ECHO · Stage 14 — Final Release</span></div>
                <small>Made with care. Best experienced with headphones.</small>
              </div>
            )}

            <button className="menu-back" type="button" onClick={() => setPanel('menu')}>← BACK TO MENU</button>
          </section>
        )}

        <footer className="menu-footer">
          <span>ECHO · THE ROOM THAT REMEMBERS</span>
          <span>LOCAL MEMORY · {new Date().getFullYear()}</span>
        </footer>
      </div>
    </div>
  );
}
