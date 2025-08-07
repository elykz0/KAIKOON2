import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { GlobalContextProviders } from '../components/_globalContextProviders';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <BrowserRouter>
      <GlobalContextProviders>
        {children}
      </GlobalContextProviders>
    </BrowserRouter>
  );
}
