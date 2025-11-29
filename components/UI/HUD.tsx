
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useEffect } from 'react';
import { Heart, Zap, Trophy, MapPin, Diamond, Rocket, ArrowUpCircle, Shield, Activity, PlusCircle, Play, ArrowLeft, ArrowRight, ArrowUp, Settings, Volume2, VolumeX, Music, Monitor, X } from 'lucide-react';
import { useStore } from '../../store';
import { GameStatus, COLLECTION_COLORS, ShopItem, RUN_SPEED_BASE } from '../../types';
import { audio } from '../System/Audio';

// Available Shop Items
const SHOP_ITEMS: ShopItem[] = [
    {
        id: 'DOUBLE_JUMP',
        name: 'DOUBLE JUMP',
        description: 'Jump again in mid-air.',
        cost: 1000,
        icon: ArrowUpCircle,
        oneTime: true
    },
    {
        id: 'MAX_LIFE',
        name: 'MAX LIFE UP',
        description: 'Permanently adds a heart.',
        cost: 1500,
        icon: Activity
    },
    {
        id: 'HEAL',
        name: 'REPAIR KIT',
        description: 'Restores 1 Life point.',
        cost: 1000,
        icon: PlusCircle
    },
    {
        id: 'IMMORTAL',
        name: 'IMMORTALITY',
        description: 'Unlock: Tap/Space to be invincible (5s).',
        cost: 3000,
        icon: Shield,
        oneTime: true
    }
];

// Helper for dispatching input for on-screen controls
const triggerKey = (key: string) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key }));
};

const SettingsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { 
        nickname, setNickname, 
        musicEnabled, toggleMusic, 
        sfxEnabled, toggleSfx, 
        quality, toggleQuality 
    } = useStore();
    
    const [tempName, setTempName] = useState(nickname);

    const handleSave = () => {
        if (tempName.trim().length > 0) setNickname(tempName);
        onClose();
    };

    return (
        <div className="absolute inset-0 bg-black/90 z-[150] flex items-center justify-center p-4 backdrop-blur-md pointer-events-auto">
            <div className="bg-gray-900 border border-gray-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X />
                </button>

                <h2 className="text-2xl font-black text-cyan-400 font-cyber mb-6 flex items-center">
                    <Settings className="mr-2" /> SETTINGS
                </h2>

                {/* Nickname */}
                <div className="mb-6">
                    <label className="text-gray-400 text-xs tracking-widest mb-2 block uppercase">Pilot Callsign</label>
                    <input 
                        type="text" 
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        maxLength={12}
                        className="w-full bg-black/50 border border-gray-600 rounded p-3 text-white font-mono text-lg focus:border-cyan-500 focus:outline-none uppercase"
                    />
                </div>

                {/* Toggles */}
                <div className="space-y-4 mb-8">
                    {/* Music Toggle */}
                    <div className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
                        <div className="flex items-center text-white">
                            <Music className="w-5 h-5 mr-3 text-purple-400" />
                            <span className="font-mono">Music</span>
                        </div>
                        <button 
                            onClick={toggleMusic}
                            className={`w-12 h-6 rounded-full relative transition-colors ${musicEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${musicEnabled ? 'left-7' : 'left-1'}`}></div>
                        </button>
                    </div>

                    {/* SFX Toggle */}
                    <div className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
                        <div className="flex items-center text-white">
                            {sfxEnabled ? <Volume2 className="w-5 h-5 mr-3 text-yellow-400" /> : <VolumeX className="w-5 h-5 mr-3 text-gray-400" />}
                            <span className="font-mono">Sound FX</span>
                        </div>
                        <button 
                            onClick={toggleSfx}
                            className={`w-12 h-6 rounded-full relative transition-colors ${sfxEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${sfxEnabled ? 'left-7' : 'left-1'}`}></div>
                        </button>
                    </div>

                    {/* Quality Toggle */}
                    <div className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg">
                        <div className="flex items-center text-white">
                            <Monitor className="w-5 h-5 mr-3 text-blue-400" />
                            <span className="font-mono">Quality</span>
                        </div>
                        <button 
                            onClick={toggleQuality}
                            className={`text-xs font-bold px-3 py-1 bg-gray-700 rounded border border-gray-500 hover:bg-gray-600 ${quality === 'HIGH' ? 'text-green-400' : 'text-yellow-400'}`}
                        >
                            {quality}
                        </button>
                    </div>
                </div>

                <button 
                    onClick={handleSave}
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition-transform"
                >
                    SAVE CHANGES
                </button>
            </div>
        </div>
    );
};

