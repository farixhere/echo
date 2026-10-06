'use client';

export type AudioScene = {
  intensity: number;
  echoDanger: number;
  memoryComplete: boolean;
};

type AudioEngine = {
  context: AudioContext;
  master: GainNode;
  ambient: GainNode;
  fx: GainNode;
  startedAt: number;
  noise?: AudioBufferSourceNode;
  drone?: OscillatorNode;
  droneGain?: GainNode;
  lfo?: OscillatorNode;
  lfoGain?: GainNode;
};

const KEY = 'echo-audio-enabled';

function getStoredEnabled() {
  if (typeof window === 'undefined') return true;
  const raw = window.localStorage.getItem(KEY);
  return raw === null ? true : raw === 'true';
}

function makeNoiseBuffer(ctx: AudioContext, seconds = 2) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i += 1) {
    const white = Math.random() * 2 - 1;
    last = last * 0.985 + white * 0.015;
    data[i] = last * 2.8;
  }
  return buffer;
}

let engine: AudioEngine | null = null;

export function isAudioEnabled() {
  return getStoredEnabled();
}

export function setAudioEnabled(enabled: boolean) {
  if (typeof window !== 'undefined') window.localStorage.setItem(KEY, String(enabled));
  if (engine) {
    engine.master.gain.setTargetAtTime(enabled ? 0.42 : 0, engine.context.currentTime, 0.08);
  }
}

export async function startAudio(): Promise<boolean> {
  if (typeof window === 'undefined' || !isAudioEnabled()) return false;

  try {
    if (!engine) {
      const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) return false;

      const context = new AudioContextCtor();
      const master = context.createGain();
      const ambient = context.createGain();
      const fx = context.createGain();
      master.gain.value = 0.42;
      ambient.gain.value = 0.5;
      fx.gain.value = 0.72;
      ambient.connect(master);
      fx.connect(master);
      master.connect(context.destination);

      const drone = context.createOscillator();
      const droneGain = context.createGain();
      drone.type = 'sine';
      drone.frequency.value = 48;
      droneGain.gain.value = 0.018;
      drone.connect(droneGain).connect(ambient);

      const lfo = context.createOscillator();
      const lfoGain = context.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 0.045;
      lfoGain.gain.value = 0.012;
      lfo.connect(lfoGain).connect(droneGain.gain);

      const noise = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const noiseGain = context.createGain();
      noise.buffer = makeNoiseBuffer(context);
      noise.loop = true;
      filter.type = 'lowpass';
      filter.frequency.value = 900;
      noiseGain.gain.value = 0.035;
      noise.connect(filter).connect(noiseGain).connect(ambient);

      drone.start();
      lfo.start();
      noise.start();

      engine = { context, master, ambient, fx, startedAt: performance.now(), noise, drone, droneGain, lfo, lfoGain };
    }

    if (engine.context.state === 'suspended') await engine.context.resume();
    engine.master.gain.setTargetAtTime(0.42, engine.context.currentTime, 0.08);
    return true;
  } catch {
    return false;
  }
}

function tone(frequency: number, duration: number, volume: number, type: OscillatorType = 'sine', slide?: number) {
  if (!engine) return;
  const { context, fx } = engine;
  const osc = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slide), now + duration);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain).connect(fx);
  osc.start(now);
  osc.stop(now + duration + 0.03);
}

export function soundStep(distance = 1) {
  tone(82 + Math.random() * 22, 0.09, Math.min(0.045, 0.018 + distance * 0.002), 'triangle', 58);
}

export function soundInspect(kind: 'orb' | 'window' | 'stone' | 'door') {
  const base = kind === 'orb' ? 330 : kind === 'window' ? 220 : kind === 'stone' ? 112 : 68;
  tone(base, 0.18, 0.035, 'sine', base * 0.72);
  tone(base * 1.5, 0.26, 0.018, 'sine', base * 1.2);
}

export function soundChoice(kind: 'orb' | 'window' | 'stone', positive: boolean) {
  const base = kind === 'orb' ? 440 : kind === 'window' ? 286 : 176;
  tone(base, 0.22, 0.04, 'triangle', positive ? base * 1.6 : base * 0.72);
  if (positive) tone(base * 1.5, 0.36, 0.025, 'sine', base * 1.02);
}

export function soundDoor(awake: boolean) {
  tone(awake ? 58 : 42, awake ? 0.8 : 0.34, awake ? 0.06 : 0.035, 'sawtooth', awake ? 130 : 30);
  if (awake) window.setTimeout(() => tone(260, 0.42, 0.028, 'sine', 190), 180);
}

export function soundEcho(phase: 'glimpse' | 'stalking' | 'confrontation' | 'resolved') {
  if (phase === 'resolved') {
    tone(260, 0.55, 0.04, 'sine', 520);
    tone(130, 0.7, 0.025, 'sine', 65);
    return;
  }
  const base = phase === 'glimpse' ? 92 : phase === 'stalking' ? 68 : 52;
  tone(base, phase === 'confrontation' ? 0.8 : 0.45, phase === 'confrontation' ? 0.065 : 0.035, 'sine', base * 0.55);
  if (phase === 'confrontation') tone(31, 0.9, 0.04, 'sawtooth', 48);
}

export function soundEnding(index: number) {
  const roots = [174, 196, 146, 116, 82, 220, 262, 92];
  const root = roots[index % roots.length];
  tone(root, 1.1, 0.055, 'sine', root * 0.62);
  tone(root * 1.5, 1.45, 0.028, 'sine', root * 0.9);
}

export function updateAudioScene(scene: AudioScene) {
  if (!engine) return;
  const now = engine.context.currentTime;
  const intensity = Math.max(0, Math.min(1, scene.intensity));
  const danger = Math.max(0, Math.min(1, scene.echoDanger));
  engine.ambient.gain.setTargetAtTime(0.42 + intensity * 0.2 + danger * 0.14, now, 0.35);
  engine.drone?.frequency.setTargetAtTime(44 + intensity * 7 + danger * 9, now, 0.5);
  engine.droneGain?.gain.setTargetAtTime(0.014 + intensity * 0.012 + danger * 0.014, now, 0.5);
}

export function stopAudio() {
  if (!engine) return;
  try { void engine.context.suspend(); } catch {}
}
