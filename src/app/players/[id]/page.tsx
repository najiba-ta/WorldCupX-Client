'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  Trophy, Award, Heart, ThumbsUp, ThumbsDown, ArrowLeft, 
  Sparkles, AlertCircle, ShieldAlert, CheckCircle2, XCircle, 
  Activity, Star, User, Send, Bot, Flag, Shield
} from 'lucide-react';
import { api } from '../../../services/api';
import { PublicNavbar } from '../../../components/public/PublicNavbar';
import { PublicFooter } from '../../../components/public/PublicFooter';
import { useAuth } from '../../../hooks/use-auth';
import { usePlayerFavorites } from '../../../hooks/use-player-favorites';
import { Spinner } from '../../../components/ui/spinner';
import { PlayerData } from '../page';

export default function PlayerDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { isFavorited, toggleFavorite } = usePlayerFavorites();
  const queryClient = useQueryClient();

  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAskingAi, setIsAskingAi] = useState(false);

  // Fetch player details
  const { data: player, isLoading, error } = useQuery<PlayerData>({
    queryKey: ['playerDetails', id],
    queryFn: async () => {
      const res = await api.get<{ player: PlayerData }>(`/players/${id}`);
      return res.player;
    },
    enabled: !!id,
  });

  // Like / Unlike mutation
  const likeMutation = useMutation({
    mutationFn: async (action: 'like' | 'unlike') => {
      return api.post(`/players/${id}/like`, { action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerDetails', id] });
      queryClient.invalidateQueries({ queryKey: ['explorePlayers'] });
    },
  });

  const handleAiQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || isAskingAi) return;

    setIsAskingAi(true);
    setAiAnswer(null);

    try {
      const res = await api.post<{ response: string }>('/ai/chat', {
        question: aiQuestion,
        teamContext: player ? `Player: ${player.name}, Club: ${player.currentClub}, Nation: ${player.nationalTeam}, Goals: ${player.goals}, Assists: ${player.assists}, Trophies: ${player.personalAchievements.join(', ')}` : '',
      });
      setAiAnswer(res.response);
    } catch (err: any) {
      setAiAnswer('Unable to generate AI analysis at the moment.');
    } finally {
      setIsAskingAi(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white dark:bg-[#070e0a]">
        <PublicNavbar />
        <main className="flex-1 flex flex-col items-center justify-center p-12 gap-3 text-zinc-500">
          <Spinner size="lg" />
          <p className="text-xs font-bold uppercase tracking-wider">Fetching player profile...</p>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="flex flex-col min-h-screen bg-white dark:bg-[#070e0a]">
        <PublicNavbar />
        <main className="flex-1 flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto gap-4">
          <AlertCircle className="h-12 w-12 text-rose-500" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Player Not Found</h2>
          <p className="text-xs text-zinc-500">The player profile could not be retrieved from database records.</p>
          <Link href="/players" className="inline-flex items-center gap-1 text-emerald-500 text-xs font-bold hover:underline">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Players List</span>
          </Link>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const personalAchievements = player?.personalAchievements || [];
  const nationalAchievements = player?.nationalAchievements || [];
  const goodRecords = player?.goodRecords || [];
  const badRecords = player?.badRecords || [];

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#070e0a] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 md:px-8 space-y-8">
        
        {/* Back Navigation */}
        <div>
          <Link href="/players" className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-emerald-500 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to All Players</span>
          </Link>
        </div>

        {/* Hero Banner Header */}
        <div className="bg-[#0b120c] border border-emerald-950/80 rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-6 p-6 md:p-8 relative shadow-lg">
          
          {/* Player Image */}
          <div className="md:col-span-1 border border-emerald-950 rounded-2xl overflow-hidden h-64 md:h-80 relative bg-zinc-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={player.imageUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=350&auto=format&fit=crop'}
              alt={player.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-extrabold px-3 py-1 rounded-xl shadow-md">
              #{player.jerseyNumber}
            </div>
          </div>

          {/* Player Info & Actions */}
          <div className="md:col-span-2 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                <span className="bg-emerald-950 border border-emerald-900/60 text-emerald-400 px-3 py-1 rounded-lg uppercase">
                  {player.position}
                </span>
                <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 px-3 py-1 rounded-lg">
                  Club: {player.currentClub}
                </span>
                <span className="bg-zinc-900 border border-zinc-800 text-teal-400 px-3 py-1 rounded-lg">
                  Nation: {player.nationalTeam}
                </span>
                <span className="text-zinc-400">Age: {player.age}</span>
              </div>

              <div className="flex items-center justify-between">
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">{player.name}</h1>

                {/* Heart Favorite Button */}
                <button
                  type="button"
                  onClick={(e) => toggleFavorite(player._id, e)}
                  className="px-4 py-2.5 rounded-2xl bg-zinc-950 border border-emerald-950 hover:scale-105 transition-all cursor-pointer flex items-center gap-2 text-xs font-bold"
                >
                  <Heart className={`h-5 w-5 transition-colors ${isFavorited(player._id) ? 'fill-rose-500 text-rose-500' : 'text-zinc-400 hover:text-rose-500'}`} />
                  <span className={isFavorited(player._id) ? 'text-rose-400' : 'text-zinc-400'}>
                    {isFavorited(player._id) ? 'Favorited' : 'Add to Favorites'}
                  </span>
                </button>
              </div>
            </div>

            {/* Like & Unlike Counters */}
            <div className="flex items-center gap-4 bg-zinc-950/80 border border-emerald-950/60 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => likeMutation.mutate('like')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all cursor-pointer"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Like ({player.likesCount})</span>
                </button>

                <button
                  onClick={() => likeMutation.mutate('unlike')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition-all cursor-pointer"
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>Unlike ({player.unlikesCount})</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats Cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-500" />
            <span>Career Performance Statistics</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950/60 p-4 rounded-2xl text-center space-y-1 shadow-sm">
              <span className="text-[10px] text-zinc-500 font-bold uppercase block">Matches Played</span>
              <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">{player.matchesPlayed}</span>
            </div>

            <div className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950/60 p-4 rounded-2xl text-center space-y-1 shadow-sm">
              <span className="text-[10px] text-zinc-500 font-bold uppercase block">Goals</span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{player.goals}</span>
            </div>

            <div className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950/60 p-4 rounded-2xl text-center space-y-1 shadow-sm">
              <span className="text-[10px] text-zinc-500 font-bold uppercase block">Assists</span>
              <span className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">{player.assists}</span>
            </div>

            <div className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950/60 p-4 rounded-2xl text-center space-y-1 shadow-sm">
              <span className="text-[10px] text-zinc-500 font-bold uppercase block">Yellow Cards</span>
              <span className="text-2xl font-extrabold text-amber-500">{player.yellowCards}</span>
            </div>

            <div className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950/60 p-4 rounded-2xl text-center space-y-1 shadow-sm">
              <span className="text-[10px] text-zinc-500 font-bold uppercase block">Red Cards</span>
              <span className="text-2xl font-extrabold text-rose-500">{player.redCards}</span>
            </div>

            <div className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950/60 p-4 rounded-2xl text-center space-y-1 shadow-sm">
              <span className="text-[10px] text-zinc-500 font-bold uppercase block">Fouls Committed</span>
              <span className="text-2xl font-extrabold text-indigo-500">{player.foulsCommitted}</span>
            </div>
          </div>
        </div>

        {/* Achievements Grid: Personal vs National */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Personal Achievements */}
          <div className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950/60 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-emerald-950/60 pb-3">
              <Trophy className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">Personal Achievements (Individual)</h3>
            </div>

            {personalAchievements.length === 0 ? (
              <p className="text-xs text-zinc-500">No individual achievements listed.</p>
            ) : (
              <ul className="space-y-2.5">
                {personalAchievements.map((award, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                    <Star className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{award}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* National Team Achievements */}
          <div className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950/60 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-emerald-950/60 pb-3">
              <Flag className="h-5 w-5 text-emerald-500" />
              <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white">National Team Achievements</h3>
            </div>

            {nationalAchievements.length === 0 ? (
              <p className="text-xs text-zinc-500">No national team achievements listed.</p>
            ) : (
              <ul className="space-y-2.5">
                {nationalAchievements.map((honor, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                    <Award className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{honor}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Good & Bad Records Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Good Records */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-emerald-500/20 pb-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <h3 className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">Career Good Records & Milestones</h3>
            </div>

            {goodRecords.length === 0 ? (
              <p className="text-xs text-zinc-500">No good records listed.</p>
            ) : (
              <ul className="space-y-2.5">
                {goodRecords.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-800 dark:text-zinc-300 font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Bad Records */}
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-rose-500/20 pb-3">
              <XCircle className="h-5 w-5 text-rose-500" />
              <h3 className="text-lg font-extrabold text-rose-700 dark:text-rose-400">Career Disciplinary & Bad Records</h3>
            </div>

            {badRecords.length === 0 ? (
              <p className="text-xs text-zinc-500">No bad records reported.</p>
            ) : (
              <ul className="space-y-2.5">
                {badRecords.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-800 dark:text-zinc-300 font-medium">
                    <span className="h-2 w-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Ask AI Agent Widget for this player */}
        <div className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950/60 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">Ask WorldCupX AI about {player.name}</h3>
              <p className="text-xs text-zinc-500 font-medium">Get instant tactical analysis, comparisons, or historical stats for {player.name}.</p>
            </div>
          </div>

          <form onSubmit={handleAiQuestion} className="flex items-center gap-3">
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder={`e.g. How does ${player.name} perform in high-pressure finals?`}
              className="flex-1 h-12 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 rounded-xl px-4 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-500 transition-colors"
              disabled={isAskingAi}
            />
            <button
              type="submit"
              disabled={!aiQuestion.trim() || isAskingAi}
              className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isAskingAi ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
              <span>Ask AI</span>
            </button>
          </form>

          {aiAnswer && (
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 text-xs leading-relaxed text-zinc-800 dark:text-zinc-300 font-medium">
              {aiAnswer}
            </div>
          )}
        </div>

      </main>

      <PublicFooter />
    </div>
  );
}
