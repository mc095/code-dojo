
'use client';

import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import type { UserRole } from '@/types';
import Header from '@/components/layout/Header';

interface AppStateContextType {
  currentUser: UserRole;
  setCurrentUser: (user: UserRole) => void;
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

  useEffect(() => {
    // This effect runs on the client after hydration
    // No need to check for `typeof window !== 'undefined'` here as useEffect only runs client-side
    const storedUser = localStorage.getItem('algoRace_currentUser') as UserRole;
    if (storedUser && (storedUser === 'user' || storedUser === 'cousin')) {
      setCurrentUserState(storedUser);
    }
  }, []); // Empty dependency array: runs once on mount (client-side)

  const setCurrentUser = (user: UserRole) => {
    setCurrentUserState(user);
    // localStorage is a browser API, ensure this only runs client-side for updates
    if (typeof window !== 'undefined') { 
      localStorage.setItem('algoRace_currentUser', user);
    }
  };
  
  // Always render the provider. Header and children will receive context.
  // The `currentUser` state will be 'user' during SSR and initial client render,
  // then potentially update after the useEffect runs.
  return (
    <AppStateContext.Provider value={{ currentUser, setCurrentUser }}>
      <Header currentUser={currentUser} setCurrentUser={setCurrentUser} />
      {children}
    </AppStateContext.Provider>
  );
}
