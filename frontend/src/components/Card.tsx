import React from 'react';

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
    <div className={`bg-white shadow-soft rounded-2xl overflow-hidden border border-slate-100/80 transition-all duration-300 hover:shadow-lg ${className}`}>
      {title && (
        <div className={`px-6 py-5 border-b border-slate-100 flex justify-between items-center ${titleClassName}`}>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight font-display">{title}</h3>
          {titleRightElement && <div className="flex items-center">{titleRightElement}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
