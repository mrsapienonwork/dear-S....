import React, { createContext, useContext, useState } from 'react';

type ViewMode = 'start' | 'setup' | 'auth' | 'app';

interface AccessContextType {
  currentView: ViewMode;
  isSessionUnlocked: boolean;
  pinEnabled: boolean;
  setupComplete: boolean;
  pinExists: boolean;
  startSetup: () => void;
  goToStart: () => void;
  goToAuth: () => void;
  completePinSetup: (pin: string) => void;
  completeRecoverySetup: (question: string, answer: string) => void;
  unlockSession: () => void;
  lockAppNow: () => void;
  removePinProtection: () => void;
  changePin: (newPin: string) => void;
  changeRecovery: (question: string, answer: string) => void;
}

const AccessContext = createContext<AccessContextType | undefined>(undefined);

export const AccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSessionUnlocked, setIsSessionUnlocked] = useState(
    sessionStorage.getItem('dearS_unlocked') === 'true'
  );
  
  const [pinEnabled, setPinEnabled] = useState(
    localStorage.getItem('dearS_pinEnabled') === 'true'
  );
  
  const [setupComplete, setSetupComplete] = useState(
    localStorage.getItem('dearS_setupComplete') === 'true'
  );

  const pinExists = !!localStorage.getItem('dearS_pin');

  // Determine initial view based on state
  const getInitialView = (): ViewMode => {
    return 'start';
  };

  const [currentView, setCurrentView] = useState<ViewMode>(getInitialView());

  const startSetup = () => setCurrentView('setup');
  
  const goToStart = () => setCurrentView('start');
  
  const goToAuth = () => {
    if (pinEnabled && setupComplete && pinExists) {
      setCurrentView('auth');
    } else {
      setCurrentView('setup');
    }
  };

  const completePinSetup = (pin: string) => {
    localStorage.setItem('dearS_pin', pin);
    localStorage.setItem('dearS_pinEnabled', 'true');
    setPinEnabled(true);
  };

  const completeRecoverySetup = (question: string, answer: string) => {
    localStorage.setItem('dearS_recoveryQuestion', question.trim());
    localStorage.setItem('dearS_recoveryAnswer', answer.trim());
    localStorage.setItem('dearS_setupComplete', 'true');
    sessionStorage.setItem('dearS_unlocked', 'true');
    
    setSetupComplete(true);
    setIsSessionUnlocked(true);
    setCurrentView('app');
  };

  const unlockSession = () => {
    sessionStorage.setItem('dearS_unlocked', 'true');
    setIsSessionUnlocked(true);
    setCurrentView('app');
  };

  const lockAppNow = () => {
    sessionStorage.removeItem('dearS_unlocked');
    setIsSessionUnlocked(false);
    setCurrentView('start');
  };

  const removePinProtection = () => {
    localStorage.removeItem('dearS_pin');
    localStorage.removeItem('dearS_pinEnabled');
    localStorage.removeItem('dearS_setupComplete');
    localStorage.removeItem('dearS_recoveryQuestion');
    localStorage.removeItem('dearS_recoveryAnswer');
    sessionStorage.removeItem('dearS_unlocked');
    
    setPinEnabled(false);
    setSetupComplete(false);
    setIsSessionUnlocked(false);
    setCurrentView('start');
  };

  const changePin = (newPin: string) => {
    localStorage.setItem('dearS_pin', newPin);
  };

  const changeRecovery = (question: string, answer: string) => {
    localStorage.setItem('dearS_recoveryQuestion', question.trim());
    localStorage.setItem('dearS_recoveryAnswer', answer.trim());
  };

  return (
    <AccessContext.Provider value={{
      currentView, isSessionUnlocked, pinEnabled, setupComplete, pinExists,
      startSetup, goToStart, goToAuth, completePinSetup, completeRecoverySetup,
      unlockSession, lockAppNow, removePinProtection, changePin, changeRecovery
    }}>
      {children}
    </AccessContext.Provider>
  );
};

export const useAccess = () => {
  const context = useContext(AccessContext);
  if (!context) throw new Error("useAccess must be used within AccessProvider");
  return context;
};
