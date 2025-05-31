'use client';

import { useState, useEffect, createContext, useContext, type ReactNode } from 'react';
import type { UserRole, ViewOption } from '@/types';
import { FloatingNav, type NavItem } from '@/components/layout/FloatingNav';
import { LayoutDashboard, LineChart } from 'lucide-react';
import { usePathname } from 'next/navigation';


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
  const [currentUser, setCurrentUserState] = useState<UserRole>('Koala'); // Default to Koala
  const [currentView, setCurrentView] = useState<ViewOption>('dashboard');
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('algoRace_currentUser') as UserRole;
    if (storedUser && (storedUser === 'Koala' || storedUser === 'Alpaca')) {
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
      {pathname !== '/landing' && (
        <FloatingNav 
          navItems={navItems} 
          onNavItemClick={(link) => setCurrentView(link)}
          currentView={currentView}
        />
      )}
      {children}
    </AppStateContext.Provider>
  );
}
