'use client';

import React from 'react';
import { useAuth } from '../../hooks/use-auth';
import { AdminDashboardView } from '../../components/dashboard/AdminDashboardView';
import { UserDashboardView } from '../../components/dashboard/UserDashboardView';
import { Spinner } from '../../components/ui/spinner';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center text-zinc-500">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs font-semibold tracking-wider uppercase text-zinc-500">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Switch between Admin Dashboard View and User Dashboard View based on role
  if (user?.role === 'admin') {
    return <AdminDashboardView />;
  }

  return <UserDashboardView />;
}
