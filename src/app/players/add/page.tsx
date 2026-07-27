'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/use-auth';
import Link from 'next/link';
import { 
  UserPlus, ArrowLeft, CheckCircle2, AlertCircle, 
  Trophy, Award, Shield, User, Flame
} from 'lucide-react';
import { api } from '../../../services/api';
import { PublicNavbar } from '../../../components/public/PublicNavbar';
import { PublicFooter } from '../../../components/public/PublicFooter';
import { Spinner } from '../../../components/ui/spinner';

export default function AddPlayerPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    currentClub: '',
    nationalTeam: '',
    position: 'Forward',
    jerseyNumber: 10,
    age: 25,
    matchesPlayed: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    foulsCommitted: 0,
    personalAchievements: '',
    nationalAchievements: '',
    goodRecords: '',
    badRecords: '',
    imageUrl: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingStatus, setPendingStatus] = useState(false);
  const { user } = useAuth();

  const createPlayerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        personalAchievements: data.personalAchievements.split(',').map((s) => s.trim()).filter(Boolean),
        nationalAchievements: data.nationalAchievements.split(',').map((s) => s.trim()).filter(Boolean),
        goodRecords: data.goodRecords.split(',').map((s) => s.trim()).filter(Boolean),
        badRecords: data.badRecords.split(',').map((s) => s.trim()).filter(Boolean),
      };
      return api.post<any>('/players', payload);
    },
    onSuccess: (data: any) => {
      const isPending = data.player?.status === 'pending' || user?.role !== 'admin';
      setPendingStatus(isPending);
      setSuccessMessage(isPending ? 'pending' : 'published');
      queryClient.invalidateQueries({ queryKey: ['explorePlayers'] });
      queryClient.invalidateQueries({ queryKey: ['adminPending'] });
      setTimeout(() => {
        router.push(user?.role === 'admin' ? '/players' : '/dashboard');
      }, 3500);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to add player. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.name.trim() || !formData.currentClub.trim() || !formData.nationalTeam.trim()) {
      setErrorMessage('Name, Current Club, and National Team are required.');
      return;
    }

    createPlayerMutation.mutate(formData);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#070e0a] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <PublicNavbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10 md:px-8 space-y-8">
        
        {/* Navigation back link */}
        <div>
          <Link href="/players" className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-emerald-500 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Players Directory</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="space-y-2 border-b border-zinc-200 dark:border-emerald-950/60 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <UserPlus className="h-3.5 w-3.5" />
            <span>Player Registration</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Add New Player Profile</h1>
          <p className="text-xs text-zinc-500 font-medium">Add a current top football star with achievements, records, and stats to WorldCupX.</p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-zinc-50 dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950/60 p-6 md:p-8 rounded-3xl space-y-6 shadow-sm">
          
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className={`flex items-start gap-3 rounded-2xl p-5 text-xs border ${pendingStatus ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'}`}>
              {pendingStatus ? <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" /> : <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />}
              <div className="space-y-1">
                <span className="font-extrabold text-sm block">
                  {pendingStatus ? '⏳ Your request is pending admin approval!' : '✅ Player Published Live!'}
                </span>
                <p className="leading-relaxed font-medium">
                  {pendingStatus
                    ? 'Your player submission has been saved. Once an admin reviews and approves your request, it will be published live on WorldCupX for everyone to see.'
                    : 'Player profile has been published live to the WorldCupX Top Players directory.'}
                </p>
                <span className="text-[10px] font-bold opacity-70 block pt-1">Redirecting you to dashboard...</span>
              </div>
            </div>
          )}

          {/* Section 1: Basic Bio */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-emerald-950/60 pb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-500" />
              <span>Basic Bio & Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Player Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Lionel Messi"
                  className="w-full h-11 px-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Current Club *</label>
                <input
                  type="text"
                  required
                  value={formData.currentClub}
                  onChange={(e) => setFormData({ ...formData, currentClub: e.target.value })}
                  placeholder="e.g. Real Madrid CF"
                  className="w-full h-11 px-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">National Team *</label>
                <input
                  type="text"
                  required
                  value={formData.nationalTeam}
                  onChange={(e) => setFormData({ ...formData, nationalTeam: e.target.value })}
                  placeholder="e.g. Argentina"
                  className="w-full h-11 px-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Position *</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full h-11 px-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 rounded-xl text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Forward">Forward</option>
                  <option value="Midfielder">Midfielder</option>
                  <option value="Defender">Defender</option>
                  <option value="Goalkeeper">Goalkeeper</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Jersey Number</label>
                <input
                  type="number"
                  value={formData.jerseyNumber}
                  onChange={(e) => setFormData({ ...formData, jerseyNumber: Number(e.target.value) })}
                  className="w-full h-11 px-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full h-11 px-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Photo Image URL</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full h-11 px-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Section 2: Career Stats */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-emerald-950/60 pb-2 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-emerald-500" />
              <span>Career Performance Statistics</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Matches</label>
                <input
                  type="number"
                  value={formData.matchesPlayed}
                  onChange={(e) => setFormData({ ...formData, matchesPlayed: Number(e.target.value) })}
                  className="w-full h-10 px-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Goals</label>
                <input
                  type="number"
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: Number(e.target.value) })}
                  className="w-full h-10 px-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Assists</label>
                <input
                  type="number"
                  value={formData.assists}
                  onChange={(e) => setFormData({ ...formData, assists: Number(e.target.value) })}
                  className="w-full h-10 px-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Yellows</label>
                <input
                  type="number"
                  value={formData.yellowCards}
                  onChange={(e) => setFormData({ ...formData, yellowCards: Number(e.target.value) })}
                  className="w-full h-10 px-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Reds</label>
                <input
                  type="number"
                  value={formData.redCards}
                  onChange={(e) => setFormData({ ...formData, redCards: Number(e.target.value) })}
                  className="w-full h-10 px-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Fouls</label>
                <input
                  type="number"
                  value={formData.foulsCommitted}
                  onChange={(e) => setFormData({ ...formData, foulsCommitted: Number(e.target.value) })}
                  className="w-full h-10 px-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Achievements & Records */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-emerald-950/60 pb-2 flex items-center gap-2">
              <Award className="h-4 w-4 text-emerald-500" />
              <span>Achievements & Career Records (Comma Separated)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Personal Achievements (Individual)</label>
                <textarea
                  rows={3}
                  value={formData.personalAchievements}
                  onChange={(e) => setFormData({ ...formData, personalAchievements: e.target.value })}
                  placeholder="8x Ballon d'Or Winner, 6x Golden Shoe"
                  className="w-full p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">National Team Achievements</label>
                <textarea
                  rows={3}
                  value={formData.nationalAchievements}
                  onChange={(e) => setFormData({ ...formData, nationalAchievements: e.target.value })}
                  placeholder="FIFA World Cup Champion (2022), Copa América Champion"
                  className="w-full p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Good Records & Milestones</label>
                <textarea
                  rows={3}
                  value={formData.goodRecords}
                  onChange={(e) => setFormData({ ...formData, goodRecords: e.target.value })}
                  placeholder="Most goals in a calendar year (91 goals)"
                  className="w-full p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Bad / Disciplinary Records</label>
                <textarea
                  rows={3}
                  value={formData.badRecords}
                  onChange={(e) => setFormData({ ...formData, badRecords: e.target.value })}
                  placeholder="Most red cards in Champions League history"
                  className="w-full p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={createPlayerMutation.isPending}
            className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
          >
            {createPlayerMutation.isPending ? <Spinner size="sm" /> : <UserPlus className="h-4 w-4" />}
            <span>Save Player Profile</span>
          </button>
        </form>
      </main>

      <PublicFooter />
    </div>
  );
}
