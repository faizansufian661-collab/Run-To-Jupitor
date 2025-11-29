
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useStore } from "../../store";

export class AudioController {
  ctx: AudioContext | null = null;
  masterGain: GainNode | null = null;
  musicGain: GainNode | null = null;
  sfxGain: GainNode | null = null;
  
  // Music State
  isPlayingMusic = false;
  nextNoteTime = 0;
  timerID: number | null = null;
  noteIndex = 0;
  tempo = 110;

  constructor() {
    // Lazy initialization handled in init
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Master
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      
      // Music Bus
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.3;
      this.musicGain.connect(this.masterGain);

      // SFX Bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.4;
      this.sfxGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // --- Music Sequencer ---
  startMusic() {
      if (!this.ctx) this.init();
      if (this.isPlayingMusic) return;
      
      this.isPlayingMusic = true;
      this.noteIndex = 0;
      this.nextNoteTime = this.ctx!.currentTime;
      this.scheduler();
  }

  stopMusic() {
      this.isPlayingMusic = false;
      if (this.timerID) window.clearTimeout(this.timerID);
  }

  scheduler() {
      if (!this.isPlayingMusic || !this.ctx) return;

      while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
          this.scheduleNote(this.noteIndex, this.nextNoteTime);
          this.nextNote();
      }
      this.timerID = window.setTimeout(() => this.scheduler(), 25);
  }

  nextNote() {
      const secondsPerBeat = 60.0 / this.tempo;
      // 16th notes
      this.nextNoteTime += 0.25 * secondsPerBeat; 
      this.noteIndex++;
      if (this.noteIndex === 16) {
          this.noteIndex = 0;
      }
  }

  scheduleNote(beatNumber: number, time: number) {
      // Simple Synthwave Bassline
      // Root: C (65.41), Eb (77.78), F (87.31), G (98.00)
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.connect(gain);
      gain.connect(this.musicGain!);

      osc.type = 'sawtooth';
      
      // Bass Pattern
      let freq = 65.41; // C2
      if (beatNumber >= 8 && beatNumber < 12) freq = 77.78; // Eb2
      if (beatNumber >= 12) freq = 58.27; // Bb1

      // Octave jump for rhythmic drive
      if (beatNumber % 2 !== 0) freq *= 2; 

      osc.frequency.setValueAtTime(freq, time);
      
      // Envelope (Short plucks)
      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

      osc.start(time);
      osc.stop(time + 0.2);

      // High Arp (Sparse)
      if (beatNumber % 4 === 0) {
          const arpOsc = this.ctx!.createOscillator();
          const arpGain = this.ctx!.createGain();
          arpOsc.type = 'square';
          arpOsc.frequency.setValueAtTime(freq * 4, time);
          
          arpOsc.connect(arpGain);
          arpGain.connect(this.musicGain!);
          
          arpGain.gain.setValueAtTime(0.05, time);
          arpGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
          
          arpOsc.start(time);
          arpOsc.stop(time + 0.1);
      }
  }

  // --- SFX ---

  playGemCollect() {
    if (!useStore.getState().sfxEnabled) return;
    if (!this.ctx || !this.sfxGain) this.init();

    const t = this.ctx!.currentTime;
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(2000, t + 0.1);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain!);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playLetterCollect() {
    if (!useStore.getState().sfxEnabled) return;
    if (!this.ctx || !this.sfxGain) this.init();

    const t = this.ctx!.currentTime;
    const freqs = [523.25, 659.25, 783.99]; 
    
    freqs.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        
        osc.type = 'triangle';
        osc.frequency.value = f;
        
        const start = t + (i * 0.04);
        const dur = 0.3;

        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + dur);

        osc.connect(gain);
        gain.connect(this.sfxGain!);
        
        osc.start(start);
        osc.stop(start + dur);
    });
  }

  playJump(isDouble = false) {
    if (!useStore.getState().sfxEnabled) return;
    if (!this.ctx || !this.sfxGain) this.init();

    const t = this.ctx!.currentTime;
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();

    osc.type = 'sine';
    
    const startFreq = isDouble ? 400 : 200;
    const endFreq = isDouble ? 800 : 450;

    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.15);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain!);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playDamage() {
    if (!useStore.getState().sfxEnabled) return;
    if (!this.ctx || !this.sfxGain) this.init();

    const t = this.ctx!.currentTime;
    
    const bufferSize = this.ctx!.sampleRate * 0.3; 
    const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx!.createBufferSource();
    noise.buffer = buffer;
    
    const osc = this.ctx!.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.3);

    const oscGain = this.ctx!.createGain();
    oscGain.gain.setValueAtTime(0.6, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    const noiseGain = this.ctx!.createGain();
    noiseGain.gain.setValueAtTime(0.5, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain!);
    
    noise.connect(noiseGain);
    noiseGain.connect(this.sfxGain!);

    osc.start(t);
    osc.stop(t + 0.3);
    noise.start(t);
    noise.stop(t + 0.3);
  }
}

export const audio = new AudioController();
