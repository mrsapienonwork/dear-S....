import { Variants } from 'motion/react';

// Centralized ease curve for cinematic, disciplined feel
export const SYSTEM_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]; // Apple-like smooth ease-out

export const pageTransition: Variants = {
  initial: { opacity: 0, scale: 0.99, y: 15 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: SYSTEM_EASE, staggerChildren: 0.05 } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.99, 
    y: -5, 
    transition: { duration: 0.3, ease: SYSTEM_EASE } 
  }
};

export const staggerContainer: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: SYSTEM_EASE } }
};

export const slideUpItem: Variants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: SYSTEM_EASE } },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.3, ease: SYSTEM_EASE } }
};

export const scaleUpItem: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: SYSTEM_EASE } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3, ease: SYSTEM_EASE } }
};

// Subtle hover state for glass cards
export const glassCardHover = {
  scale: 1.01,
  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
  backgroundColor: 'rgba(255,255,255,0.08)',
  transition: { duration: 0.3, ease: SYSTEM_EASE }
};

// Button press interaction
export const buttonTap = {
  scale: 0.97,
  transition: { duration: 0.1, ease: 'easeOut' }
};

export const buttonHover = {
  scale: 1.02,
  transition: { duration: 0.2, ease: SYSTEM_EASE }
};
