import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X as XMarkIcon } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
}

const SIZES: Record<string, string> = {
  sm: 'sm:max-w-sm',   md: 'sm:max-w-md',   lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',   '2xl': 'sm:max-w-2xl', '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl', '5xl': 'sm:max-w-5xl', '6xl': 'sm:max-w-6xl',
  '7xl': 'sm:max-w-7xl', full: 'sm:max-w-full',
};

const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
  exit:    { opacity: 0, transition: { duration: 0.15, delay: 0.04 } },
};

const panelVariants = {
  hidden:  { opacity: 0, scale: 0.96, y: 10 },
  visible: { opacity: 1, scale: 1,    y: 0,  transition: { type: 'spring' as const, stiffness: 340, damping: 30, delay: 0.03 } },
  exit:    { opacity: 0, scale: 0.97, y: 6,  transition: { duration: 0.14 } },
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        key="modal-backdrop"
        className="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
          <motion.div
            className={`relative overflow-hidden rounded-2xl bg-white text-left shadow-2xl shadow-slate-900/15 sm:my-8 sm:w-full ${SIZES[size]} max-h-[92vh] flex flex-col border border-slate-200`}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Modal header */}
            <div className="bg-white px-6 py-5 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-lg font-bold leading-6 text-slate-900 tracking-tight font-display" id="modal-title">
                {title}
              </h3>
              <motion.button
                type="button"
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={onClose}
                aria-label="Close"
                whileHover={{ scale: 1.08, rotate: 90 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <XMarkIcon className="w-5 h-5" />
              </motion.button>
            </div>
            <div className="px-6 py-6 overflow-y-auto flex-grow custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default Modal;
