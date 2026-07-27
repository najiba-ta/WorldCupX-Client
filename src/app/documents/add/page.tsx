'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Trophy, CheckCircle2, AlertCircle, RefreshCw, ArrowRight, ArrowLeft
} from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../hooks/use-auth';
import { Sidebar } from '../../../components/dashboard/sidebar';
import { Navbar } from '../../../components/dashboard/navbar';

const teamSchema = z.object({
  name: z.string().min(3, 'Country/Team name must be at least 3 characters long'),
  confederation: z.enum(['UEFA', 'CONMEBOL', 'CAF', 'AFC', 'CONCACAF', 'OFC']),
  fifaRanking: z.coerce.number().min(1, 'FIFA Ranking must be 1 or higher'),
  squadSize: z.coerce.number().min(11, 'Squad size must be at least 11 players').max(40, 'Squad size cannot exceed 40'),
  worldCupTitles: z.coerce.number().min(0, 'Titles cannot be negative'),
  coach: z.string().min(3, 'Coach name must be at least 3 characters long'),
  topPlayersText: z.string().min(3, 'Enter at least 1 top player'),
  recentFormText: z.string().min(3, 'Enter recent match form, e.g. W, D, W, L'),
  description: z.string().min(10, 'Short description must be at least 10 characters long').max(150, 'Short description cannot exceed 150 characters'),
  history: z.string().min(20, 'Full World Cup history description must be at least 20 characters long'),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
});

type TeamFormValues = z.infer<typeof teamSchema>;

