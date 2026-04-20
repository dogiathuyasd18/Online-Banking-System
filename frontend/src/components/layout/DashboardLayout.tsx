import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface DashboardLayoutProps {
  children: ReactNode;
  email: string;
  onLogout: () => void;
}

export function DashboardLayout({ children, email, onLogout }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar onLogout={onLogout} />
      <div className="lg:pl-64">
        <Topbar email={email} />
        <main className="min-h-[calc(100vh-64px)] px-6 py-8 md:px-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
