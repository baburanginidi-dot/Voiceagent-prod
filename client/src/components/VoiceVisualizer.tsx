
import React from 'react';
import type { AgentState } from '../types';

const VoiceVisualizer: React.FC<{ state: AgentState }> = ({ state }) => {
  let content;
  let label;

  switch (state) {
    case 'SPEAKING':
      label = 'Maya is speaking...';
      content = (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#0A1A3F] flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg z-10 font-poppins">MAYA</span>
          </div>
          <div className="wave-circle w-32 h-32 md:w-40 md:h-40" style={{ animationDelay: '0s' }}></div>
          <div className="wave-circle w-32 h-32 md:w-40 md:h-40" style={{ animationDelay: '0.6s' }}></div>
          <div className="wave-circle w-32 h-32 md:w-40 md:h-40" style={{ animationDelay: '1.2s' }}></div>
        </div>
      );
      break;

    case 'LISTENING':
      label = 'Listening...';
      content = (
        <div 
          className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-white transition-all duration-300 flex items-center justify-center"
          style={{ animation: 'listening-pulse 2s infinite ease-in-out' }}
        >
          <span className="text-[#0A1A3F] font-bold text-lg font-poppins">LISTENING</span>
        </div>
      );
      break;
    
    case 'THINKING':
      label = 'Thinking...';
      content = (
        <div 
          className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-[#0058FF] shadow-[0_0_30px_10px_rgba(0,88,255,0.25)] transition-all duration-300 flex items-center justify-center"
          style={{ animation: 'thinking-pulse 1.5s infinite ease-in-out' }}
        >
          <span className="text-white font-bold text-lg font-poppins">THINKING</span>
        </div>
      );
      break;
    
    case 'CONNECTING':
      label = 'Connecting...';
      content = (
        <div className="w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-gray-200 border-t-4 border-t-[#0058FF] animate-spin flex items-center justify-center">
        </div>
      );
      break;

    case 'ERROR':
      label = 'Connection Error';
      content = (
        <div className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-red-500 shadow-[0_0_20px_5px_rgba(239,68,68,0.3)] flex items-center justify-center">
           <span className="text-white font-bold text-center text-lg font-poppins">ERROR</span>
        </div>
      );
      break;

    default: // IDLE
      label = 'Ready';
      content = (
        <div className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-white border border-[#E2E8F0] shadow-md flex items-center justify-center">
           <span className="text-[#0A1A3F] font-bold text-lg font-poppins">MAYA</span>
        </div>
      );
      break;
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
        {content}
      </div>
      <p className="text-lg font-medium text-[#0A1A3F] h-6">{label}</p>
    </div>
  );
};

export default VoiceVisualizer;