export default function AddTeamPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors: anyErrors },
  } = useForm<any>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      confederation: 'UEFA',
      fifaRanking: 10,
      squadSize: 26,
      worldCupTitles: 0,
      coach: '',
      topPlayersText: '',
      recentFormText: 'W, D, W',
      description: '',
      history: '',
      imageUrl: '',
    },
  });

  const errors = anyErrors as any;

  const confederationValue = watch('confederation');

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    setGeneralError(null);
    setSubmitSuccess(false);
    setPendingStatus(false);

    try {
      // Split players and form
      const topPlayers = values.topPlayersText.split(',').map((p: string) => p.trim()).filter(Boolean);
      const recentForm = values.recentFormText.split(',').map((f: string) => f.trim().toUpperCase()).filter(Boolean);
      const achievements = values.worldCupTitles > 0 ? [`${values.worldCupTitles}x World Cup Champions`] : ['World Cup Participant'];

      const res = await api.post<any>('/teams', {
        name: values.name,
        confederation: values.confederation,
        fifaRanking: values.fifaRanking,
        squadSize: values.squadSize,
        worldCupTitles: values.worldCupTitles,
        coach: values.coach,
        topPlayers,
        recentForm,
        description: values.description,
        history: values.history,
        achievements,
        imageUrl: values.imageUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=350&auto=format&fit=crop',
      });

      const isPending = res.team?.status === 'pending' || user?.role !== 'admin';
      setPendingStatus(isPending);
      setSubmitSuccess(true);
      reset();
      
      // Invalidate queries so newly added team appears immediately in explore and manage lists
      queryClient.invalidateQueries({ queryKey: ['exploreTeams'] });
      queryClient.invalidateQueries({ queryKey: ['manageTeams'] });
      queryClient.invalidateQueries({ queryKey: ['adminPending'] });
      
      setTimeout(() => {
        router.push(user?.role === 'admin' ? '/documents' : '/dashboard');
      }, 3500);

    } catch (err: any) {
      setGeneralError(err.message || 'Failed to submit team profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return null;
  }

  if (!user) {
    return null;
  }

  const CONFEDERATIONS = ['UEFA', 'CONMEBOL', 'CAF', 'AFC', 'CONCACAF', 'OFC'];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar navigation */}
      <Sidebar className="shrink-0" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable Form Content */}
        <main className="flex-1 overflow-y-auto bg-background/20 p-8 space-y-6">
          <div>
            <h1 className="text-xl font-extrabold text-foreground tracking-tight">Add Team</h1>
            <p className="text-xs text-muted mt-0.5 font-medium">Register a new national team profile into the database.</p>
          </div>

          <div className="max-w-3xl space-y-6">
            {submitSuccess && (
              <div className={`flex items-start gap-3 rounded-2xl p-5 text-xs border ${pendingStatus ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                {pendingStatus ? <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" /> : <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />}
                <div className="space-y-1">
                  <span className="font-extrabold text-sm block">
                    {pendingStatus ? '⏳ Your request is pending approval!' : '✅ Team Published Live!'}
                  </span>
                  <p className="leading-relaxed font-medium">
                    {pendingStatus
                      ? 'Your team submission has been saved successfully. Once an admin reviews and approves your request, it will be published live on WorldCupX for everyone to see.'
                      : 'Team profile has been published live to the WorldCupX global directory.'}
                  </p>
                  <span className="text-[10px] font-bold opacity-70 block pt-1">Redirecting you to dashboard...</span>
                </div>
              </div>
            )}

            {generalError && (
              <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-xs text-rose-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <div>
                  <span className="font-bold block">Submission Failed</span>
                  <span>{generalError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              {/* Name and Coach */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 font-semibold">Country Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Argentina"
                    {...register('name')}
                    className="w-full h-10.5 bg-zinc-950 border border-emerald-950 focus:border-emerald-500 focus:outline-none rounded-xl px-4 text-xs text-white placeholder-zinc-650"
                  />
                  {errors.name && <p className="text-[11px] text-rose-500 font-semibold">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 font-semibold">Head Coach</label>
                  <input
                    type="text"
                    placeholder="e.g. Lionel Scaloni"
                    {...register('coach')}
                    className="w-full h-10.5 bg-zinc-950 border border-emerald-950 focus:border-emerald-500 focus:outline-none rounded-xl px-4 text-xs text-white placeholder-zinc-650"
                  />
                  {errors.coach && <p className="text-[11px] text-rose-500 font-semibold">{errors.coach.message}</p>}
                </div>
              </div>

              {/* Confederation */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 font-semibold">Confederation</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {CONFEDERATIONS.map((conf) => {
                    const isSelected = confederationValue === conf;
                    return (
                      <button
                        key={conf}
                        type="button"
                        onClick={() => setValue('confederation', conf as any)}
                        className={`h-9 rounded-lg border text-[10.5px] font-bold transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                            : 'bg-zinc-950 border-emerald-950/60 text-zinc-400 hover:border-emerald-900'
                        }`}
                      >
                        {conf}
                      </button>
                    );
                  })}
                </div>
                {errors.confederation && <p className="text-[11px] text-rose-500 font-semibold">{errors.confederation.message}</p>}
              </div>

              {/* Stats: Rank, Squad, Titles */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 font-semibold">FIFA Rank</label>
                  <input
                    type="number"
                    {...register('fifaRanking')}
                    className="w-full h-10.5 bg-zinc-950 border border-emerald-950 focus:border-emerald-500 focus:outline-none rounded-xl px-4 text-xs text-white"
                  />
                  {errors.fifaRanking && <p className="text-[11px] text-rose-500 font-semibold">{errors.fifaRanking.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 font-semibold">Squad Size</label>
                  <input
                    type="number"
                    {...register('squadSize')}
                    className="w-full h-10.5 bg-zinc-950 border border-emerald-950 focus:border-emerald-500 focus:outline-none rounded-xl px-4 text-xs text-white"
                  />
                  {errors.squadSize && <p className="text-[11px] text-rose-500 font-semibold">{errors.squadSize.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 font-semibold">World Cups Won</label>
                  <input
                    type="number"
                    {...register('worldCupTitles')}
                    className="w-full h-10.5 bg-zinc-950 border border-emerald-950 focus:border-emerald-500 focus:outline-none rounded-xl px-4 text-xs text-white"
                  />
                  {errors.worldCupTitles && <p className="text-[11px] text-rose-500 font-semibold">{errors.worldCupTitles.message}</p>}
                </div>
              </div>

              {/* Playmakers and Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 font-semibold">Top Players (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Lionel Messi, Lautaro Martínez, De Paul"
                    {...register('topPlayersText')}
                    className="w-full h-10.5 bg-zinc-950 border border-emerald-950 focus:border-emerald-500 focus:outline-none rounded-xl px-4 text-xs text-white placeholder-zinc-650"
                  />
                  {errors.topPlayersText && <p className="text-[11px] text-rose-500 font-semibold">{errors.topPlayersText.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 font-semibold">Recent Form (e.g. W, D, W, L)</label>
                  <input
                    type="text"
                    placeholder="W, W, D, W, L"
                    {...register('recentFormText')}
                    className="w-full h-10.5 bg-zinc-950 border border-emerald-950 focus:border-emerald-500 focus:outline-none rounded-xl px-4 text-xs text-white placeholder-zinc-650"
                  />
                  {errors.recentFormText && <p className="text-[11px] text-rose-500 font-semibold">{errors.recentFormText.message}</p>}
                </div>
              </div>

              {/* Short Description */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 font-semibold">Short Synopsis</label>
                <input
                  type="text"
                  placeholder="e.g. Reigning World Cup Champions (10-150 chars)"
                  {...register('description')}
                  className="w-full h-10.5 bg-zinc-950 border border-emerald-950 focus:border-emerald-500 focus:outline-none rounded-xl px-4 text-xs text-white placeholder-zinc-655"
                />
                {errors.description && <p className="text-[11px] text-rose-500 font-semibold">{errors.description.message}</p>}
              </div>

              {/* Full Description / History */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 font-semibold">World Cup History Description</label>
                <textarea
                  rows={4}
                  placeholder="Provide comprehensive historical performance records (min 20 chars)"
                  {...register('history')}
                  className="w-full bg-zinc-950 border border-emerald-950 focus:border-emerald-500 focus:outline-none rounded-xl p-4 text-xs text-white placeholder-zinc-655 resize-none"
                />
                {errors.history && <p className="text-[11px] text-rose-500 font-semibold">{errors.history.message}</p>}
              </div>

              {/* Image URL */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 font-semibold">Flag / Team Photo Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://example.com/flag.jpg"
                  {...register('imageUrl')}
                  className="w-full h-10.5 bg-zinc-950 border border-emerald-950 focus:border-emerald-500 focus:outline-none rounded-xl px-4 text-xs text-white placeholder-zinc-655"
                />
                {errors.imageUrl && <p className="text-[11px] text-rose-500 font-semibold">{errors.imageUrl.message}</p>}
              </div>

              {/* Submit button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Saving Team Profile...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit National Team</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
