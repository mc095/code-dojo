
'use client';

import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import type { UserRole, ViewOption } from '@/types';
import Header from '@/components/layout/Header';

interface AppStateContextType {
  currentUser: UserRole;
  setCurrentUser: (user: UserRole) => void;
  currentView: ViewOption;
  setCurrentView: (view: ViewOption) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}

export default function AppStateProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<UserRole>('user'); // Default to 'user'
  const [currentView, setCurrentView] = useState<ViewOption>('dashboard'); // Default view is now dashboard

  useEffect(() => {
    const storedUser = localStorage.getItem('algoRace_currentUser') as UserRole;
    if (storedUser && (storedUser === 'user' || storedUser === 'cousin')) {
      setCurrentUserState(storedUser);
    }
  }, []);

  const setCurrentUser = (user: UserRole) => {
    setCurrentUserState(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('algoRace_currentUser', user);
    }
  };

  return (
    <AppStateContext.Provider value={{ currentUser, setCurrentUser, currentView, setCurrentView }}>
      <Header />
      {children}
    </AppStateContext.Provider>
  );
}
