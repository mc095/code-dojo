
'use client';
import React, { useState, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ViewOption } from '@/types';

export interface NavItem {
  name: string;
  link: ViewOption; // Use ViewOption for type safety
  icon?: JSX.Element;
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
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true); // Default to true to be visible initially near top

  useEffect(() => {
    // Make it visible if scrollY is very low (near the top of the page)
    if (scrollYProgress.get() < 0.05) {
      setVisible(true);
    }
  }, [scrollYProgress]);

  useMotionValueEvent(scrollYProgress, 'change', (current) => {
    if (typeof current === 'number') {
      const previous = scrollYProgress.getPrevious();
      // Ensure previous is also a number before calculating direction
      const direction = typeof previous === 'number' ? current - previous : 0;

      if (current < 0.05) { // Always show if near top
        setVisible(true);
      } else {
        if (direction < 0) { // Scrolling up
          setVisible(true);
        } else { // Scrolling down
          setVisible(false);
        }
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          'flex max-w-fit fixed top-6 inset-x-0 mx-auto border border-border/20 dark:border-white/[0.2] rounded-full bg-background/80 dark:bg-black/80 backdrop-blur-sm shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] px-4 py-2 items-center justify-center space-x-2 sm:space-x-3',
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
              {navItem.icon && (
                <span className="block h-5 w-5 sm:h-4 sm:w-4">{navItem.icon}</span>
              )}
              <span className="hidden sm:block">{navItem.name}</span>
              <span className="block sm:hidden text-xs mt-0.5">{navItem.name}</span>
            </button>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
};
