'use client';

import Header from './Header';
import Footer from './Footer';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-sand-50 dark:bg-sand-950">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
