import React from 'react';
import XMarkIcon from './icons/XMarkIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const SIZES = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    '3xl': 'sm:max-w-3xl',
    '4xl': 'sm:max-w-4xl',
    '5xl': 'sm:max-w-5xl',
    '6xl': 'sm:max-w-6xl',
    '7xl': 'sm:max-w-7xl',
    full: 'sm:max-w-full',
  };

  return (
    <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm transition-all duration-300 ease-in-out"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
    >
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
        <div 
            className={`relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full ${SIZES[size]} max-h-[92vh] flex flex-col border border-slate-200/50 animate-in fade-in zoom-in duration-300`}
        >
          <div className="bg-white px-8 py-6 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
            <h3 className="text-xl font-bold leading-6 text-slate-900 tracking-tight font-display" id="modal-title">
              {title}
            </h3>
             <button
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={onClose}
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="px-8 py-8 overflow-y-auto flex-grow custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
