
import React from 'react';
import { MuteIcon, UnmuteIcon, EndCallIcon } from './icons';
import type { AgentState } from '../types';

interface ControlsProps {
  isMuted: boolean;
  onMuteToggle: () => void;
  onEndCall: () => void;
  agentState: AgentState;
}

const Controls: React.FC<ControlsProps> = ({ isMuted, onMuteToggle, onEndCall, agentState }) => {
  const isConnecting = agentState === 'CONNECTING';
  
  return (
    <div className="flex items-center space-x-6">
      <button
        onClick={onMuteToggle}
        disabled={isConnecting}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0058FF] ${
          isMuted ? 'bg-gray-300' : 'bg-white shadow-lg'
        } ${isConnecting ? 'cursor-not-allowed opacity-50' : ''}`}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <UnmuteIcon className="w-8 h-8 text-gray-700" /> : <MuteIcon className="w-8 h-8 text-[#0A1A3F]" />}
      </button>

      <button
        onClick={() => { if (window.confirm('Are you sure you want to end the call?')) onEndCall(); }}
        className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        aria-label="End Call"
      >
        <EndCallIcon className="w-10 h-10 text-white" />
      </button>
    </div>
  );
};

export default Controls;
