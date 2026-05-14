import React from 'react';

const LightBulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75A2.25 2.25 0 0114.25 9v1.083c0 .736.248 1.409.673 1.958a4.502 4.502 0 01-.487 5.438A4.5 4.5 0 0112 18.75a4.5 4.5 0 01-2.436-1.27c-.4-.441-.53-.997-.487-1.558a4.502 4.502 0 01.673-1.958V9A2.25 2.25 0 0112 6.75zM12 9V4.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12h7.5" />
  </svg>
);

export default LightBulbIcon;
