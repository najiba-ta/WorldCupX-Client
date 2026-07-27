'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  Trophy, Heart, Activity, Flame, PlusCircle, UserPlus, 
  MessageSquareCode, ArrowUpRight, Sparkles, User, ShieldAlert, Home
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../hooks/use-auth';
import { useFavorites } from '../../hooks/use-favorites';
import { usePlayerFavorites } from '../../hooks/use-player-favorites';
import { Spinner } from '../ui/spinner';

export function UserDashboardView() {
  const { user } = useAuth();
  const { favorites: favoriteTeams } = useFavorites();
  const { favorites: favoritePlayers } = usePlayerFavorites();

  // Fetch prediction history
  const { data: predictions = [], isLoading: historyLoading } = useQuery<any[]>({
    queryKey: ['userPredictionsHistory'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; predictions: any[] }>('/predictions/history');
      return res.predictions || [];
    },
  });

  const recentPredictions = predictions.slice(0, 4);

  return (
    <div className="space-y-8">

      {/* WorldCupX Logo — Click to go Home */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-green-600 shadow-lg transition-transform duration-200 group-hover:scale-110">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-white text-base tracking-wide group-hover:text-emerald-400 transition-colors">WorldCupX</span>
            <p className="text-[9px] text-zinc-500 font-medium flex items-center gap-1"><Home className="h-2.5 w-2.5" /> Click to go home</p>
          </div>
        </Link>
      </div>
      
      {/* Welcome Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-[#0b150f] to-zinc-950 p-6 md:p-8 rounded-3xl border border-emerald-900/60 shadow-lg">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-xs font-extrabold text-emerald-400">
            <Sparkles className="h-4 w-4" />
            <span>User Football Hub</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Welcome, {user?.name || 'Football Fan'}!
          </h1>
          <p className="text-xs text-zinc-400 font-medium">Track your favorite teams, stars, and match simulation logs all in one place.</p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/documents/add"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Team</span>
          </Link>

          <Link
            href="/players/add"
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Player</span>
          </Link>

          <Link
            href="/dashboard/chat"
            className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-emerald-950 text-emerald-400 hover:bg-zinc-800 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <MessageSquareCode className="h-4 w-4" />
            <span>AI Assistant</span>
          </Link>
        </div>
      </div>

      {/* Quick Personal Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950/60 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">My Favorite Teams</span>
            <h3 className="text-2xl font-black text-rose-500">{favoriteTeams.length}</h3>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20">
            <Heart className="h-5 w-5 fill-current" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950/60 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">My Favorite Stars</span>
            <h3 className="text-2xl font-black text-emerald-500">{favoritePlayers.length}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
            <User className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950/60 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Predictions Made</span>
            <h3 className="text-2xl font-black text-teal-500">{predictions.length}</h3>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-500 rounded-xl border border-teal-500/20">
            <Activity className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Favorite Teams Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">My Favorite Teams</h3>
            <p className="text-xs text-zinc-500 font-medium">National squads saved for fast scouting</p>
          </div>
          <Link href="/documents" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
            <span>Explore All Squads</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {favoriteTeams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-emerald-950/60 p-8 text-center bg-zinc-50/50 dark:bg-zinc-950/20">
            <Trophy className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No favorite teams added yet</p>
            <p className="text-[11px] text-zinc-500 mt-1">Click the heart icon on any team card on Explore Teams page to save it here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {favoriteTeams.map((team: any) => (
              <Link
                key={team._id || team.id}
                href={`/documents/${team._id || team.id}`}
                className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950/60 p-4 rounded-2xl flex items-center gap-3.5 hover:border-emerald-500/40 shadow-sm transition-all group"
              >
                <img
                  src={team.imageUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=150&auto=format&fit=crop'}
                  alt={team.name}
                  className="h-12 w-12 rounded-xl object-cover border border-zinc-200 dark:border-emerald-950/60 shrink-0"
                />
                <div className="overflow-hidden">
                  <h4 className="text-xs font-extrabold text-zinc-900 dark:text-white truncate group-hover:text-emerald-500 transition-colors">
                    {team.name}
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-medium truncate">{team.confederation} • Rank #{team.fifaRanking}</p>
                  <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    {team.worldCupTitles} World Cups
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Favorite Players Showcase */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">My Favorite Football Stars</h3>
            <p className="text-xs text-zinc-500 font-medium">Players you are following</p>
          </div>
          <Link href="/players" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
            <span>Explore Top Players</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {favoritePlayers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-emerald-950/60 p-8 text-center bg-zinc-50/50 dark:bg-zinc-950/20">
            <User className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No favorite players added yet</p>
            <p className="text-[11px] text-zinc-500 mt-1">Click the heart icon on any player card on Top Players page to save them here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {favoritePlayers.map((player: any) => (
              <Link
                key={player._id || player.id}
                href={`/players/${player._id || player.id}`}
                className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950/60 p-4 rounded-2xl flex items-center gap-3.5 hover:border-emerald-500/40 shadow-sm transition-all group"
              >
                <img
                  src={player.imageUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=150&auto=format&fit=crop'}
                  alt={player.name}
                  className="h-12 w-12 rounded-xl object-cover border border-zinc-200 dark:border-emerald-950/60 shrink-0"
                />
                <div className="overflow-hidden">
                  <h4 className="text-xs font-extrabold text-zinc-900 dark:text-white truncate group-hover:text-emerald-500 transition-colors">
                    {player.name}
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-medium truncate">{player.currentClub}</p>
                  <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    {player.goals} Goals • Rank #{player.ranking || 'Top'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Match Prediction History Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">My Match Prediction Logs</h3>
            <p className="text-xs text-zinc-500 font-medium">Recent AI match forecasts simulated</p>
          </div>
        </div>

        {recentPredictions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-emerald-950/60 bg-zinc-50/50 dark:bg-[#0b120c]/20 p-8 text-center">
            <Flame className="h-8 w-8 text-emerald-600 dark:text-emerald-950 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white">No prediction logs yet</h4>
            <p className="text-[11px] text-zinc-500 mt-1">Simulate match predictions on the homepage widget to save logs here!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentPredictions.map((pred) => (
              <div key={pred._id} className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950/60 p-4 rounded-2xl flex flex-col justify-between space-y-3 shadow-sm">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold">
                    <span className="text-teal-600 dark:text-teal-400">Match Forecast</span>
                    <span>{new Date(pred.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                    {pred.team1Name} vs {pred.team2Name}
                  </h4>
                  <p className="text-[10px] text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed font-medium">
                    {pred.result?.predictionSummary}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-200 dark:border-emerald-950/40 pt-2.5">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/30 px-2 py-0.5 rounded">
                    Confidence: {pred.result?.confidenceScore}%
                  </span>
                  <span className="text-[10px] text-zinc-700 dark:text-zinc-300 font-extrabold">
                    xG: {pred.result?.expectedGoalsTeam1} - {pred.result?.expectedGoalsTeam2}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
