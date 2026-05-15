import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
  titleRightElement?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children, className = '', titleClassName = '', bodyClassName = '', titleRightElement }) => {
  return (
    <motion.div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(37,99,235,0.10), 0 3px 8px rgba(15,23,42,0.06)' }}
    >
      {title && (
        <div className={`px-6 py-4 border-b border-slate-100 flex justify-between items-center ${titleClassName}`}>
          <h3 className="text-base font-bold text-slate-800 tracking-tight font-display">{title}</h3>
          {titleRightElement && <div className="flex items-center">{titleRightElement}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>
        {children}
      </div>
    </motion.div>
  );
};

export default Card;
