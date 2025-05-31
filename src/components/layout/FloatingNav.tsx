
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
  link: ViewOption; // Changed from string to ViewOption
  icon?: JSX.Element;
}

export const FloatingNav = ({
  navItems,
  onNavItemClick,
  currentView,
  className,
}: {
  navItems: NavItem[];
  onNavItemClick: (link: ViewOption) => void; // Added callback
  currentView: ViewOption; // Added to track active view
  className?: string;
}) => {
  // const { scrollYProgress } = useScroll(); // Hiding on scroll removed
  // const [visible, setVisible] = useState(true); // Always visible

  // useMotionValueEvent(scrollYProgress, "change", (current) => {
  //   if (typeof current === "number") {
  //     let direction = current! - scrollYProgress.getPrevious()!;
  //     if (scrollYProgress.get() < 0.05) {
  //       setVisible(true); // Keep visible near top
  //     } else {
  //       if (direction < 0) {
  //         setVisible(true);
  //       } else {
  //         // setVisible(false); // Original hide logic
  //         setVisible(true); // Keep visible on scroll down as well
  //       }
  //     }
  //   }
  // });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Avoid rendering on server or before mount for animations
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 0,
          y: -20, // Start slightly above and faded
        }}
        animate={{
          y: 0, // Animate to final position
          opacity: 1,
        }}
        transition={{
          duration: 0.3, // Slower, smoother animation
          ease: "easeInOut",
        }}
        className={cn(
          'flex max-w-lg fixed top-4 inset-x-0 mx-auto border border-border/20 dark:border-white/[0.2] rounded-full bg-background/80 dark:bg-black/80 backdrop-blur-sm shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] px-6 py-3 items-center justify-center space-x-4 sm:space-x-4',
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
              {/* Display name below icon on small screens for better readability */}
              <span className="block sm:hidden text-xs mt-0.5">{navItem.name}</span>
            </button>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
};
