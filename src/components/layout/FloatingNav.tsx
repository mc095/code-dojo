'use client';
import React, { useState, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
} from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ViewOption } from '@/types';
import { auth, provider } from '@/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

export interface NavItem {
  name: string;
  link: ViewOption;
  // Icon is no longer part of the NavItem type for this component
}

export const FloatingNav = ({
  navItems,
  onNavItemClick,
  currentView,
  className,
}: {
  navItems: NavItem[];
  onNavItemClick: (link: ViewOption) => void;
  currentView: ViewOption;
  className?: string;
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setIsMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    await signInWithPopup(auth, provider);
  };
  const handleSignOut = async () => {
    await signOut(auth);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 0,
          y: -20, // Start slightly above
        }}
        animate={{
          y: 0,   // Animate to final position
          opacity: 1,
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className={cn(
          'flex max-w-2xl fixed top-4 inset-x-0 mx-auto border border-border/30 dark:border-white/[0.18] rounded-lg bg-background/85 dark:bg-black/85 backdrop-blur-md shadow z-[5000] px-6 py-2 items-center justify-center space-x-4',
          className
        )}
      >
        {navItems.map((navItem, idx) => {
          const isActive = navItem.link === currentView;
          return (
            <button
              key={`link=${idx}`}
              onClick={() => onNavItemClick(navItem.link)}
              className={cn(
                'relative items-center flex flex-col sm:flex-row sm:space-x-1 px-3 py-1 rounded-md transition-all duration-200 ease-in-out',
                'text-sm font-medium',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm scale-105'
                  : 'text-foreground/80 hover:text-foreground hover:bg-muted/60 dark:hover:bg-muted/40'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="block text-sm sm:text-sm tracking-wide">{navItem.name}</span>
            </button>
          );
        })}
        <div className="flex items-center space-x-2 ml-4">
          {user ? (
            <>
              {user.photoURL && (
                <img src={user.photoURL} alt="avatar" className="w-6 h-6 rounded-full" />
              )}
              <span className="text-xs font-semibold text-foreground/80 max-w-[100px] truncate">{user.displayName || user.email}</span>
              <button onClick={handleSignOut} className="ml-2 px-2 py-1 text-xs rounded bg-muted hover:bg-muted/70 transition">Sign out</button>
            </>
          ) : (
            <button onClick={handleSignIn} className="ml-2 px-5 py-2 text-base rounded bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/80 transition">Sign in</button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
