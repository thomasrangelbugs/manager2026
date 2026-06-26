import type { AudioSettings } from '../types';

type EffectName = 'click' | 'goal' | 'whistle' | 'transfer' | 'kick' | 'woodwork';

const audioFiles = {
  // Arquivos opcionais esperados em /public/audio:
  // menu-theme.mp3, click.mp3, crowd.mp3, goal.mp3, whistle.mp3, transfer.mp3, kick.mp3, woodwork.mp3
  menu: '/audio/menu-theme.mp3',
  crowd: '/audio/crowd.mp3',
  click: '/audio/click.mp3',
  goal: '/audio/goal.mp3',
  whistle: '/audio/whistle.mp3',
  transfer: '/audio/transfer.mp3',
  kick: '/audio/kick.mp3',
  woodwork: '/audio/woodwork.mp3',
};

class AudioService {
  private settings: AudioSettings = {
    musicVolume: 0.35,
    effectsVolume: 0.55,
    muteMusic: false,
    muteEffects: false,
  };

  private unlocked = false;

  private context: AudioContext | null = null;

  private music?: HTMLAudioElement;

  private crowd?: HTMLAudioElement;

  private radio?: HTMLAudioElement;

  private radioPlaying = false;

  private effects = new Map<EffectName, HTMLAudioElement>();

  setSettings(settings: AudioSettings) {
    this.settings = settings;
    if (this.music) this.music.volume = settings.muteMusic ? 0 : settings.musicVolume;
    if (this.crowd) this.crowd.volume = settings.muteEffects ? 0 : settings.effectsVolume * 0.45;
  }

  async unlock() {
    if (this.unlocked) return;
    this.unlocked = true;

    try {
      this.context = new AudioContext();
      await this.context.resume();
    } catch {
      this.context = null;
    }

    this.music = this.makeAudio(audioFiles.menu, true, this.settings.musicVolume);
    this.crowd = this.makeAudio(audioFiles.crowd, true, this.settings.effectsVolume * 0.45);
    this.effects.set('click', this.makeAudio(audioFiles.click, false, this.settings.effectsVolume));
    this.effects.set('goal', this.makeAudio(audioFiles.goal, false, this.settings.effectsVolume));
    this.effects.set('whistle', this.makeAudio(audioFiles.whistle, false, this.settings.effectsVolume));
    this.effects.set('transfer', this.makeAudio(audioFiles.transfer, false, this.settings.effectsVolume));
    this.effects.set('kick', this.makeAudio(audioFiles.kick, false, this.settings.effectsVolume));
    this.effects.set('woodwork', this.makeAudio(audioFiles.woodwork, false, this.settings.effectsVolume));
  }

  async playMenu() {
    if (!this.unlocked || this.radioPlaying || this.settings.muteMusic || !this.music) return;

    this.music.volume = this.settings.musicVolume;
    try {
      await this.music.play();
    } catch {
      this.playTone(180, 0.05, 0.02);
    }
  }

  pauseMenu() {
    this.music?.pause();
  }

  async startCrowd() {
    if (!this.unlocked || this.settings.muteEffects || !this.crowd) return;
    this.crowd.volume = this.settings.effectsVolume * 0.45;
    try {
      await this.crowd.play();
    } catch {
      // Fallback silencioso: torcida é ambiência, não precisa bipar.
    }
  }

  stopCrowd() {
    if (!this.crowd) return;
    this.crowd.pause();
    this.crowd.currentTime = 0;
  }

  async startRadio(src: string) {
    await this.unlock();
    this.pauseMenu();
    this.stopRadio(false);
    this.radioPlaying = true;
    this.radio = this.makeAudio(src, false, Math.max(0.2, this.settings.musicVolume));
    try {
      await this.radio.play();
    } catch {
      this.radioPlaying = false;
      this.radio = undefined;
      throw new Error('Radio indisponivel');
    }
  }

  stopRadio(resumeMenu = true) {
    if (this.radio) {
      this.radio.pause();
      this.radio.currentTime = 0;
      this.radio = undefined;
    }
    this.radioPlaying = false;
    if (resumeMenu) {
      void this.playMenu();
    }
  }

  playEffect(name: EffectName) {
    if (!this.unlocked || this.settings.muteEffects) return;
    if (name === 'whistle') {
      this.playSyntheticWhistle();
      return;
    }
    const audio = this.effects.get(name);
    if (audio) {
      audio.volume = this.settings.effectsVolume;
      audio.currentTime = 0;
      audio.play().catch(() => this.playFallbackEffect(name));
      return;
    }
    this.playFallbackEffect(name);
  }

  /** Apito único (~1s), sem mix de vários apitos do arquivo antigo. */
  private playSyntheticWhistle() {
    if (!this.context) {
      this.playFallbackEffect('whistle');
      return;
    }

    const ctx = this.context;
    const start = ctx.currentTime;
    const duration = 0.95;
    const peak = this.settings.effectsVolume * 0.42;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, start);
    master.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), start + 0.03);
    master.gain.setValueAtTime(peak, start + 0.55);
    master.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    master.connect(ctx.destination);

    const whistle = (frequency: number, offset: number) => {
      const osc = ctx.createOscillator();
      const band = ctx.createBiquadFilter();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, start + offset);
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.92, start + offset + 0.12);
      band.type = 'bandpass';
      band.frequency.value = frequency;
      band.Q.value = 8;
      osc.connect(band);
      band.connect(master);
      osc.start(start + offset);
      osc.stop(start + duration);
    };

    whistle(2850, 0);
    whistle(3200, 0.08);
  }

  private makeAudio(src: string, loop: boolean, volume: number) {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.preload = 'auto';
    audio.volume = volume;
    audio.addEventListener('error', () => {
      audio.pause();
    });
    return audio;
  }

  private playFallbackEffect(name: EffectName) {
    const fallback: Record<EffectName, [number, number]> = {
      click: [320, 0.08],
      goal: [660, 0.25],
      whistle: [960, 0.18],
      transfer: [520, 0.08],
      kick: [150, 0.07],
      woodwork: [760, 0.14],
    };
    const [frequency, duration] = fallback[name];
    this.playTone(frequency, duration, this.settings.effectsVolume * 0.08);
  }

  private playTone(frequency: number, duration: number, gainValue: number) {
    if (!this.context) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.value = gainValue;
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start();
    oscillator.stop(this.context.currentTime + duration);
  }
}

export const audioService = new AudioService();
