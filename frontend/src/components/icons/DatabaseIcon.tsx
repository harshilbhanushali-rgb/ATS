
import React from 'react';

const DatabaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 00-2.25 2.25v2.25A2.25 2.25 0 019 19.5h-2.25A2.25 2.25 0 014.5 15V6zM3.75 15V6m0 0v2.25m0-2.25h12.75m0 0V15m0 0v2.25m0-2.25H9.75m1.5-3V9m0 0H9.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default DatabaseIcon;
