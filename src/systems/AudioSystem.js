const AUDIO_KEY = "project1_audio_enabled";

export default class AudioSystem {
  constructor(scene) {
    this.scene = scene;
    this.context = null;
    this.master = null;
    this.enabled = this.readEnabled();
    this.musicTimer = null;
    this.musicStep = 0;
  }

  readEnabled() {
    try {
      const raw = window.localStorage.getItem(AUDIO_KEY);
      return raw !== "0";
    } catch {
      return true;
    }
  }

  setEnabled(value) {
    this.enabled = Boolean(value);

    try {
      window.localStorage.setItem(AUDIO_KEY, this.enabled ? "1" : "0");
    } catch {
      // Audio preference remains active for the current session.
    }

    if (!this.enabled) {
      this.stopMusic();
      return;
    }

    this.startMusic();
  }

  ensureContext() {
    if (!this.enabled) return null;

    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;

      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0.055;
      this.master.connect(this.context.destination);
    }

    if (this.context.state === "suspended") {
      this.context.resume().catch(() => {});
    }

    return this.context;
  }

  tone(frequency, duration = 0.09, type = "square", volume = 0.22, delay = 0) {
    const ctx = this.ensureContext();
    if (!ctx || !this.master) return;

    const start = ctx.currentTime + delay;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  jump() {
    this.tone(420, 0.08, "square", 0.13);
    this.tone(620, 0.10, "square", 0.11, 0.045);
  }

  coin() {
    this.tone(880, 0.07, "triangle", 0.16);
    this.tone(1320, 0.10, "triangle", 0.12, 0.055);
  }

  powerUp(type) {
    const base = type === "speed" ? 510 : 360;
    this.tone(base, 0.08, "sawtooth", 0.14);
    this.tone(base * 1.25, 0.08, "sawtooth", 0.12, 0.07);
    this.tone(base * 1.5, 0.14, "triangle", 0.11, 0.14);
  }

  enemyDefeat() {
    this.tone(170, 0.11, "square", 0.12);
    this.tone(120, 0.12, "square", 0.10, 0.06);
  }

  damage() {
    this.tone(145, 0.16, "sawtooth", 0.17);
    this.tone(95, 0.18, "sawtooth", 0.13, 0.075);
  }

  checkpoint() {
    this.tone(523.25, 0.10, "triangle", 0.13);
    this.tone(659.25, 0.10, "triangle", 0.12, 0.09);
    this.tone(783.99, 0.16, "triangle", 0.11, 0.18);
  }

  victory() {
    [523.25, 659.25, 783.99, 1046.5].forEach((note, index) => {
      this.tone(note, 0.18, "triangle", 0.13, index * 0.12);
    });
  }

  gameOver() {
    this.tone(392, 0.18, "sawtooth", 0.13);
    this.tone(293.66, 0.24, "sawtooth", 0.12, 0.14);
  }

  startMusic() {
    if (!this.enabled || this.musicTimer) return;

    this.ensureContext();
    const notes = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23];

    this.musicTimer = this.scene.time.addEvent({
      delay: 420,
      loop: true,
      callback: () => {
        if (!this.enabled) return;
        const note = notes[this.musicStep % notes.length];
        this.musicStep += 1;
        this.tone(note, 0.20, "triangle", 0.045);
      }
    });
  }

  stopMusic() {
    if (this.musicTimer) {
      this.musicTimer.remove(false);
      this.musicTimer = null;
    }
  }

  unlock() {
    this.ensureContext();
  }

  destroy() {
    this.stopMusic();
    if (this.context && this.context.state !== "closed") {
      this.context.close().catch(() => {});
    }
    this.context = null;
    this.master = null;
  }
}
