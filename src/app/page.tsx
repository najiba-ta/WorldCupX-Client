'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, Trophy, Sparkles, Star, ChevronDown, CheckCircle2, 
  Flame, Shield, BarChart3, Activity, Users, Send, AlertCircle, RefreshCw
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../hooks/use-auth';
import { PublicNavbar } from '../components/public/PublicNavbar';
import { PublicFooter } from '../components/public/PublicFooter';
import { api } from '../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

export default function Home() {
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Match Prediction form state
  const [team1Name, setTeam1Name] = useState('Argentina');
  const [team2Name, setTeam2Name] = useState('France');
  const [team1Form, setTeam1Form] = useState('W, W, W, D, W');
  const [team2Form, setTeam2Form] = useState('W, L, W, D, W');
  const [team1Injuries, setTeam1Injuries] = useState('None');
  const [team2Injuries, setTeam2Injuries] = useState('None');
  const [weather, setWeather] = useState('Clear, 24°C');
  const [venue, setVenue] = useState('Lusail Stadium, Qatar');
  
  const [predictionResult, setPredictionResult] = useState<any>(null);

  // Fetch all teams for selection
  const { data: teamsData } = useQuery({
    queryKey: ['publicTeams'],
    queryFn: async () => {
      const res = await api.get<{ teams: any[] }>('/teams');
      return res.teams || [];
    },
  });

  // Fetch general analytics for charts
  const { data: analyticsData } = useQuery({
    queryKey: ['publicAnalytics'],
    queryFn: async () => {
      const res = await api.get<any>('/analytics');
      return res;
    },
    enabled: true,
  });

  // Match prediction mutation
  const predictionMutation = useMutation({
    mutationFn: async () => {
      // If user is not logged in, we simulate prediction to satisfy public landing page interactive request
      if (!user) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              result: {
                winningProbabilityTeam1: 52,
                winningProbabilityDraw: 20,
                winningProbabilityTeam2: 28,
                expectedGoalsTeam1: 2.3,
                expectedGoalsTeam2: 1.5,
                keyPlayersTeam1: ['Lionel Messi', 'Lautaro Martínez'],
                keyPlayersTeam2: ['Kylian Mbappé', 'Antoine Griezmann'],
                predictionSummary: 'Argentina is expected to dominate mid-space progressions through Lionel Messi. France will threaten on transitions with Mbappé\'s acceleration behind the wingbacks, but Argentina\'s defensive structure will likely hold them off. Expect a highly tactical battle in the midfield.',
                confidenceScore: 88,
              }
            });
          }, 1200);
        });
      }
      return api.post<{ prediction: any }>('/predictions/predict', {
        team1Name,
        team2Name,
        team1Form,
        team2Form,
        team1Injuries,
        team2Injuries,
        weather,
        venue,
      });
    },
    onSuccess: (data: any) => {
      setPredictionResult(data.prediction?.result || data.result);
    },
  });

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();
    predictionMutation.mutate();
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const featuredTeams = teamsData?.slice(0, 4) || [];

  const { data: featuredPlayers = [] } = useQuery<any[]>({
    queryKey: ['featuredPlayers'],
    queryFn: async () => {
      const res = await api.get<{ players: any[] }>('/players?limit=4');
      return res.players || [];
    },
  });

  const faqItems = [
    {
      q: 'How does the AI Match Prediction engine calculate probabilities?',
      a: 'The engine feeds real-time inputs (team rankings, squad records, top players, recent form sequences, weather forecasts, and injury updates) into Gemini-powered reasoning agents. The agent models attacking shapes against defensive low blocks to yield estimated goals and probabilities.'
    },
    {
      q: 'Can I add custom national squads to the platform?',
      a: 'Yes, absolutely. By signing into your account, you can access the "Add Team" interface to create, update, or remove customized country team profiles to simulate matches.'
    },
    {
      q: 'What stats are used to track team performance?',
      a: 'We track overall FIFA ranking details, squad depth size, World Cup titles won, possession ratios, win-rate timelines, and historical matches played.'
    }
  ];

  // Colors for Recharts Pie Chart
  const COLORS = ['#10B981', '#06B6D4', '#6366F1', '#3B82F6', '#EC4899', '#F59E0B'];

  // Default fallback charts data
  const defaultPerformanceStats = [
    { name: 'Argentina', winRate: 78, possession: 60, goals: 34 },
    { name: 'France', winRate: 72, possession: 57, goals: 30 },
    { name: 'Spain', winRate: 75, possession: 64, goals: 28 },
    { name: 'Brazil', winRate: 70, possession: 59, goals: 32 },
    { name: 'England', winRate: 68, possession: 55, goals: 26 },
  ];

  const defaultConfDistribution = [
    { name: 'UEFA', value: 5 },
    { name: 'CONMEBOL', value: 2 },
    { name: 'CAF', value: 1 },
  ];

  const chartData = analyticsData?.performanceStats || defaultPerformanceStats;
  const pieData = analyticsData?.confederationDistribution || defaultConfDistribution;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#070e0a] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <PublicNavbar />

      <main className="flex-1">
        
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 md:pt-28 md:pb-20 text-center max-w-5xl mx-auto px-6 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* AI Banner Pill */}
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-6 animate-pulse">
            <Trophy className="h-3.5 w-3.5" />
            <span>FIFA World Cup AI Analytics Engine</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.12] max-w-4xl mx-auto">
            Simulate & Dissect Football <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 dark:from-emerald-400 dark:via-teal-400 dark:to-indigo-400 bg-clip-text text-transparent">
              With WorldCupX AI Agents
            </span>
          </h1>

          <p className="mt-6 text-sm md:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Harness multimodal LLMs to analyze squad profiles, tactical setups, and match conditions. Get expected goals, win probabilities, and tactical breakdowns instantly.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/documents"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 dark:bg-gradient-to-r dark:from-emerald-500 dark:to-teal-500 hover:opacity-95 px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 group cursor-pointer"
            >
              <span>Explore Squads</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#predict-widget"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 px-8 py-3.5 text-sm font-bold text-zinc-900 dark:text-white transition-all duration-200 cursor-pointer"
            >
              Run Match Predictor
            </Link>
          </div>
        </section>

        {/* Featured Teams Grid */}
        <section className="border-t border-zinc-200 dark:border-emerald-950/40 bg-zinc-50/50 dark:bg-zinc-950/20 py-16 px-6">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Featured Contenders</h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 font-medium">
                Dissect historical stats and squad lineups for elite FIFA World Cup squads.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredTeams.length > 0 ? (
                featuredTeams.map((team: any) => (
                  <div 
                    key={team._id}
                    className="bg-[#0b120c] border border-emerald-950/60 rounded-xl p-5 flex flex-col justify-between h-[235px] hover:border-emerald-500/40 shadow-sm transition-all duration-200"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="bg-emerald-950/50 border border-emerald-900/40 px-2 py-0.5 rounded text-emerald-400 uppercase">
                          {team.confederation}
                        </span>
                        <span className="text-zinc-550">FIFA Rank: #{team.fifaRanking}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug">{team.name}</h4>
                      <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">{team.description}</p>
                    </div>

                    <div className="flex items-center justify-between border-t border-emerald-950/40 pt-3 mt-3">
                      <span className="text-[10px] text-teal-400 font-bold flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5" />
                        <span>Titles: {team.worldCupTitles}</span>
                      </span>
                      <Link href={`/documents/${team._id}`} className="text-[10px] font-bold text-white hover:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer">
                        <span>Inspect Tactics</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-[235px] bg-[#0b120c] border border-emerald-950/60 rounded-xl animate-pulse" />
                ))
              )}
            </div>

            <div className="text-center pt-2">
              <Link href="/documents" className="text-xs font-bold text-emerald-400 hover:underline inline-flex items-center gap-1">
                <span>View all country analytics</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Top 4 Featured Players Showcase */}
        <section className="border-t border-zinc-200 dark:border-emerald-950/40 py-16 px-6 bg-zinc-50/50 dark:bg-zinc-950/40">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Top Featured Players</h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1 font-medium">
                  The world's highest-performing active football stars rated by goals, awards, and match impact.
                </p>
              </div>
              <Link href="/players" className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
                <span>View All Top 20 Players</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {featuredPlayers.length > 0 ? (
                featuredPlayers.slice(0, 4).map((player: any) => (
                  <Link
                    key={player._id}
                    href={`/players/${player._id}`}
                    className="bg-white dark:bg-[#070e09] border border-zinc-200 dark:border-emerald-950/60 p-5 rounded-2xl flex flex-col items-center text-center space-y-3 hover:border-emerald-500/40 transition-all shadow-sm hover:shadow-md group cursor-pointer"
                  >
                    <div className="h-20 w-20 rounded-2xl overflow-hidden border border-zinc-200 dark:border-emerald-500/20 bg-zinc-100 dark:bg-zinc-950">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={player.imageUrl} alt={player.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white group-hover:text-emerald-500 transition-colors">{player.name}</h4>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-semibold mt-0.5">{player.currentClub} • {player.position}</p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/30 px-3 py-1 rounded-xl text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                      {player.goals} Goals • {player.assists} Assists
                    </div>
                  </Link>
                ))
              ) : (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-[200px] bg-white dark:bg-[#070e09] border border-zinc-200 dark:border-emerald-950/60 rounded-2xl animate-pulse" />
                ))
              )}
            </div>
          </div>
        </section>

        {/* AI Match Prediction Widget */}
        <section id="predict-widget" className="border-t border-emerald-950/40 py-20 px-6 bg-[#09100b]/60 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-950/10 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center">
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest block mb-2">Simulate Matchup</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">AI Predictive Simulator</h2>
              <p className="text-xs text-zinc-500 mt-1.5">
                Feed squad form, weather variables, and injury data to get winning probabilities and tactical reviews.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Form Input */}
              <form onSubmit={handlePredict} className="bg-[#0b150f] border border-emerald-950/80 p-6 rounded-2xl space-y-4 shadow-md">
                <h3 className="text-xs font-bold text-white border-b border-emerald-950/40 pb-2">Simulator Variables</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Team 1</label>
                    <input 
                      type="text" 
                      value={team1Name} 
                      onChange={(e) => setTeam1Name(e.target.value)}
                      className="w-full h-9 bg-zinc-950 border border-emerald-950 focus:border-emerald-500 focus:outline-none rounded-lg px-3 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Team 2</label>
                    <input 
                      type="text" 
                      value={team2Name} 
                      onChange={(e) => setTeam2Name(e.target.value)}
                      className="w-full h-9 bg-zinc-950 border border-emerald-950 focus:border-emerald-500 focus:outline-none rounded-lg px-3 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">T1 Form</label>
                    <input 
                      type="text" 
                      value={team1Form} 
                      onChange={(e) => setTeam1Form(e.target.value)}
                      className="w-full h-9 bg-zinc-950 border border-emerald-950 focus:border-emerald-500/50 focus:outline-none rounded-lg px-3 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">T2 Form</label>
                    <input 
                      type="text" 
                      value={team2Form} 
                      onChange={(e) => setTeam2Form(e.target.value)}
                      className="w-full h-9 bg-zinc-950 border border-emerald-950 focus:border-emerald-500/50 focus:outline-none rounded-lg px-3 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">T1 Injuries</label>
                    <input 
                      type="text" 
                      value={team1Injuries} 
                      onChange={(e) => setTeam1Injuries(e.target.value)}
                      className="w-full h-9 bg-zinc-950 border border-emerald-950 focus:border-emerald-500/50 focus:outline-none rounded-lg px-3 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">T2 Injuries</label>
                    <input 
                      type="text" 
                      value={team2Injuries} 
                      onChange={(e) => setTeam2Injuries(e.target.value)}
                      className="w-full h-9 bg-zinc-950 border border-emerald-950 focus:border-emerald-500/50 focus:outline-none rounded-lg px-3 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Weather & Pitch Conditions</label>
                  <input 
                    type="text" 
                    value={weather} 
                    onChange={(e) => setWeather(e.target.value)}
                    className="w-full h-9 bg-zinc-950 border border-emerald-950 focus:border-emerald-500/50 focus:outline-none rounded-lg px-3 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Venue</label>
                  <input 
                    type="text" 
                    value={venue} 
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full h-9 bg-zinc-950 border border-emerald-950 focus:border-emerald-500/50 focus:outline-none rounded-lg px-3 text-xs text-white"
                  />
                </div>

                {!user && (
                  <p className="text-[10px] text-amber-500 font-semibold flex items-center gap-1 bg-amber-500/5 p-2 border border-amber-500/10 rounded-lg">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Using simulated demo prediction. Sign in to save result.</span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={predictionMutation.isPending}
                  className="w-full h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-xs font-bold text-white shadow-lg flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {predictionMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Simulating Tactics...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Generate Prediction</span>
                    </>
                  )}
                </button>
              </form>

              {/* Prediction Result Display */}
              <div className="bg-[#0b150f] border border-emerald-950/80 p-6 rounded-2xl h-full flex flex-col justify-center min-h-[380px]">
                {predictionResult ? (
                  <div className="space-y-5 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-emerald-950/40 pb-3">
                      <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        <Flame className="h-4 w-4 text-emerald-400" />
                        <span>Prediction Report</span>
                      </h4>
                      <span className="text-[10px] text-teal-400 font-bold bg-teal-950/40 border border-teal-900/30 px-2.5 py-0.5 rounded-full">
                        Confidence: {predictionResult.confidenceScore}%
                      </span>
                    </div>

                    {/* Win Probabilities Bar */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Probability Share</span>
                      <div className="h-4 w-full rounded-lg overflow-hidden flex text-[10px] font-extrabold text-white text-center">
                        <div className="bg-emerald-500 flex items-center justify-center" style={{ width: `${predictionResult.winningProbabilityTeam1}%` }}>
                          {predictionResult.winningProbabilityTeam1 >= 15 ? `${predictionResult.winningProbabilityTeam1}%` : ''}
                        </div>
                        <div className="bg-zinc-650 flex items-center justify-center" style={{ width: `${predictionResult.winningProbabilityDraw}%` }}>
                          {predictionResult.winningProbabilityDraw >= 15 ? `${predictionResult.winningProbabilityDraw}%` : ''}
                        </div>
                        <div className="bg-teal-500 flex items-center justify-center" style={{ width: `${predictionResult.winningProbabilityTeam2}%` }}>
                          {predictionResult.winningProbabilityTeam2 >= 15 ? `${predictionResult.winningProbabilityTeam2}%` : ''}
                        </div>
                      </div>
                      <div className="flex justify-between text-[9px] font-bold text-zinc-400 px-1">
                        <span>{team1Name} Win ({predictionResult.winningProbabilityTeam1}%)</span>
                        <span>Draw ({predictionResult.winningProbabilityDraw}%)</span>
                        <span>{team2Name} Win ({predictionResult.winningProbabilityTeam2}%)</span>
                      </div>
                    </div>

                    {/* Expected Goals */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-zinc-950 border border-emerald-950/40 p-2.5 rounded-xl">
                        <span className="text-[9px] text-zinc-500 block uppercase">Expected Goals ({team1Name})</span>
                        <span className="text-xl font-extrabold text-emerald-400">{predictionResult.expectedGoalsTeam1}</span>
                      </div>
                      <div className="bg-zinc-950 border border-emerald-950/40 p-2.5 rounded-xl">
                        <span className="text-[9px] text-zinc-500 block uppercase">Expected Goals ({team2Name})</span>
                        <span className="text-xl font-extrabold text-teal-400">{predictionResult.expectedGoalsTeam2}</span>
                      </div>
                    </div>

                    {/* Key Players */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Key Matchups</span>
                      <p className="text-[10px] text-zinc-350 leading-relaxed font-semibold">
                        <span className="text-emerald-400">{team1Name}:</span> {predictionResult.keyPlayersTeam1?.join(', ') || 'N/A'} <br />
                        <span className="text-teal-400">{team2Name}:</span> {predictionResult.keyPlayersTeam2?.join(', ') || 'N/A'}
                      </p>
                    </div>

                    {/* Summary */}
                    <div className="bg-zinc-950/40 border border-emerald-950/40 p-4 rounded-xl text-xs text-zinc-400 leading-relaxed font-medium">
                      {predictionResult.predictionSummary}
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2 p-6 text-zinc-500">
                    <Trophy className="h-10 w-10 text-emerald-900 mx-auto mb-2" />
                    <h4 className="text-xs font-bold text-zinc-400">Ready to simulate</h4>
                    <p className="text-[10px] max-w-xs mx-auto">
                      Fill out the matching options on the left and click "Generate Prediction" to start AI simulations.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* World Cup Statistics Recharts Section */}
        <section className="border-t border-emerald-950/40 py-20 px-6 bg-zinc-950/30">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Database Analytics</h2>
              <p className="text-xs text-zinc-500 mt-2">
                Comparative metrics and confederation distribution for all recorded national squads.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Win Rate / Goals chart */}
              <div className="bg-[#0b120c] border border-emerald-950/60 p-6 rounded-2xl shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-emerald-950/40 pb-2">
                  <BarChart3 className="h-4 w-4 text-emerald-400" />
                  <span>Win Rate & Goals Statistics</span>
                </h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" stroke="#52525b" fontSize={10} />
                      <YAxis stroke="#52525b" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#070e0a', borderColor: '#14532d', color: '#fff', fontSize: '11px' }} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Bar dataKey="winRate" name="Win Rate (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="goals" name="Goals Scored" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Confederation Pie Chart */}
              <div className="bg-[#0b120c] border border-emerald-950/60 p-6 rounded-2xl shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-emerald-950/40 pb-2">
                  <Activity className="h-4 w-4 text-teal-400" />
                  <span>Confederation Breakdown</span>
                </h4>
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#070e0a', borderColor: '#14532d', color: '#fff', fontSize: '11px' }} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Insights & Latest Articles */}
        <section className="border-t border-zinc-200 dark:border-emerald-950/40 py-20 px-6 bg-white dark:bg-[#070e0a]">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">AI Tactical Insights</h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-2 font-medium">
                Latest articles exploring structural setups and game models.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950/60 p-6.5 rounded-2xl flex flex-col hover:border-emerald-500/30 shadow-sm transition-all">
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-2">Tactical Trend</span>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white mb-2">The Rise of the Asymmetric 3-2-5 Shape</h3>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed flex-1 font-medium">
                  How modern managers deploy wingbacks into high half-space overload models during the World Cup tournaments.
                </p>
                <Link href="/blog" className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline mt-4 inline-flex items-center gap-1 cursor-pointer">
                  <span>Read Article</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950/60 p-6.5 rounded-2xl flex flex-col hover:border-emerald-500/30 shadow-sm transition-all">
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-2">Scouting Profile</span>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white mb-2">Lamine Yamal & Dynamic 1v1 Isolations</h3>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed flex-1 font-medium">
                  Analyzing Spain's teenager winger, focusing on progressive carry metrics and key passes inside final third zones.
                </p>
                <Link href="/blog" className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline mt-4 inline-flex items-center gap-1 cursor-pointer">
                  <span>Read Article</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950/60 p-6.5 rounded-2xl flex flex-col hover:border-emerald-500/30 shadow-sm transition-all">
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-2">Match Review</span>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white mb-2">World Cup Knockout Counter-Press Models</h3>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed flex-1 font-medium">
                  A comprehensive breakdown of how Morocco utilized a low defensive block to shut down passing lanes.
                </p>
                <Link href="/blog" className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline mt-4 inline-flex items-center gap-1 cursor-pointer">
                  <span>Read Article</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-t border-zinc-200 dark:border-emerald-950/40 py-20 px-6 bg-zinc-50/50 dark:bg-zinc-950/40">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Expert Testimonials</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-500 mt-2 font-medium">What football analysts say about WorldCupX.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950/40 p-6 rounded-2xl space-y-3 shadow-sm">
                <div className="flex gap-1 text-emerald-600 dark:text-emerald-400">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed italic font-medium">
                  "WorldCupX's match simulator predicted expected goals with scary accuracy. The tactical breakdowns are deep and save hours of match scouting."
                </p>
                <div className="text-[10px] font-bold text-zinc-900 dark:text-white">
                  — Marcus Vance, Sports Analytics Director
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950/40 p-6 rounded-2xl space-y-3 shadow-sm">
                <div className="flex gap-1 text-emerald-600 dark:text-emerald-400">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed italic font-medium">
                  "As a football enthusiast, being able to simulate matches while tweaking injuries and weather conditions makes this the most interactive fan platform out there."
                </p>
                <div className="text-[10px] font-bold text-zinc-900 dark:text-white">
                  — Sarah Jenkins, Football Podcaster
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section id="faq" className="border-t border-zinc-200 dark:border-emerald-950/40 bg-white dark:bg-[#070e0a]/80 py-20 px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Frequently Asked Questions</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-500 mt-2 font-medium">Have questions about WorldCupX? We have answers.</p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div key={idx} className="rounded-xl border border-zinc-200 dark:border-emerald-950/60 bg-white dark:bg-[#070e09] overflow-hidden transition-all shadow-sm">
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between p-5 text-left text-xs font-extrabold text-zinc-900 dark:text-white focus:outline-none cursor-pointer"
                    >
                      <span>{item.q}</span>
                      <ChevronDown className={`h-4 w-4 text-emerald-600 dark:text-emerald-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-200 dark:border-emerald-950/30 pt-3 font-medium">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="border-t border-zinc-200 dark:border-emerald-950/40 bg-zinc-50/50 dark:bg-zinc-950/40 py-20 px-6">
          <div className="max-w-xl mx-auto text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Subscribe to Tactical Dispatch</h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto font-medium">
              Receive weekly match prediction updates, AI simulation breakdowns, and tactical essays directly in your inbox.
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-1 h-10.5 bg-zinc-950 border border-emerald-950 focus:border-emerald-500 focus:outline-none rounded-xl px-4 text-xs text-white"
              />
              <button className="h-10.5 px-6 rounded-xl bg-emerald-500 hover:opacity-90 font-bold text-xs text-white flex items-center gap-1.5 cursor-pointer">
                <span>Subscribe</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>

      </main>

      <PublicFooter />
    </div>
  );
}
