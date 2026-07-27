'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Trophy,
  Activity,
  Calendar,
  Layers,
  Sparkles,
  ClipboardList,
  ChevronLeft,
  BookOpen,
  User,
  Heart
} from 'lucide-react';
import { api } from '../../../services/api';
import { ChatWindow } from '../../../components/dashboard/chat-window';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Tabs } from '../../../components/ui/tabs';

interface TeamData {
  _id: string;
  name: string;
  confederation: string;
  fifaRanking: number;
  squadSize: number;
  worldCupTitles: number;
  coach: string;
  topPlayers: string[];
  recentForm: string[];
  description: string;
  history: string;
  achievements: string[];
  imageUrl?: string;
}

function ChatWorkspace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const teamId = searchParams.get('teamId');
  const [activeTab, setActiveTab] = useState('summary');

  // Fetch all teams for list
  const { data: teams = [], isLoading: loadingTeams } = useQuery<TeamData[]>({
    queryKey: ['chatTeamsList'],
    queryFn: async () => {
      const res = await api.get<{ teams: TeamData[] }>('/teams');
      return res.teams || [];
    },
  });

  // Fetch individual team details
  const { data: team, isLoading: loadingTeamDetails } = useQuery<TeamData>({
    queryKey: ['chatTeamDetails', teamId],
    queryFn: async () => {
      if (!teamId) return null as any;
      const res = await api.get<{ team: TeamData }>(`/teams/${teamId}`);
      return res.team;
    },
    enabled: !!teamId,
  });

  // Tab configurations
  const tabs = [
    { id: 'summary', label: 'Tactical Overview', icon: <Trophy className="h-4 w-4" /> },
    { id: 'insights', label: 'Watchlist & Form', icon: <Activity className="h-4 w-4" /> },
    { id: 'context', label: 'Squad Bio Legacy', icon: <BookOpen className="h-4 w-4" /> },
  ];

  // If no team ID is selected, list contenders to start conversation context
  if (!teamId) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Tactical Assistant</h2>
          <p className="text-xs text-zinc-450 mt-1">Select a national team from the squad files list below to load their tactical variables and begin chat sessions.</p>
        </div>

        {loadingTeams ? (
          <div className="rounded-2xl border border-emerald-950 bg-[#0b120c]/30 p-12 text-center flex flex-col items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-xs text-zinc-550 font-semibold">Loading team rosters...</span>
          </div>
        ) : teams.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-emerald-950 bg-[#0b120c]/30 p-12 text-center">
            <Trophy className="h-10 w-10 text-emerald-900 mx-auto mb-4" />
            <h4 className="text-sm font-bold text-white">No teams available</h4>
            <p className="text-xs text-zinc-550 mt-1 max-w-sm mx-auto mb-6">
              You must seed or add team profiles in the registry before initiating tactical conversation logs.
            </p>
            <Button onClick={() => router.push('/documents/add')} className="bg-emerald-500 hover:opacity-90 font-bold text-white px-4 py-2 text-xs rounded-xl cursor-pointer">
              Add National Team
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((t) => (
              <Card
                key={t._id}
                onClick={() => router.push(`/dashboard/chat?teamId=${t._id}`)}
                className="hover:border-emerald-500/30 hover:bg-emerald-950/5 cursor-pointer border-emerald-950/60 bg-[#0b120c] transition-all duration-200"
              >
                <CardContent className="p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-11 w-14 shrink-0 border border-emerald-950/40 rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.imageUrl} alt={t.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate max-w-[200px]">{t.name}</h4>
                      <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">Rank #{t.fifaRanking} • Cups: {t.worldCupTitles}</p>
                    </div>
                  </div>
                  <ChevronLeft className="h-5 w-5 text-zinc-600 rotate-180" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-140px)] max-w-[1600px] mx-auto overflow-hidden">
      {/* LEFT COLUMN: Team Inspector */}
      <div className="flex-1 flex flex-col min-w-0 rounded-2xl border border-emerald-950 bg-[#0b120c] overflow-hidden">
        {/* Team Header details */}
        <div className="px-6 py-4 border-b border-emerald-950/60 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/chat')}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-950 bg-zinc-950 text-zinc-550 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">{team?.name}</h3>
              <p className="text-[10px] text-zinc-550 font-semibold mt-0.5">
                {team?.confederation} Confederation • Coach: {team?.coach}
              </p>
            </div>
          </div>

          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Dynamic Tab Panel content */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-zinc-400 leading-relaxed font-medium">
          {loadingTeamDetails ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <svg className="animate-spin h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="text-xs text-zinc-550">Retrieving squad bio...</span>
            </div>
          ) : (
            <>
              {activeTab === 'summary' && (
                <div className="space-y-4 whitespace-pre-line text-zinc-300">
                  {team?.description ? (
                    <div className="prose prose-invert max-w-none text-xs leading-relaxed font-medium">
                      {team.description}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-zinc-550">
                      No synopsis outline generated.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'insights' && (
                <div className="space-y-6">
                  {team ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Manager */}
                        <div className="rounded-xl border border-emerald-950 bg-zinc-950/40 p-4">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2">
                            <User className="h-3.5 w-3.5" /> Technical Director
                          </span>
                          <p className="text-sm font-bold text-white">{team.coach || 'Not identified'}</p>
                        </div>
                        {/* FIFA Ranking */}
                        <div className="rounded-xl border border-emerald-950 bg-zinc-950/40 p-4">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400 flex items-center gap-1.5 mb-2">
                            <Trophy className="h-3.5 w-3.5" /> FIFA Ranking
                          </span>
                          <p className="text-sm font-bold text-white">#{team.fifaRanking || 'Not ranked'}</p>
                        </div>
                      </div>

                      {/* Playmakers */}
                      {team.topPlayers && team.topPlayers.length > 0 && (
                        <div className="rounded-xl border border-emerald-950 bg-zinc-950/40 p-5">
                          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 mb-3">Key Playmakers</h4>
                          <div className="flex flex-wrap gap-2">
                            {team.topPlayers.map((player, i) => (
                              <span key={i} className="rounded-lg bg-zinc-950 border border-emerald-950/50 px-2.5 py-1 text-xs text-white font-bold">
                                {player}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Form Sequence */}
                      {team.recentForm && team.recentForm.length > 0 && (
                        <div className="rounded-xl border border-emerald-950 bg-zinc-950/40 p-5">
                          <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500 flex items-center gap-2 mb-3">
                            <Activity className="h-4 w-4 text-emerald-450" /> Zonal Match Outcomes
                          </h4>
                          <div className="flex gap-2">
                            {team.recentForm.map((result, i) => (
                              <span 
                                key={i} 
                                className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold text-white border ${
                                  result === 'W' 
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                                    : result === 'D' 
                                    ? 'bg-zinc-800 border-zinc-700 text-zinc-400' 
                                    : 'bg-rose-500/10 border-rose-500 text-rose-400'
                                }`}
                              >
                                {result}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12 text-zinc-550">
                      No team variables detected.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'context' && (
                <div className="space-y-4">
                  <div className="bg-zinc-950 rounded-xl p-5 border border-emerald-950 font-mono text-xs text-zinc-400 h-[380px] overflow-y-auto whitespace-pre-wrap select-all">
                    {team?.history || 'No squad history biography seeded.'}
                  </div>
                  <p className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider text-right">Legacy details log</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: AI Chat Window */}
      <div className="w-full xl:w-[480px] shrink-0 h-full flex flex-col">
        <ChatWindow teamId={teamId} />
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full w-full items-center justify-center p-12 bg-[#070e0a] text-zinc-500">
        <div className="flex flex-col items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-xs text-zinc-550 font-semibold uppercase tracking-wider">Mounting workspace...</span>
        </div>
      </div>
    }>
      <ChatWorkspace />
    </Suspense>
  );
}
