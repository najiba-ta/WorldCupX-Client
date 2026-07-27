'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  User, Mail, Calendar, Shield, LayoutDashboard, Trophy, 
  Settings, Award, Clock, ArrowRight, ShieldCheck, Activity, Heart
} from 'lucide-react';
import { useAuth } from '../../hooks/use-auth';
import { api } from '../../services/api';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { Spinner } from '../../components/ui/spinner';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();

  // Fetch favorite teams
  const { data: favoritesRes, isLoading: favoritesLoading } = useQuery<any>({
    queryKey: ['userFavorites'],
    queryFn: async () => {
      return api.get('/teams/favorites');
    },
    enabled: !!user,
  });

  // Fetch predictions count
  const { data: predictionsRes, isLoading: predictionsLoading } = useQuery<any>({
    queryKey: ['userPredictions'],
    queryFn: async () => {
      return api.get('/predictions/history');
    },
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white dark:bg-[#070e0a] text-zinc-900 dark:text-zinc-150">
        <PublicNavbar />
        <main className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
        </main>
        <PublicFooter />
      </div>
    );
  }

  // Redirect to login if guest attempts to access profile
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-white dark:bg-[#070e0a] text-zinc-900 dark:text-zinc-100">
        <PublicNavbar />
        <main className="flex-1 max-w-md mx-auto px-6 py-24 text-center space-y-6">
          <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
            <Shield className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Access Denied</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Please sign in to view your analyst profile details and active prediction logs.
            </p>
          </div>
          <Link href="/login">
            <button className="h-10 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold cursor-pointer">
              Go to Sign In
            </button>
          </Link>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const favoritesCount = favoritesRes?.favorites?.length ?? 0;
  const predictionsCount = predictionsRes?.predictions?.length ?? 0;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#070e0a] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <PublicNavbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 md:px-8 w-full space-y-8 animate-in fade-in duration-300">
        
        {/* Profile Card Header */}
        <section className="rounded-2xl border border-zinc-200 dark:border-emerald-950 bg-white dark:bg-[#0b120c] p-8 relative overflow-hidden shadow-md">
          {/* Decorative glowing blobs */}
          <div className="absolute top-1/2 right-10 -translate-y-1/2 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            {/* User Profile Image */}
            <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-green-600 p-1 shrink-0 shadow-lg overflow-hidden flex items-center justify-center border border-emerald-900/35">
              {user.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={user.image} alt={user.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                <div className="h-full w-full rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center font-extrabold text-3xl text-white uppercase select-none">
                  {user.name?.slice(0, 2).toUpperCase() || 'WM'}
                </div>
              )}
            </div>

            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Verified Analyst</span>
                </span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/5 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5">
                  <Award className="h-3.5 w-3.5" />
                  <span>Premium Access</span>
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-white truncate">{user.name}</h2>
              <p className="text-xs text-zinc-550 truncate flex items-center justify-center sm:justify-start gap-1.5 font-semibold">
                <Mail className="h-3.5 w-3.5" />
                <span>{user.email}</span>
              </p>
            </div>

            <Link href="/dashboard">
              <button className="h-10 px-5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:opacity-90 flex items-center gap-1.5 cursor-pointer shadow-md transition-all">
                <span>Dashboard Workspace</span>
                <LayoutDashboard className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </section>

        {/* Detailed Stats and Quotas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Favorites */}
          <div className="bg-[#0b120c] border border-emerald-950 p-6 rounded-2xl space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-zinc-500">
              <Heart className="h-4.5 w-4.5 text-rose-500 fill-current" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 block">Favorite Squads</span>
            </div>
            <div className="text-2xl font-extrabold text-white">
              {favoritesLoading ? '...' : `${favoritesCount} Teams`}
            </div>
            <p className="text-[10px] text-zinc-550 font-semibold">
              Teams marked as favorites in Explorer.
            </p>
          </div>

          {/* Predictions quota */}
          <div className="bg-[#0b120c] border border-emerald-950 p-6 rounded-2xl space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-zinc-500">
              <Activity className="h-4.5 w-4.5 text-teal-400" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 block">Simulations Logged</span>
            </div>
            <div className="text-2xl font-extrabold text-white">
              {predictionsLoading ? '...' : `${predictionsCount} Predictions`}
            </div>
            <p className="text-[10px] text-zinc-550 font-semibold">
              Forecast simulation reports saved.
            </p>
          </div>

          {/* Member duration */}
          <div className="bg-[#0b120c] border border-emerald-950 p-6 rounded-2xl space-y-2 shadow-sm">
            <div className="flex items-center gap-2 text-zinc-500">
              <Calendar className="h-4.5 w-4.5 text-emerald-450" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 block">Account Status</span>
            </div>
            <div className="text-2xl font-extrabold text-emerald-450">
              Active Analyst
            </div>
            <p className="text-[10px] text-zinc-550 font-semibold">
              Subscription verified under Gemini Pro API.
            </p>
          </div>
        </div>

        {/* Profile Settings Information list */}
        <section className="rounded-2xl border border-emerald-950 bg-[#0b120c] p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-emerald-950/40 pb-2">
            <Settings className="h-4.5 w-4.5 text-emerald-400" />
            <span>Account Details & Workspace parameters</span>
          </h3>

          <div className="rounded-xl border border-emerald-950/60 overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-950 border-b border-emerald-950 text-zinc-400 font-bold">
                  <th className="p-3">Attribute</th>
                  <th className="p-3">Detail Value</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400 divide-y divide-emerald-950/40 font-medium">
                <tr>
                  <td className="p-3 text-zinc-500 font-bold uppercase text-[10px]">Full Name</td>
                  <td className="p-3 text-white font-bold">{user.name}</td>
                </tr>
                <tr>
                  <td className="p-3 text-zinc-500 font-bold uppercase text-[10px]">Primary Email</td>
                  <td className="p-3 text-white font-bold">{user.email}</td>
                </tr>
                <tr>
                  <td className="p-3 text-zinc-500 font-bold uppercase text-[10px]">Analyst Access Level</td>
                  <td className="p-3 text-emerald-450 font-bold flex items-center gap-1">
                    <Trophy className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Premium Sports Analyst</span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3 text-zinc-500 font-bold uppercase text-[10px]">Active Hub</td>
                  <td className="p-3 text-white font-bold">WorldMind AI Tactical Cloud Platform</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
