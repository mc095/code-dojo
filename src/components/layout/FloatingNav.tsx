
'use client';
import React, { useState, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
} from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ViewOption } from '@/types';

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

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
          'flex max-w-xs fixed top-4 inset-x-0 mx-auto border border-border/20 dark:border-white/[0.2] rounded-full bg-background/80 dark:bg-black/80 backdrop-blur-sm shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] px-4 py-2 items-center justify-center space-x-2 sm:space-x-3', // Reduced space-x for tighter packing
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
                'relative items-center flex flex-col sm:flex-row sm:space-x-1 p-1.5 sm:px-3 sm:py-1.5 rounded-full transition-colors duration-200 ease-in-out',
                'text-sm font-medium',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground/70 hover:text-foreground hover:bg-muted/50 dark:hover:bg-muted/30'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Icon rendering removed */}
              <span className="block text-xs sm:text-sm">{navItem.name}</span>
            </button>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
};
