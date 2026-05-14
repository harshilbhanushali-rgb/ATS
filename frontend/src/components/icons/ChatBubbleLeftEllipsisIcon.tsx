
import React from 'react';

const ChatBubbleLeftEllipsisIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-3.861 8.25-8.625 8.25S3.75 16.556 3.75 12H21zM5.25 7.525A6.75 6.75 0 0112 3.75a6.75 6.75 0 016.75 3.775" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0v6.75a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18.75V12m18 0c0 4.556-3.861 8.25-8.625 8.25S3.75 16.556 3.75 12" /> { /* Adjusted to properly represent a chat bubble */ }
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.875 21L9.75 18h4.5l1.875 3M5.25 7.5A6.75 6.75 0 0112 3.75m6.75 3.75A6.75 6.75 0 0112 18.75M3.75 12H21" visibility="hidden" /> { /* simplified chat path instead of combining multiple complex ones */}
    <path d="M17.25 12.75H6.75C6.33579 12.75 6 12.4142 6 12C6 11.5858 6.33579 11.25 6.75 11.25H17.25C17.6642 11.25 18 11.5858 18 12C18 12.4142 17.6642 12.75 17.25 12.75Z" fill="currentColor" visibility="hidden"/>
    <path d="M18.75 9.75H5.25C4.83579 9.75 4.5 9.41421 4.5 9C4.5 8.58579 4.83579 8.25 5.25 8.25H18.75C19.1642 8.25 19.5 8.58579 19.5 9C19.5 9.41421 19.1642 9.75 18.75 9.75Z" fill="currentColor" visibility="hidden"/>

    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 12H21m0 0l-1.007-1.007M21 12l-1.007 1.007M21 12H3.75m0 0L2.743 10.993M3.75 12l1.007 1.007M3.75 12h16.5M7.875 21L9.75 18h4.5l1.875 3M5.25 7.5A6.75 6.75 0 0112 3.75m6.75 3.75A6.75 6.75 0 0112 18.75m-6.75-3.75h.008v.008H5.25v-.008zm4.5 0h.008v.008H9.75v-.008zm4.5 0h.008v.008H14.25v-.008zM5.625 15.375a1.875 1.875 0 100-3.75 1.875 1.875 0 000 3.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a1.125 1.125 0 100-2.25 1.125 1.125 0 000 2.25zM12 12h.008v.008H12V12zm0 0L8.25 9.75M12 12l3.75-2.25M12 12l-3.75 2.25m3.75-2.25L15.75 12" visibility="hidden"/>

    {/* Using simpler path for main bubble */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-4.5 3H15m2.25-6.75h.75a1.875 1.875 0 011.875 1.875v.188a1.875 1.875 0 01-1.875 1.875h-.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 12.75H14.25" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h.01M12 8.25h.01M16.5 8.25h.01" /> { /* Ellipsis dots */ }

  </svg>
);

export default ChatBubbleLeftEllipsisIcon;
