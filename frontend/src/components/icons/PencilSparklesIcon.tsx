import React from 'react';

const PencilSparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    {/* Pencil part */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    {/* Sparkles part - smaller and positioned around the pencil tip area */}
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.25 2.25 1.125 1.125m-2.25-1.125L12 3.375M14.25 2.25 15.375 1.125m-1.125 1.125L13.125 1.125" /> {/* Small sparkles around 16.862 4.487 area */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 1.5A1.5 1.5 0 0 1 16.5 3v0A1.5 1.5 0 0 1 15 4.5v0A1.5 1.5 0 0 1 13.5 3v0A1.5 1.5 0 0 1 15 1.5z" transform="translate(1 0.5) scale(0.6)" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 6A1.5 1.5 0 0 1 21 7.5v0A1.5 1.5 0 0 1 19.5 9v0A1.5 1.5 0 0 1 18 7.5v0A1.5 1.5 0 0 1 19.5 6z" transform="translate(-1.5 0) scale(0.5)" />
  </svg>
);

export default PencilSparklesIcon;
