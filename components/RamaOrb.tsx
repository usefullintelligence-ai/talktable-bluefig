
import React from 'react';
import { AppState } from '../types';

interface RamaOrbProps {
  state: AppState;
}

const RamaOrb: React.FC<RamaOrbProps> = ({ state }) => {
  const isSpeaking = state === AppState.SPEAKING;
  const isListening = state === AppState.LISTENING;

  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Background Ripples when speaking */}
      {isSpeaking && (
        <>
          <div className="ripple-effect w-full h-full" style={{ animationDelay: '0s', borderColor: '#3b82f6' }}></div>
          <div className="ripple-effect w-full h-full" style={{ animationDelay: '0.5s', borderColor: '#6366f1' }}></div>
          <div className="ripple-effect w-full h-full" style={{ animationDelay: '1s', borderColor: '#3b82f6' }}></div>
        </>
      )}

      {/* Main Orb */}
      <div 
        className={`
          relative z-10 w-40 h-40 rounded-full flex items-center justify-center
          transition-all duration-500 shadow-2xl
          ${isListening ? 'animate-pulse-blue scale-110' : 'scale-100'}
          bg-gradient-to-br from-[#1e40af] via-[#6366f1] to-[#1e3a8a]
        `}
      >
        <div className="absolute inset-2 rounded-full bg-white opacity-10 blur-sm"></div>
        <span className="font-playfair text-white text-2xl font-bold tracking-widest">
          LUNA
        </span>
      </div>

      {/* Subtle glow beneath */}
      <div className={`
        absolute -bottom-8 w-48 h-8 rounded-full blur-2xl transition-opacity duration-500
        ${isListening || isSpeaking ? 'bg-[#3b82f6] opacity-30' : 'bg-transparent opacity-0'}
      `}></div>
    </div>
  );
};

export default RamaOrb;
