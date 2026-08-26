// Web Audio API 8-bit Sound Generator

class SoundFX {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 8-bit Coin Deduct sound (descending tone)
  playCoinDeduct() {
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square'; // 8-bit square wave
      const now = this.ctx.currentTime;

      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // 8-bit Powerup / Win sound (ascending arpeggio)
  playPowerup() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C E G C E G

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        const noteTime = now + idx * 0.05;

        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.12, noteTime);
        gain.gain.linearRampToValueAtTime(0.01, noteTime + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.08);
      });
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // 8-bit Button Click blip
  playClick() {
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const now = this.ctx.currentTime;

      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(800, now + 0.03);

      gain.gain.setValueAtTime(0.1, now);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // 8-bit Glass Break / Crash sound for negative budget
  playGlassBreak() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // White noise burst for glass shattering crunch
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.linearRampToValueAtTime(300, now + 0.25);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.25);

      // Low crunch tone
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.2);

      oscGain.gain.setValueAtTime(0.18, now);
      oscGain.gain.linearRampToValueAtTime(0.01, now + 0.2);

      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }
}

export const soundFX = new SoundFX();
