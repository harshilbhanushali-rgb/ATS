import React from 'react';

const GiftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-6.364-.386l1.591-1.591M3 12h2.25m.386-6.364l1.591 1.591M12 6.75a2.25 2.25 0 00-2.25 2.25v3a2.25 2.25 0 002.25 2.25h.516c.387 0 .748-.155.996-.431l1.442-1.442a2.25 2.25 0 00-.001-3.182L13.012 6.43A2.25 2.25 0 0012.515 6h-.001a2.25 2.25 0 00-2.25 2.25V12m2.25-3H12M12 9V6.75M12 12v3.75M4.5 12A7.5 7.5 0 0112 4.5a7.5 7.5 0 017.5 7.5A7.5 7.5 0 0112 19.5a7.5 7.5 0 01-7.5-7.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12c0 4.556-3.861 8.25-8.625 8.25S3.75 16.556 3.75 12H21zm-9 3.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>
);

export default GiftIcon;