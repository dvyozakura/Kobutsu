// 効果音と音楽はWeb Audioで合成する。
const KEY = 'ganpukudo.muted';
const SCALE = [146.83, 155.56, 196.0, 220.0, 233.08, 293.66, 311.13, 392.0]; // 都節音階

const load = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } };

class Sound {
  constructor() {
    this.ctx = null; this.master = null; this.muted = load();
    this.mode = null; this.timer = null; this.step = 0; this.bar = 0; this.phrase = [];
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.hidden) { this.stopLoop(); this.ctx.suspend(); } else { this.ctx.resume(); this.startLoop(); }
    });
  }

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.7;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.startLoop();
  }

  toggle() {
    this.muted = !this.muted;
    try { localStorage.setItem(KEY, this.muted ? '1' : '0'); } catch { /* 保存できなくても遊べる */ }
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.7;
    return this.muted;
  }

  tone(freq, dur, { type = 'triangle', vol = 0.2, at = 0, slide = 0 } = {}) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + at;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t); o.stop(t + dur + 0.02);
  }

  noise(dur, vol, cutoff, at = 0) {
    if (!this.ctx) return;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    const f = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();
    src.buffer = buf; f.type = 'lowpass'; f.frequency.value = cutoff; g.gain.value = vol;
    src.connect(f).connect(g).connect(this.master);
    src.start(this.ctx.currentTime + at);
  }

  bead() { this.tone(1500, 0.04, { type: 'square', vol: 0.05 }); this.noise(0.03, 0.12, 3000); }
  look() { this.tone(660, 0.1, { vol: 0.08 }); this.tone(880, 0.12, { vol: 0.06, at: 0.05 }); }
  refuse() { this.tone(180, 0.2, { type: 'sawtooth', vol: 0.08, slide: -60 }); }
  bell() { [880, 1320, 1760].forEach((f, i) => this.tone(f, 0.8, { type: 'sine', vol: 0.09, at: i * 0.04 })); }
  hammer() { this.noise(0.12, 0.5, 900); this.tone(110, 0.24, { type: 'sine', vol: 0.5, slide: -60 }); }
  tick() { this.tone(1200, 0.025, { type: 'square', vol: 0.025 }); }
  win() { [293.66, 392, 440, 587.33, 783.99, 880, 1174.66].forEach((f, i) => this.tone(f, 0.7, { vol: 0.14, at: i * 0.075 })); }
  lose() { [233.08, 196, 155.56].forEach((f, i) => this.tone(f, 0.5, { type: 'sawtooth', vol: 0.07, at: i * 0.2 })); }

  // 三味線に寄せたはじき音
  pluck(freq, vol, at) {
    this.tone(freq, 0.5, { type: 'sawtooth', vol: vol * 0.5, at });
    this.tone(freq * 2, 0.16, { type: 'triangle', vol, at });
    this.noise(0.02, vol * 0.5, 2400, at);
  }

  music(mode) {
    if (this.mode === mode) return;
    this.mode = mode; this.step = 0; this.bar = 0; this.phrase = [];
    this.stopLoop(); this.startLoop();
  }

  stopLoop() { clearInterval(this.timer); this.timer = null; }

  startLoop() {
    if (!this.ctx || !this.mode || this.timer || document.hidden) return;
    const ms = this.mode === 'market' ? 170 : 260;
    this.timer = setInterval(() => this.beat(), ms);
  }

  makePhrase() {
    // 4小節ごとに旋律を作り直して、耳に残りすぎないようにする
    let at = 3;
    this.phrase = Array.from({ length: 16 }, (_, i) => {
      if (i % 4 !== 0 && Math.random() < 0.5) return null;
      at = Math.max(0, Math.min(SCALE.length - 1, at + Math.floor(Math.random() * 5) - 2));
      return SCALE[at];
    });
  }

  beat() {
    if (this.step % 16 === 0 && this.bar % 4 === 0) this.makePhrase();
    const i = this.step % 16;
    const n = this.phrase[i];
    if (n) this.pluck(n, 0.035, 0);
    if (i === 0) this.pluck(SCALE[0] / 2, 0.05, 0);
    if (this.mode === 'market' && i % 4 === 2) this.noise(0.04, 0.05, 1600);
    this.step += 1;
    if (this.step % 16 === 0) this.bar += 1;
  }
}

export const sound = new Sound();
