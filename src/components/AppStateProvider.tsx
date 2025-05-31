
'use client';

import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import type { UserRole, ViewOption } from '@/types';
import { FloatingNav, type NavItem } from '@/components/layout/FloatingNav';
import { LayoutDashboard, LineChart } from 'lucide-react';


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
  const [currentUser, setCurrentUserState] = useState<UserRole>('Ganesh'); // Default to Ganesh
  const [currentView, setCurrentView] = useState<ViewOption>('dashboard');

  useEffect(() => {
    const storedUser = localStorage.getItem('algoRace_currentUser') as UserRole;
    if (storedUser && (storedUser === 'Ganesh' || storedUser === 'Vaishnavi')) {
      setCurrentUserState(storedUser);
    }
  }, []);

  const setCurrentUser = (user: UserRole) => {
    setCurrentUserState(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('algoRace_currentUser', user);
    }
  };

  const navItems: NavItem[] = [
    { name: 'Dashboard', link: 'dashboard', icon: <LayoutDashboard /> },
    { name: 'Progress', link: 'chart', icon: <LineChart /> },
  ];

  return (
    <AppStateContext.Provider value={{ currentUser, setCurrentUser, currentView, setCurrentView }}>
      <FloatingNav 
        navItems={navItems} 
        onNavItemClick={(link) => setCurrentView(link)}
        currentView={currentView}
      />
      {children}
    </AppStateContext.Provider>
  );
}
