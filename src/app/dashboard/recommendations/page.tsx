'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  Sparkles, Trophy, ArrowRight, RefreshCw, 
  HelpCircle, History, BookOpen, AlertTriangle, ChevronRight, CornerDownRight, Users, Activity
} from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../hooks/use-auth';

interface RecommendationItem {
  teamId?: string;
  name: string;
  reason: string;
}

interface PlayerItem {
  name: string;
  team: string;
  reason: string;
}

interface MatchItem {
  matchName: string;
  reason: string;
}

interface RecommendationData {
  _id: string;
  userRefinement: string;
  createdAt: string;
  recommendations: {
    recommendedTeams: RecommendationItem[];
    recommendedPlayers: PlayerItem[];
    underdogTeams: RecommendationItem[];
    recommendedMatches: MatchItem[];
  };
}

export default function RecommendationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [refinementText, setRefinementText] = useState('');
  const [activeRecommendation, setActiveRecommendation] = useState<RecommendationData | null>(null);

  // Fetch the latest recommendation (runs the engine if empty)
  const { data: latestData, isLoading: latestLoading, error: latestError, refetch: refetchLatest } = useQuery({
    queryKey: ['latestRecommendation'],
    queryFn: async () => {
      const res = await api.get<{ recommendation: RecommendationData | null; message?: string }>('/recommendations');
      if (res.recommendation && !activeRecommendation) {
        setActiveRecommendation(res.recommendation);
      }
      return res;
    },
    enabled: !!user,
  });

  // Fetch recommendation history logs
  const { data: historyData = { history: [] }, isLoading: historyLoading } = useQuery({
    queryKey: ['recommendationHistory'],
    queryFn: async () => {
      return api.get<{ history: RecommendationData[] }>('/recommendations/history');
    },
    enabled: !!user,
  });

  // Refine recommendations mutation
  const refineMutation = useMutation({
    mutationFn: async (text: string) => {
      return api.post<{ recommendation: RecommendationData }>('/recommendations/refine', { refinement: text });
    },
    onSuccess: (res) => {
      setActiveRecommendation(res.recommendation);
      setRefinementText('');
      queryClient.invalidateQueries({ queryKey: ['latestRecommendation'] });
      queryClient.invalidateQueries({ queryKey: ['recommendationHistory'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to refine recommendations.');
    }
  });

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinementText.trim()) return;
    refineMutation.mutate(refinementText);
  };

  const handleTriggerInitial = () => {
    refetchLatest();
  };

  if (!user) {
    return null;
  }

  const noRecommendations = latestData?.recommendation === null && !latestLoading;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>AI Squad Recommender</span>
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 font-medium">Get customized country recommendations, key playmakers, underdog insights, and simulated matchups.</p>
        </div>
      </div>

      {noRecommendations ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-emerald-950 bg-white dark:bg-[#0b120c] p-16 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <Trophy className="h-12 w-12 text-emerald-600 dark:text-emerald-900 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">No Recommendations Available</h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
            We need seeded national squad records in our database to formulate tactical playstyle matchings.
          </p>
        </div>
      ) : latestLoading ? (
        /* Loading Skeleton pulses */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-44 bg-zinc-100 dark:bg-[#0b120c]/40 border border-zinc-200 dark:border-emerald-950 rounded-2xl" />
            <div className="h-48 bg-zinc-100 dark:bg-[#0b120c]/40 border border-zinc-200 dark:border-emerald-950 rounded-2xl" />
            <div className="h-48 bg-zinc-100 dark:bg-[#0b120c]/40 border border-zinc-200 dark:border-emerald-950 rounded-2xl" />
          </div>
          <div className="lg:col-span-4 h-96 bg-zinc-100 dark:bg-[#0b120c]/40 border border-zinc-200 dark:border-emerald-950 rounded-2xl" />
        </div>
      ) : latestError ? (
        /* Error Warning */
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-12 text-center max-w-md mx-auto flex flex-col items-center gap-4">
          <AlertTriangle className="h-10 w-10 text-rose-500" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Connection Error</h3>
          <p className="text-xs text-rose-500 font-medium">{(latestError as Error).message || 'Failed to generate recommendations.'}</p>
          <button
            onClick={handleTriggerInitial}
            className="h-9 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Retry Recommendation
          </button>
        </div>
      ) : (
        /* Main Recommendations workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Recommendations results */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* User Refinement control form */}
            <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 p-5 rounded-2xl space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Refine Playstyle Recommendations</h3>
              <form onSubmit={handleRefineSubmit} className="flex gap-2">
                <input 
                  type="text"
                  value={refinementText}
                  onChange={(e) => setRefinementText(e.target.value)}
                  placeholder="e.g., Focus on CONMEBOL teams / Show defensive counter-press configurations..."
                  disabled={refineMutation.isPending}
                  className="flex-1 h-10.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 hover:border-emerald-500/30 focus:border-emerald-500 focus:outline-none rounded-xl px-4 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-650 transition-colors"
                />
                <button
                  type="submit"
                  disabled={refineMutation.isPending || !refinementText.trim()}
                  className="h-10.5 px-5 rounded-xl bg-emerald-600 dark:bg-emerald-500 hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  {refineMutation.isPending ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Simulating...</span>
                    </>
                  ) : (
                    <span>Regenerate</span>
                  )}
                </button>
              </form>
              {activeRecommendation?.userRefinement && (
                <div className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/10 p-3 rounded-xl flex items-start gap-1.5 font-medium leading-relaxed">
                  <CornerDownRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-500" />
                  <div>
                    <span className="font-extrabold block uppercase tracking-wider text-[8px] text-emerald-600 dark:text-emerald-500 mb-0.5">Active refinement focus:</span>
                    <span>"{activeRecommendation.userRefinement}"</span>
                  </div>
                </div>
              )}
            </section>

            {/* 1. Recommended Contenders */}
            {activeRecommendation?.recommendations.recommendedTeams && activeRecommendation.recommendations.recommendedTeams.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Trophy className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Recommended Contenders</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeRecommendation.recommendations.recommendedTeams.map((team, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950 rounded-2xl p-5 flex flex-col justify-between h-36 hover:border-emerald-500/30 shadow-sm transition-all">
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-sm">{team.name}</h4>
                        <p className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2 font-medium">{team.reason}</p>
                      </div>
                      {team.teamId ? (
                        <Link href={`/documents/${team.teamId}`} className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 mt-2">
                          <span>Explore Squad Profile</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-[9px] text-zinc-500 font-bold uppercase">Squad reference</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 2. Exciting Underdogs */}
            {activeRecommendation?.recommendations.underdogTeams && activeRecommendation.recommendations.underdogTeams.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400" />
                  <span>Exciting Underdogs to Follow</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeRecommendation.recommendations.underdogTeams.map((team, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950 rounded-2xl p-5 flex flex-col justify-between h-36 hover:border-emerald-500/30 shadow-sm transition-all">
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-sm">{team.name}</h4>
                        <p className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2 font-medium">{team.reason}</p>
                      </div>
                      {team.teamId ? (
                        <Link href={`/documents/${team.teamId}`} className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1.5 mt-2">
                          <span>Explore Underdog</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-[9px] text-zinc-500 font-bold uppercase">Underdog reference</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 3. Playmakers list */}
            {activeRecommendation?.recommendations.recommendedPlayers && activeRecommendation.recommendations.recommendedPlayers.length > 0 && (
              <section className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950 p-6 rounded-2xl space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Users className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Key Playmakers to Scout</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeRecommendation.recommendations.recommendedPlayers.map((player, idx) => (
                    <div key={idx} className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 rounded-xl p-4 flex flex-col justify-between min-h-[120px]">
                      <div className="space-y-1">
                        <h4 className="text-[11px] font-extrabold text-zinc-900 dark:text-white leading-tight">{player.name}</h4>
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">{player.team}</span>
                        <p className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-normal mt-1 font-medium">{player.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 4. Suggested Matchups */}
            {activeRecommendation?.recommendations.recommendedMatches && activeRecommendation.recommendations.recommendedMatches.length > 0 && (
              <section className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950 p-6 rounded-2xl space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400" />
                  <span>Must-Watch Simulated Matches</span>
                </h3>
                <div className="space-y-4">
                  {activeRecommendation.recommendations.recommendedMatches.map((match, idx) => (
                    <div key={idx} className="space-y-1 border-l-2 border-emerald-500 pl-4 py-0.5">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <Trophy className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span>{match.matchName}</span>
                      </h4>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-semibold">{match.reason}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Right Column: Recommendation History */}
          <div className="lg:col-span-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 rounded-2xl p-5 space-y-4 shadow-sm sticky top-20">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <History className="h-4 w-4 text-zinc-500" />
              <span>Scouting History</span>
            </h3>
            {historyLoading ? (
              <div className="h-32 bg-zinc-100 dark:bg-[#0b120c] rounded-xl animate-pulse" />
            ) : historyData.history.length === 0 ? (
              <p className="text-[10px] text-zinc-500 italic">No history logs saved.</p>
            ) : (
              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                {historyData.history.map((hist) => {
                  const isActive = activeRecommendation?._id === hist._id;
                  const dateStr = new Date(hist.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  });
                  
                  return (
                    <button
                      key={hist._id}
                      onClick={() => setActiveRecommendation(hist)}
                      className={`w-full text-left p-3.5 rounded-xl border text-[11px] transition-all flex items-start justify-between gap-2 cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                          : 'bg-zinc-50 dark:bg-[#0b120c] border-zinc-200 dark:border-emerald-950/60 text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-emerald-500/30'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-extrabold">
                          {dateStr}
                        </span>
                        <span className="block truncate">
                          {hist.userRefinement ? `"${hist.userRefinement}"` : 'Initial Scout'}
                        </span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 mt-2 text-zinc-500" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
