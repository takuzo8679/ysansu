export type SoundType = 'correct' | 'incorrect' | 'countdown' | 'start' | 'excellent' | 'pass' | 'fail';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', gain = 0.3) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const vol = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  vol.gain.value = gain;
  vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(vol);
  vol.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playSequence(notes: { freq: number; dur: number; delay: number; type?: OscillatorType }[]) {
  const ctx = getAudioContext();
  if (!ctx) return;

  for (const note of notes) {
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.type = note.type ?? 'sine';
    osc.frequency.value = note.freq;
    vol.gain.value = 0.25;
    vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.delay + note.dur);
    osc.connect(vol);
    vol.connect(ctx.destination);
    osc.start(ctx.currentTime + note.delay);
    osc.stop(ctx.currentTime + note.delay + note.dur);
  }
}

const SOUND_PLAYERS: Record<SoundType, () => void> = {
  correct: () => playTone(880, 0.15, 'sine', 0.3),

  incorrect: () => playTone(220, 0.25, 'square', 0.2),

  countdown: () => playTone(1000, 0.08, 'sine', 0.2),

  start: () => {
    playSequence([
      { freq: 523, dur: 0.1, delay: 0 },
      { freq: 659, dur: 0.1, delay: 0.1 },
      { freq: 784, dur: 0.15, delay: 0.2 },
    ]);
  },

  excellent: () => {
    playSequence([
      { freq: 523, dur: 0.12, delay: 0 },
      { freq: 659, dur: 0.12, delay: 0.12 },
      { freq: 784, dur: 0.12, delay: 0.24 },
      { freq: 1047, dur: 0.3, delay: 0.36 },
    ]);
  },

  pass: () => {
    playSequence([
      { freq: 523, dur: 0.15, delay: 0 },
      { freq: 784, dur: 0.25, delay: 0.15 },
    ]);
  },

  fail: () => {
    playSequence([
      { freq: 392, dur: 0.15, delay: 0, type: 'triangle' },
      { freq: 330, dur: 0.15, delay: 0.15, type: 'triangle' },
      { freq: 262, dur: 0.3, delay: 0.3, type: 'triangle' },
    ]);
  },
};

class SoundManager {
  private enabled: boolean = true;

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  play(type: SoundType): void {
    if (!this.enabled) return;
    if (typeof window === 'undefined') return;

    try {
      SOUND_PLAYERS[type]();
    } catch {
      // 音声再生失敗は無視
    }
  }
}

export const soundManager = new SoundManager();
