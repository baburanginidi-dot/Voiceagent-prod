
import React from 'react';
import Stepper from './Stepper';
import VoiceVisualizer from './VoiceVisualizer';
import Controls from './Controls';
import TranscriptionPanel from './TranscriptionPanel';
import { useConversationManager } from '../hooks/useConversationManager';
import type { Session } from '../types';

interface MainScreenProps {
  session: Session;
  token: string;
  onLogout: () => void;
}

const MainScreen: React.FC<MainScreenProps> = ({ session, token, onLogout }) => {
  const { agentState, isMuted, transcripts, currentStageId, toggleMute } = useConversationManager({
    sessionId: session.id,
    token,
    initialStageId: session.currentStageId,
  });
  
  const handleEndCall = () => {
    // Calling onLogout will unmount the component.
    // The useEffect cleanup in useConversationManager will handle the disconnection.
    onLogout();
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="p-4 border-b border-[#E2E8F0] bg-white/80 backdrop-blur-sm flex items-center justify-between">
         <div>
           <p className="text-sm text-slate-500">Connected as</p>
           <p className="font-semibold text-slate-800">{session.userName}</p>
         </div>
         <Stepper currentStageId={currentStageId} />
      </header>
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 overflow-hidden">
        <div className="lg:col-span-1 h-full overflow-y-auto rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,88,255,0.08)]">
            <TranscriptionPanel transcripts={transcripts} />
        </div>
        <div className="lg:col-span-2 flex flex-col items-center justify-center h-full p-4 space-y-8">
            <VoiceVisualizer state={agentState} />
            <Controls 
                isMuted={isMuted}
                onMuteToggle={toggleMute}
                onEndCall={handleEndCall}
                agentState={agentState}
            />
        </div>
      </main>
    </div>
  );
};

export default MainScreen;
