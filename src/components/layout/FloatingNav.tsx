'use client';
import React, { useState, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
} from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ViewOption } from '@/types';
import { auth, provider } from '@/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export interface NavItem {
  name: string;
  link: string;
  icon: React.ReactNode;
}

interface FloatingNavProps {
  navItems: NavItem[];
  onNavItemClick: (link: string) => void;
  currentView: string;
}

export default function FloatingNav({ navItems, onNavItemClick, currentView }: FloatingNavProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/landing');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (pathname === '/landing') return null;

  return (
    <nav
      className={cn(
        'fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300',
        isVisible ? 'translate-y-0' : '-translate-y-32'
      )}
    >
      <div className="bg-background/80 backdrop-blur-lg border rounded-full shadow-lg p-2 flex items-center space-x-2">
        {navItems.map((item) => (
          <Button
            key={item.link}
            variant={currentView === item.link ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onNavItemClick(item.link)}
            className="rounded-full"
          >
            {item.icon}
            <span className="ml-2">{item.name}</span>
          </Button>
        ))}
        {user && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="rounded-full"
          >
            <img
              src={user.photoURL || '/default-avatar.png'}
              alt={user.displayName || 'User'}
              className="w-6 h-6 rounded-full"
            />
            <span className="ml-2">{user.displayName || user.email}</span>
          </Button>
        )}
      </div>
    </nav>
  );
}
