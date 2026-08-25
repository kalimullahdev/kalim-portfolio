/**
 * Web Audio API Haptic Audio Synthesizer
 * Subtle tactile acoustic feedback for micro-interactions
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.initAudioContext();
    this.bindUnlock();
  }

  initAudioContext() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch(e) {
      console.warn('Web Audio API not supported');
    }
  }

  bindUnlock() {
    const unlock = () => {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled && this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.enabled;
  }

  playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.04) {
    if (!this.enabled) return;
    if (!this.ctx) this.initAudioContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch(e) {}
  }

  hover() {
    this.playTone(480, 'sine', 0.04, 0.02);
  }

  click() {
    this.playTone(720, 'sine', 0.06, 0.05);
  }

  key() {
    this.playTone(360 + Math.random() * 60, 'sine', 0.03, 0.02);
  }

  modalOpen() {
    this.playTone(540, 'sine', 0.08, 0.04);
    setTimeout(() => this.playTone(720, 'sine', 0.08, 0.04), 60);
  }

  modalClose() {
    this.playTone(600, 'sine', 0.06, 0.03);
    setTimeout(() => this.playTone(420, 'sine', 0.08, 0.03), 50);
  }
}

window.soundEngine = new SoundEngine();
