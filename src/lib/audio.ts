// Web Audio API Synthesized sound effects (Optional and configurable via settings)
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playClickSound() {
  const isSoundEnabled = localStorage.getItem('camino_sound_enabled') !== 'false';
  if (!isSoundEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    // Crisp, fast digital interface tick
    osc.frequency.setValueAtTime(950, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.04);

    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    console.warn('Click feedback playback failed:', e);
  }
}

export function playSuccessSound() {
  const isSoundEnabled = localStorage.getItem('camino_sound_enabled') !== 'false';
  if (!isSoundEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    
    // Ascending dual-tone for success feedback
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(440, now); // A4
    gain1.gain.setValueAtTime(0.04, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(554.37, now + 0.06); // C#5
    gain2.gain.setValueAtTime(0.05, now + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.15);
    osc2.start(now + 0.06);
    osc2.stop(now + 0.3);
  } catch (e) {
    console.warn('Success dynamic feedback playback failed:', e);
  }
}

export function playGoalCompleteSound() {
  const isSoundEnabled = localStorage.getItem('camino_sound_enabled') !== 'false';
  if (!isSoundEnabled) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    
    // Triad arpeggio for major accomplishments! (C major chord progression)
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);
      
      gainNode.gain.setValueAtTime(0.04, now + i * 0.06);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.22);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.25);
    });
  } catch (e) {
    console.warn('Reward feedback playback failed:', e);
  }
}
