import * as Tone from 'tone';

class SoundManager {
  private initialized = false;
  private muted = false;
  private clickSynth: Tone.MembraneSynth | null = null;
  private chimeSynth: Tone.PolySynth | null = null;
  private pinSynth: Tone.Synth | null = null;
  private noiseSynth: Tone.NoiseSynth | null = null;
  private bassSynth: Tone.MonoSynth | null = null;
  private leadSynth: Tone.PolySynth | null = null;
  private bgmLoop: Tone.Loop | null = null;
  private bgmPlaying = false;

  public async initAudio(): Promise<boolean> {
    if (this.initialized) return true;
    try {
      await Tone.start();
      Tone.getDestination().volume.value = -6; // safe volume

      // UI Click Synth
      this.clickSynth = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 2,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
      }).toDestination();
      this.clickSynth.volume.value = -12;

      // Marble Collect / Gachapon PolySynth
      this.chimeSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.005, decay: 0.2, sustain: 0.05, release: 0.4 },
      }).toDestination();
      this.chimeSynth.volume.value = -10;

      // Pachinko Pin Metallic Bounce
      this.pinSynth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 },
      }).toDestination();
      this.pinSynth.volume.value = -8;

      // Slash / Impact Noise
      this.noiseSynth = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.005, decay: 0.15, sustain: 0 },
      }).toDestination();
      this.noiseSynth.volume.value = -14;

      // Bass synth for rhythm grooves
      this.bassSynth = new Tone.MonoSynth({
        oscillator: { type: 'sawtooth' },
        filter: { Q: 3, type: 'lowpass', rolloff: -24 },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.2 },
        filterEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.2, baseFrequency: 80, octaves: 2.5 },
      }).toDestination();
      this.bassSynth.volume.value = -12;

      // Lead Synth for chiptunes
      this.leadSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'square' },
        envelope: { attack: 0.01, decay: 0.15, sustain: 0.2, release: 0.2 },
      }).toDestination();
      this.leadSynth.volume.value = -15;

      this.initialized = true;
      return true;
    } catch {
      return false;
    }
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.initialized) {
      Tone.getDestination().mute = this.muted;
    }
    return this.muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public playClick(pitch = 'C4'): void {
    if (this.muted || !this.initialized || !this.clickSynth) return;
    try {
      this.clickSynth.triggerAttackRelease(pitch, '16n');
    } catch {
      // AudioContext suspended or inactive
    }
  }

  public playMetronomeTick(isStrongBeat = false): void {
    if (this.muted || !this.initialized || !this.clickSynth) return;
    try {
      this.clickSynth.triggerAttackRelease(isStrongBeat ? 'C5' : 'G4', '32n');
    } catch {}
  }

  public playMarbleCollect(noteIndex = 0): void {
    if (this.muted || !this.initialized || !this.chimeSynth) return;
    const notes = ['E5', 'G5', 'A5', 'C6', 'D6', 'E6', 'G6'];
    const note = notes[noteIndex % notes.length];
    try {
      this.chimeSynth.triggerAttackRelease(note, '16n');
    } catch {}
  }

  public playCorrect(): void {
    if (this.muted || !this.initialized || !this.chimeSynth) return;
    try {
      this.chimeSynth.triggerAttackRelease(['C5', 'E5', 'G5'], '16n');
    } catch {}
  }

  public playPinBounce(pitchRandom = 0): void {
    if (this.muted || !this.initialized || !this.pinSynth) return;
    const frequencies = [880, 1046, 1174, 1318, 1567, 1760];
    const freq = frequencies[Math.abs(pitchRandom) % frequencies.length];
    try {
      this.pinSynth.triggerAttackRelease(freq, '32n');
    } catch {}
  }

  public playJump(): void {
    if (this.muted || !this.initialized || !this.pinSynth) return;
    try {
      this.pinSynth.triggerAttackRelease(587.33, '16n');
    } catch {}
  }

  public playSlash(): void {
    if (this.muted || !this.initialized || !this.noiseSynth) return;
    try {
      this.noiseSynth.triggerAttackRelease('16n');
    } catch {}
  }

  public playHit(): void {
    if (this.muted || !this.initialized || !this.clickSynth) return;
    try {
      this.clickSynth.triggerAttackRelease('A1', '8n');
    } catch {}
  }

  public playTimerTick(urgent = false): void {
    if (this.muted || !this.initialized || !this.pinSynth) return;
    try {
      this.pinSynth.triggerAttackRelease(urgent ? 1200 : 800, '32n');
    } catch {}
  }

  public playGachaponOpen(): void {
    if (this.muted || !this.initialized || !this.chimeSynth) return;
    const chord = ['C5', 'E5', 'G5', 'C6'];
    chord.forEach((note, index) => {
      setTimeout(() => {
        try {
          this.chimeSynth?.triggerAttackRelease(note, '8n');
        } catch {}
      }, index * 90);
    });
  }

  public playFanfare(): void {
    if (this.muted || !this.initialized || !this.chimeSynth) return;
    const fanfareNotes = ['G4', 'C5', 'E5', 'G5'];
    fanfareNotes.forEach((note, idx) => {
      setTimeout(() => {
        try {
          this.chimeSynth?.triggerAttackRelease(note, '8n');
        } catch {}
      }, idx * 110);
    });
  }

  public playWin(): void {
    this.playFanfare();
  }

  public playLoss(): void {
    this.playHit();
  }

  public startBGM(bpm = 126): void {
    if (this.muted || !this.initialized || this.bgmPlaying) return;
    try {
      Tone.getTransport().bpm.value = bpm;
      const bassNotes = ['C2', 'C2', 'Eb2', 'F2', 'G2', 'Bb1', 'C2', 'G1'];
      let step = 0;

      this.bgmLoop = new Tone.Loop((time) => {
        const note = bassNotes[step % bassNotes.length];
        this.bassSynth?.triggerAttackRelease(note, '8n', time);
        step++;
      }, '8n');

      this.bgmLoop.start(0);
      Tone.getTransport().start();
      this.bgmPlaying = true;
    } catch {}
  }

  public stopBGM(): void {
    if (!this.bgmPlaying) return;
    try {
      this.bgmLoop?.stop();
      this.bgmLoop?.dispose();
      this.bgmLoop = null;
      Tone.getTransport().stop();
      this.bgmPlaying = false;
    } catch {}
  }

  public setTempo(bpm: number): void {
    if (this.initialized) {
      try {
        Tone.getTransport().bpm.rampTo(bpm, 0.5);
      } catch {}
    }
  }
}

export const soundManager = new SoundManager();
