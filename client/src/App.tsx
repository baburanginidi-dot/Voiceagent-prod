import React, { useState } from 'react';
import AuthScreen from './components/AuthScreen';
import MainScreen from './components/MainScreen';
import type { ActiveSession } from './types';
import { createSession } from './api/sessions';

const App: React.FC = () => {
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);

  const handleLogin = async (name: string, phone: string) => {
    const { session, token } = await createSession({ name, phone });
    setActiveSession({ session, token });
  };

  const handleLogout = () => {
    setActiveSession(null);
  };

  return (
    <div className="min-h-screen text-[#475569]">
      {activeSession ? (
        <MainScreen
          session={activeSession.session}
          token={activeSession.token}
          onLogout={handleLogout}
        />
      ) : (
        <AuthScreen onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;
