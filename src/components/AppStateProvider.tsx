'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import type { UserProfile, ViewOption } from '@/types';
import FloatingNav, { type NavItem } from '@/components/layout/FloatingNav';
import { LayoutDashboard, LineChart } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface AppState {
  currentUser: string | null;
  currentView: ViewOption;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  setCurrentView: (view: ViewOption) => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewOption>('dashboard');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is admin
        const isAdmin = user.email === 'ganeshvathumilli@gmail.com';
        
        // Get or create user profile
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          // New user - create profile with email name
          const emailName = user.email?.split('@')[0] || 'User';
          await setDoc(userRef, {
            email: user.email,
            displayName: emailName,
            role: isAdmin ? 'admin' : 'participant',
            createdAt: new Date().toISOString(),
            joinedAt: new Date().toISOString(),
            settings: {
              theme: 'light',
              notifications: true
            }
          });
        }

        setCurrentUser(user.uid);
        setIsAdmin(isAdmin);
        setUserProfile({
          uid: user.uid,
          email: user.email || '',
          displayName: userDoc.exists() ? userDoc.data().displayName : user.email?.split('@')[0] || 'User',
          role: isAdmin ? 'admin' : 'participant',
          joinedAt: userDoc.exists() ? userDoc.data().joinedAt : new Date().toISOString(),
          settings: userDoc.exists() ? userDoc.data().settings : {
            theme: 'light',
            notifications: true
          }
        });
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    currentView,
    userProfile,
    isAdmin,
    setCurrentView,
  };

  const navItems: NavItem[] = [
    { name: 'Dashboard', link: 'dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { name: 'Progress', link: 'chart', icon: <LineChart className="h-4 w-4" /> },
  ];

  return (
    <AppStateContext.Provider value={value}>
      {pathname !== '/landing' && (
        <FloatingNav 
          navItems={navItems} 
          onNavItemClick={(link: string) => setCurrentView(link as ViewOption)}
          currentView={currentView}
        />
      )}
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
