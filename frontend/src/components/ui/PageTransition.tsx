import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  motionKey: string;
}

const variants = {
  initial: { opacity: 0, y: 14, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)', transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export const PageTransition: React.FC<PageTransitionProps> = ({ children, motionKey }) => (
  <motion.div key={motionKey} variants={variants} initial="initial" animate="animate" exit="exit">
    {children}
  </motion.div>
);

export { AnimatePresence };
