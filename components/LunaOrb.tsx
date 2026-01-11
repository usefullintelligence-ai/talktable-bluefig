
import React from 'react';
import { AppState } from '../types';

interface LunaOrbProps {
  state: AppState;
  onClick?: () => void;
}

const LunaOrb: React.FC<LunaOrbProps> = ({ state, onClick }) => {
  const isSpeaking = state === AppState.SPEAKING;
  const isListening = state === AppState.LISTENING;
  const isIdle = state === AppState.IDLE;
  const isConnecting = state === AppState.CONNECTING;

  return (
    <div className="relative flex items-center justify-center w-72 h-72">
      {/* Background Glow */}
      <div className={`
        absolute inset-0 rounded-full blur-[80px] transition-all duration-1000
        ${isListening ? 'bg-orange-500/20 opacity-100 scale-125' : 
          isSpeaking ? 'bg-blue-600/20 opacity-100 scale-110' : 
          'bg-slate-900/10 opacity-50'}
      `}></div>

      {/* Main Interactive Orb */}
      <button 
        onClick={onClick}
        disabled={isConnecting}
        className={`
          relative z-10 w-44 h-44 rounded-full flex flex-col items-center justify-center
          transition-all duration-700 shadow-2xl overflow-hidden
          outline-none ring-offset-4 focus:ring-2 focus:ring-orange-200
          ${isIdle ? 'hover:scale-105 active:scale-95 cursor-pointer animate-pulse-fig' : 'cursor-default'}
          ${isListening ? 'scale-110 shadow-[0_0_100px_rgba(194,65,12,0.4)]' : ''}
          ${isConnecting ? 'opacity-80 scale-90' : 'scale-100'}
          bg-gradient-to-br from-[#1e3a8a] via-[#4c1d95] to-[#1e1b4b]
        `}
      >
        {/* Iridescent Layer */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_70%)] pointer-events-none"></div>
        
        {/* Core Ember */}
        <div className={`
          absolute w-12 h-12 bg-orange-400 rounded-full blur-[30px] transition-opacity duration-1000
          ${isListening ? 'opacity-80' : 'opacity-20'}
        `}></div>
        
        <span className="font-playfair text-white text-3xl font-bold tracking-[0.2em] relative z-20">
          LUNA
        </span>
        
        {isIdle && (
          <div className="flex flex-col items-center gap-1 mt-2 relative z-20">
            <span className="text-[9px] text-white/60 font-bold uppercase tracking-[0.4em]">
              Tap to Begin
            </span>
          </div>
        )}

        {isConnecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1e1b4b]/60 backdrop-blur-sm z-30">
            <div className="w-6 h-6 border-2 border-white/20 border-t-orange-400 rounded-full animate-spin"></div>
          </div>
        )}
      </button>

      {/* Bottom Reflection */}
      <div className={`
        absolute -bottom-16 w-56 h-10 rounded-full blur-3xl transition-all duration-1000
        ${!isIdle ? 'bg-orange-500/30' : 'bg-slate-900/10'}
      `}></div>
    </div>
  );
};

export default LunaOrb;
