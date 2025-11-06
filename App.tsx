import React, { useState, useEffect } from 'react';
import AuthScreen from './components/AuthScreen';
import MainScreen from './components/MainScreen';
import type { User, StageId, Message } from './types';
import { STAGES } from './constants';
import { loadSession, clearSession } from './utils/sessionManager';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [initialStageId, setInitialStageId] = useState<StageId>('INTRO');
  const [initialTranscripts, setInitialTranscripts] = useState<Message[]>([]);

  useEffect(() => {
    // Check for saved session using the session manager
    const savedSession = loadSession();
    if (savedSession) {
      const { user, currentStageId, transcripts } = savedSession;
      setUser(user);
      const lastStageIndex = STAGES.findIndex(s => s.id === currentStageId);
      // Resume from the last completed stage. If last stage was END_FLOW, restart.
      const resumeStageId = currentStageId === 'END_FLOW' || lastStageIndex < 0 ? 'INTRO' : STAGES[lastStageIndex].id;
      setInitialStageId(resumeStageId);
      setInitialTranscripts(resumeStageId === 'INTRO' ? [] : transcripts);
    }
  }, []);

  const handleLogin = (name: string, phone: string) => {
    const newUser: User = { name, phone };
    setUser(newUser);
    // Clear previous session data for a new user
    clearSession();
    setInitialStageId('INTRO');
    setInitialTranscripts([]);
  };

  const handleLogout = () => {
    setUser(null);
    clearSession();
  };

  return (
    <div className="min-h-screen text-[#475569]">
      {user ? (
        <MainScreen 
          user={user} 
          initialStageId={initialStageId} 
          initialTranscripts={initialTranscripts}
          onLogout={handleLogout} 
        />
      ) : (
        <AuthScreen onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