const ShopScreen: React.FC = () => {
    const { score, buyItem, closeShop, hasDoubleJump, hasImmortality } = useStore();
    const [items, setItems] = useState<ShopItem[]>([]);

    useEffect(() => {
        let pool = SHOP_ITEMS.filter(item => {
            if (item.id === 'DOUBLE_JUMP' && hasDoubleJump) return false;
            if (item.id === 'IMMORTAL' && hasImmortality) return false;
            return true;
        });
        pool = pool.sort(() => 0.5 - Math.random());
        setItems(pool.slice(0, 3));
    }, []);

    return (
        <div className="absolute inset-0 bg-black/90 z-[100] text-white pointer-events-auto backdrop-blur-md overflow-y-auto">
             <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                 <h2 className="text-3xl md:text-4xl font-black text-cyan-400 mb-2 font-cyber tracking-widest text-center">CYBER SHOP</h2>
                 <div className="flex items-center text-yellow-400 mb-6 md:mb-8">
                     <span className="text-base md:text-lg mr-2">CREDITS:</span>
                     <span className="text-xl md:text-2xl font-bold">{score.toLocaleString()}</span>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl w-full mb-8">
                     {items.map(item => {
                         const Icon = item.icon;
                         const canAfford = score >= item.cost;
                         return (
                             <div key={item.id} className="bg-gray-900/80 border border-gray-700 p-4 rounded-xl flex flex-col items-center text-center">
                                 <div className="bg-gray-800 p-3 rounded-full mb-3">
                                     <Icon className="w-6 h-6 text-cyan-400" />
                                 </div>
                                 <h3 className="text-lg font-bold mb-2">{item.name}</h3>
                                 <p className="text-gray-400 text-xs mb-4 h-10 flex items-center justify-center">{item.description}</p>
                                 <button 
                                    onClick={() => buyItem(item.id as any, item.cost)}
                                    disabled={!canAfford}
                                    className={`px-4 py-2 rounded font-bold w-full text-sm ${canAfford ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-gray-700 opacity-50'}`}
                                 >
                                     {item.cost} GEMS
                                 </button>
                             </div>
                         );
                     })}
                 </div>

                 <button 
                    onClick={closeShop}
                    className="flex items-center px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded shadow-[0_0_20px_rgba(255,0,255,0.4)]"
                 >
                     RESUME <Play className="ml-2 w-5 h-5" fill="white" />
                 </button>
             </div>
        </div>
    );
};

