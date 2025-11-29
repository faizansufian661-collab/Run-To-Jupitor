
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameStatus, RUN_SPEED_BASE } from './types';
import { audio } from './components/System/Audio';

interface GameState {
  status: GameStatus;
  score: number;
  lives: number;
  maxLives: number;
  speed: number;
  collectedLetters: number[]; 
  level: number;
  laneCount: number;
  gemsCollected: number;
  distance: number;
  
  // Player Identity
  nickname: string;
  setNickname: (name: string) => void;

  // Settings
  musicEnabled: boolean;
  sfxEnabled: boolean;
  quality: 'LOW' | 'HIGH';
  toggleMusic: () => void;
  toggleSfx: () => void;
  toggleQuality: () => void;

  // Inventory / Abilities
  hasDoubleJump: boolean;
  hasImmortality: boolean;
  isImmortalityActive: boolean;

  // Actions
  startGame: () => void;
  restartGame: () => void;
  takeDamage: () => void;
  addScore: (amount: number) => void;
  collectGem: (value: number) => void;
  collectLetter: (index: number) => void;
  setStatus: (status: GameStatus) => void;
  setDistance: (dist: number) => void;
  
  // Shop / Abilities
  buyItem: (type: 'DOUBLE_JUMP' | 'MAX_LIFE' | 'HEAL' | 'IMMORTAL', cost: number) => boolean;
  advanceLevel: () => void;
  openShop: () => void;
  closeShop: () => void;
  activateImmortality: () => void;
}

// JUPITER has 7 letters
const COLLECTION_TARGET = ['J', 'U', 'P', 'I', 'T', 'E', 'R'];
const MAX_LEVEL = 3;

export const useStore = create<GameState>()(
  persist(
    (set, get) => ({
      status: GameStatus.MENU,
      score: 0,
      lives: 3,
      maxLives: 3,
      speed: 0,
      collectedLetters: [],
      level: 1,
      laneCount: 3,
      gemsCollected: 0,
      distance: 0,
      
      nickname: 'PLAYER',
      musicEnabled: true,
      sfxEnabled: true,
      quality: 'HIGH',

      hasDoubleJump: false,
      hasImmortality: false,
      isImmortalityActive: false,

      setNickname: (name) => set({ nickname: name.substring(0, 12).toUpperCase() }),

      toggleMusic: () => {
        const next = !get().musicEnabled;
        set({ musicEnabled: next });
        if (next && get().status === GameStatus.PLAYING) {
             audio.startMusic();
        } else {
             audio.stopMusic();
        }
      },

      toggleSfx: () => set((state) => ({ sfxEnabled: !state.sfxEnabled })),

      toggleQuality: () => set((state) => ({ quality: state.quality === 'HIGH' ? 'LOW' : 'HIGH' })),

      startGame: () => {
        const { musicEnabled } = get();
        if (musicEnabled) audio.startMusic();
        
        set({ 
          status: GameStatus.PLAYING, 
          score: 0, 
          lives: 3, 
          maxLives: 3,
          speed: RUN_SPEED_BASE,
          collectedLetters: [],
          level: 1,
          laneCount: 3,
          gemsCollected: 0,
          distance: 0,
          hasDoubleJump: false,
          hasImmortality: false,
          isImmortalityActive: false
        });
      },

      restartGame: () => {
        const { musicEnabled } = get();
        if (musicEnabled) audio.startMusic();

        set({ 
          status: GameStatus.PLAYING, 
          score: 0, 
          lives: 3, 
          maxLives: 3,
          speed: RUN_SPEED_BASE,
          collectedLetters: [],
          level: 1,
          laneCount: 3,
          gemsCollected: 0,
          distance: 0,
          hasDoubleJump: false,
          hasImmortality: false,
          isImmortalityActive: false
        });
      },

      takeDamage: () => {
        const { lives, isImmortalityActive } = get();
        if (isImmortalityActive) return; 

        if (lives > 1) {
          set({ lives: lives - 1 });
        } else {
          audio.stopMusic();
          set({ lives: 0, status: GameStatus.GAME_OVER, speed: 0 });
        }
      },

      addScore: (amount) => set((state) => ({ score: state.score + amount })),
      
      collectGem: (value) => set((state) => ({ 
        score: state.score + value, 
        gemsCollected: state.gemsCollected + 1 
      })),

      setDistance: (dist) => set({ distance: dist }),

      collectLetter: (index) => {
        const { collectedLetters, level, speed } = get();
        
        if (!collectedLetters.includes(index)) {
          const newLetters = [...collectedLetters, index];
          
          const speedIncrease = RUN_SPEED_BASE * 0.10;
          const nextSpeed = speed + speedIncrease;

          set({ 
            collectedLetters: newLetters,
            speed: nextSpeed
          });

          if (newLetters.length === COLLECTION_TARGET.length) {
            if (level < MAX_LEVEL) {
                get().advanceLevel();
            } else {
                audio.stopMusic();
                set({
                    status: GameStatus.VICTORY,
                    score: get().score + 5000
                });
            }
          }
        }
      },

      advanceLevel: () => {
          const { level, laneCount, speed } = get();
          const nextLevel = level + 1;
          
          const speedIncrease = RUN_SPEED_BASE * 0.40;
          const newSpeed = speed + speedIncrease;

          set({
              level: nextLevel,
              laneCount: Math.min(laneCount + 2, 9), 
              status: GameStatus.PLAYING, 
              speed: newSpeed,
              collectedLetters: [] 
          });
      },

      openShop: () => set({ status: GameStatus.SHOP }),
      
      closeShop: () => set({ status: GameStatus.PLAYING }),

      buyItem: (type, cost) => {
          const { score, maxLives, lives } = get();
          
          if (score >= cost) {
              set({ score: score - cost });
              
              switch (type) {
                  case 'DOUBLE_JUMP':
                      set({ hasDoubleJump: true });
                      break;
                  case 'MAX_LIFE':
                      set({ maxLives: maxLives + 1, lives: lives + 1 });
                      break;
                  case 'HEAL':
                      set({ lives: Math.min(lives + 1, maxLives) });
                      break;
                  case 'IMMORTAL':
                      set({ hasImmortality: true });
                      break;
              }
              return true;
          }
          return false;
      },

      activateImmortality: () => {
          const { hasImmortality, isImmortalityActive } = get();
          if (hasImmortality && !isImmortalityActive) {
              set({ isImmortalityActive: true });
              setTimeout(() => {
                  set({ isImmortalityActive: false });
              }, 5000);
          }
      },

      setStatus: (status) => set({ status }),
    }),
    {
      name: 'run-to-jupiter-storage',
      partialize: (state) => ({ 
        nickname: state.nickname, 
        musicEnabled: state.musicEnabled, 
        sfxEnabled: state.sfxEnabled,
        quality: state.quality,
        hasDoubleJump: state.hasDoubleJump // Persist purchased upgrades
      }),
    }
  )
);
