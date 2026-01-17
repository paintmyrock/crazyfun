type AudioContextType = typeof AudioContext;

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (audioContext) return audioContext;

  try {
    const AudioContextClass = window.AudioContext ||
      (window as Window & { webkitAudioContext?: AudioContextType }).webkitAudioContext;

    if (AudioContextClass) {
      audioContext = new AudioContextClass();
      return audioContext;
    }
  } catch (error) {
    console.warn("Web Audio API not supported:", error);
  }

  return null;
}

export function playSoundEffect(soundIndex: number): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    switch (soundIndex) {
      case 0: // BOING!
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
        break;

      case 1: // SPLAT!
        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(500, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
        break;

      case 2: // HONK HONK!
        oscillator.frequency.setValueAtTime(300, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.setValueAtTime(0, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0, ctx.currentTime + 0.25);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
        break;

      case 3: // WHEEE!
        oscillator.frequency.setValueAtTime(400, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
        break;

      case 4: // BLORP!
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(150, ctx.currentTime);
        oscillator.frequency.setValueAtTime(100, ctx.currentTime + 0.05);
        oscillator.frequency.setValueAtTime(150, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
        break;

      case 5: // ZOOM!
        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(100, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
        break;

      case 6: // KABOOM!
        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(80, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.4);
        gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.4);
        break;

      case 7: // SQUISH!
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(600, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
        break;
    }
  } catch (error) {
    console.warn("Error playing sound:", error);
  }
}
