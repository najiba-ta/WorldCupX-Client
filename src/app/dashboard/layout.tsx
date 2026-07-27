'use client';

import React, { useState } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { Sidebar } from '../../components/dashboard/sidebar';
import { Navbar } from '../../components/dashboard/navbar';
import { Spinner } from '../../components/ui/spinner';

/**
 * Nested layout that wraps the client workspace screen.
 * Sidebar is shown ONLY for admin users; regular users get a clean full-width layout.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-muted">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs font-semibold tracking-wider uppercase text-muted">Initializing session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAdmin = user.role === 'admin';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar — only visible for admin */}
      {isAdmin && (
        <Sidebar className="shrink-0" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      {/* Main content column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} showMenuButton={isAdmin} />
        <main className="flex-1 overflow-y-auto bg-background/20 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
