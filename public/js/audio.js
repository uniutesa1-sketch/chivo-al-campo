// Audio sintetizado con Web Audio API para no depender de archivos externos
const AudioEngine = {
  ctx: null,

  init() {
    try {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {
      console.warn('AudioContext no inicializado aún:', e);
    }
  },

  // Timbre de alerta de comanda de cocina (ding-dong de dos tonos de campana de restaurante)
  playOrderAlert() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      
      // Primer tono (agudo resonante)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.4, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Segundo tono (campana cálida)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1174.66, now + 0.15);
      gain2.gain.setValueAtTime(0.5, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 1.2);
    } catch (e) {
      console.warn('Alerta sonora omitida:', e);
    }
  },

  // Chime de éxito (pago completado / orden enviada)
  playSuccessChime() {
    try {
      this.init();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50];
      const start = this.ctx.currentTime;

      notes.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noteTime = start + (index * 0.08);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);
        gain.gain.setValueAtTime(0.25, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(noteTime);
        osc.stop(noteTime + 0.5);
      });
    } catch (e) {
      console.warn('Chime de éxito omitido:', e);
    }
  },

  // Sonido de clic suave táctil
  playClick() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {
      // Silencioso
    }
  },

  // Timbre de llamada de mesero (tres tonos de timbre de alta atención)
  playWaiterAlert() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [0, 0.22, 0.44].forEach((offset) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now + offset); // Nota Si5
        gain.gain.setValueAtTime(0.4, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.35);
      });
    } catch (e) {
      console.warn('Alerta de mesero sonora omitida:', e);
    }
  }
};

window.AudioEngine = AudioEngine;

