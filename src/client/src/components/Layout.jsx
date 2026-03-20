import React from 'react';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-main">
        {children}
      </main>
    </div>
  );
}