export const HUD: React.FC = () => {
  const { score, lives, maxLives, collectedLetters, status, level, restartGame, startGame, gemsCollected, distance, isImmortalityActive, speed, nickname, setNickname } = useStore();
  const [showSettings, setShowSettings] = useState(false);
  
  const target = ['J', 'U', 'P', 'I', 'T', 'E', 'R'];
  const containerClass = "absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 z-50";

  // Ensure Audio Context is ready on interaction
  const handleStart = () => {
      audio.init();
      startGame();
  };

  const handleRestart = () => {
      audio.init();
      restartGame();
  };

  if (showSettings) return <SettingsModal onClose={() => setShowSettings(false)} />;
  if (status === GameStatus.SHOP) return <ShopScreen />;

  // --- MENU SCREEN ---
  if (status === GameStatus.MENU) {
      return (
          <div className="absolute inset-0 flex items-center justify-center z-[100] bg-black/80 backdrop-blur-sm p-4 pointer-events-auto">
              <div className="absolute top-4 right-4 z-[110]">
                   <button onClick={() => setShowSettings(true)} className="p-3 bg-gray-800/80 rounded-full hover:bg-gray-700 transition border border-gray-600">
                       <Settings className="text-white w-6 h-6" />
                   </button>
              </div>

              <div className="relative w-full max-w-sm bg-gray-900 border border-orange-500/30 rounded-3xl overflow-hidden shadow-2xl">
                {/* Header Art */}
                <div className="bg-gradient-to-br from-red-900 to-black p-8 text-center relative overflow-hidden">
                    <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-orange-500/20 blur-3xl rounded-full"></div>
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600 font-cyber relative z-10 drop-shadow-lg">
                        RUN TO<br/>JUPITER
                    </h1>
                    <div className="mt-4 inline-block px-4 py-1 bg-black/40 rounded-full border border-orange-500/20">
                        <p className="text-orange-200 text-xs font-mono tracking-widest uppercase">Made by Faizan</p>
                    </div>
                </div>

                {/* Body */}
                 <div className="p-6 flex flex-col items-center">
                    {nickname === 'PLAYER' && (
                        <div className="w-full mb-4">
                             <label className="text-xs text-orange-400 font-bold mb-1 block tracking-wider">ENTER NAME</label>
                             <input 
                                type="text" 
                                placeholder="PILOT NAME"
                                maxLength={10}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full bg-black/50 border border-gray-700 rounded px-4 py-3 text-white font-mono uppercase focus:border-orange-500 outline-none transition-colors"
                             />
                        </div>
                    )}
                    {nickname !== 'PLAYER' && (
                         <div className="mb-6 text-center">
                             <p className="text-xs text-gray-400 tracking-widest">PILOT DETECTED</p>
                             <p className="text-xl text-white font-bold font-mono uppercase text-orange-400">{nickname}</p>
                         </div>
                    )}

                    <button 
                      onClick={handleStart}
                      className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-black text-xl rounded-xl hover:brightness-110 transition-all shadow-lg flex items-center justify-center"
                    >
                        LAUNCH <Play className="ml-2 w-5 h-5 fill-white" />
                    </button>
                 </div>
              </div>
          </div>
      );
  }

  // --- GAME OVER SCREEN ---
  if (status === GameStatus.GAME_OVER) {
      return (
          <div className="absolute inset-0 bg-black/90 z-[100] text-white pointer-events-auto backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-gray-900/90 border border-red-900/50 p-6 rounded-2xl text-center">
                <h1 className="text-5xl font-black text-white mb-2 font-cyber tracking-widest text-red-500">CRITICAL FAILURE</h1>
                <p className="text-gray-400 mb-6 font-mono">PILOT: {nickname}</p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-black/50 p-3 rounded border border-gray-800">
                        <div className="text-xs text-gray-500">LEVEL</div>
                        <div className="text-xl font-bold text-yellow-400">{level}</div>
                    </div>
                    <div className="bg-black/50 p-3 rounded border border-gray-800">
                         <div className="text-xs text-gray-500">GEMS</div>
                        <div className="text-xl font-bold text-cyan-400">{gemsCollected}</div>
                    </div>
                    <div className="col-span-2 bg-black/50 p-3 rounded border border-gray-800">
                        <div className="text-xs text-gray-500">TOTAL SCORE</div>
                        <div className="text-3xl font-bold text-orange-500 font-mono">{score.toLocaleString()}</div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={handleRestart}
                        className="flex-1 py-3 bg-white text-black font-black text-lg rounded hover:bg-gray-200 transition-colors"
                    >
                        RETRY
                    </button>
                    <button onClick={() => setShowSettings(true)} className="p-3 bg-gray-800 rounded hover:bg-gray-700">
                        <Settings className="w-6 h-6 text-white" />
                    </button>
                </div>
              </div>
          </div>
      );
  }

  // --- VICTORY SCREEN ---
  if (status === GameStatus.VICTORY) {
    return (
        <div className="absolute inset-0 bg-gradient-to-b from-orange-900 to-black z-[100] text-white pointer-events-auto flex items-center justify-center p-4">
            <div className="text-center">
                <Rocket className="w-20 h-20 text-yellow-400 mx-auto mb-4 animate-bounce" />
                <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-500 mb-2 font-cyber">
                    JUPITER REACHED
                </h1>
                <p className="text-orange-200 text-xl font-mono mb-8">EXCELLENT WORK, {nickname}</p>
                <div className="text-4xl font-bold text-white mb-8 border-2 border-yellow-500 inline-block px-8 py-4 rounded-xl bg-black/50 backdrop-blur">
                    SCORE: {score.toLocaleString()}
                </div>
                <br/>
                <button 
                  onClick={handleRestart}
                  className="px-10 py-4 bg-white text-black font-black text-xl rounded-full hover:scale-105 transition-transform shadow-2xl"
                >
                    PLAY AGAIN
                </button>
            </div>
        </div>
    );
  }

  // --- HUD (IN-GAME) ---
  return (
    <>
        <div className={containerClass}>
            {/* Top Bar */}
            <div className="flex justify-between items-start w-full">
                <div>
                    <div className="text-xs text-gray-400 font-mono mb-1">SCORE</div>
                    <div className="text-3xl md:text-5xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-cyber">
                        {score.toLocaleString()}
                    </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                    <div className="flex space-x-1">
                        {[...Array(maxLives)].map((_, i) => (
                            <Heart 
                                key={i} 
                                className={`w-6 h-6 md:w-8 md:h-8 ${i < lives ? 'text-pink-500 fill-pink-500' : 'text-gray-600 fill-gray-600'} drop-shadow-md`} 
                            />
                        ))}
                    </div>
                    <button 
                        onClick={() => setShowSettings(true)} 
                        className="pointer-events-auto p-2 bg-black/40 backdrop-blur rounded-full hover:bg-black/60 transition"
                    >
                        <Settings className="w-4 h-4 text-gray-300" />
                    </button>
                </div>
            </div>
            
            {/* Center Info */}
            <div className="absolute top-4 left-0 w-full flex justify-center pointer-events-none">
                 <div className="bg-black/40 backdrop-blur px-4 py-1 rounded-full border border-white/10 text-xs md:text-sm font-bold text-purple-300">
                    LVL {level}
                 </div>
            </div>

            {/* Collection Letters */}
            <div className="absolute top-20 left-0 w-full flex justify-center space-x-1 md:space-x-2 pointer-events-none">
                {target.map((char, idx) => {
                    const isCollected = collectedLetters.includes(idx);
                    const color = COLLECTION_COLORS[idx];

                    return (
                        <div 
                            key={idx}
                            style={{
                                color: isCollected ? color : '#333',
                                borderColor: isCollected ? color : '#333',
                                backgroundColor: isCollected ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)',
                                textShadow: isCollected ? `0 0 10px ${color}` : 'none'
                            }}
                            className={`w-8 h-10 md:w-12 md:h-14 flex items-center justify-center border-2 font-black text-lg md:text-2xl font-cyber rounded transition-all duration-300`}
                        >
                            {char}
                        </div>
                    );
                })}
            </div>

            {/* Bottom Status */}
            <div className="w-full flex justify-between items-end pb-12 md:pb-0">
                {isImmortalityActive && (
                     <div className="flex items-center text-yellow-400 font-bold animate-pulse bg-black/50 px-3 py-1 rounded">
                        <Shield className="w-4 h-4 mr-2" /> SHIELD ACTIVE
                     </div>
                )}
                {!isImmortalityActive && <div></div>} {/* Spacer */}

                <div className="flex items-center space-x-2 text-orange-500 opacity-80 bg-black/40 px-3 py-1 rounded">
                    <Zap className="w-4 h-4" />
                    <span className="font-mono font-bold">{Math.round((speed / RUN_SPEED_BASE) * 100)}%</span>
                </div>
            </div>
        </div>

        {/* Mobile On-Screen Controls */}
        {status === GameStatus.PLAYING && (
            <div className="absolute inset-0 pointer-events-none z-[60] flex flex-col justify-end pb-8 px-6 md:hidden">
                <div className="flex justify-between items-end w-full">
                    <div className="flex gap-4 pointer-events-auto">
                        <button 
                            onPointerDown={(e) => { e.preventDefault(); triggerKey('ArrowLeft'); }}
                            className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 active:bg-white/30"
                        >
                            <ArrowLeft className="w-8 h-8 text-white" />
                        </button>
                        <button 
                            onPointerDown={(e) => { e.preventDefault(); triggerKey('ArrowRight'); }}
                            className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 active:bg-white/30"
                        >
                            <ArrowRight className="w-8 h-8 text-white" />
                        </button>
                    </div>

                    <div className="pointer-events-auto">
                        <button 
                            onPointerDown={(e) => { e.preventDefault(); triggerKey('ArrowUp'); }}
                            className="w-20 h-20 bg-orange-600/30 backdrop-blur-md rounded-full flex items-center justify-center border border-orange-500/50 active:bg-orange-600/50 shadow-[0_0_20px_rgba(255,100,0,0.3)]"
                        >
                            <ArrowUp className="w-10 h-10 text-white" />
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};