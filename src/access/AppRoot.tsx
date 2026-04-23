import React from 'react';
import { useAccess } from './AccessContext';
import { StartPage } from './StartPage';
import { SetupFlow } from './SetupFlow';
import { LockScreen } from './LockScreen';

export function AppRoot({ children }: { children: React.ReactNode }) {
  const { currentView } = useAccess();
  
  const isUnlocked = sessionStorage.getItem('dearS_unlocked') === 'true';

  if (currentView === "start") return <StartPage />;
  else if (currentView === "auth") return <LockScreen />;
  else if (currentView === "setup") return <SetupFlow />;
  else if (currentView === "app" && isUnlocked) return <>{children}</>;
  
  return <StartPage />;
}
