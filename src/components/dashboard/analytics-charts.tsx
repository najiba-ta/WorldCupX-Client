'use client';

import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { Trophy, FolderOpen, Sparkles, Database, BarChart3, Heart, Activity, ShieldAlert } from 'lucide-react';

interface AnalyticsChartsProps {
  data: {
    totalTeams: number;
    favoriteTeamsCount: number;
    totalPredictions: number;
    confederationDistribution: { name: string; value: number }[];
    worldCupsWonDistribution: { name: string; value: number }[];
    performanceStats: {
      name: string;
      fifaRanking: number;
      winRate: number;
      possession: number;
      averageAge: number;
      worldCupTitles: number;
      matchesPlayed: number;
      goals: number;
    }[];
    activityChart: { date: string; predictions: number }[];
  };
}

const COLORS = ['#10b981', '#06b6d4', '#6366f1', '#3b82f6', '#ec4899', '#f59e0b'];

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const {
    totalTeams = 0,
    favoriteTeamsCount = 0,
    totalPredictions = 0,
    confederationDistribution = [],
    worldCupsWonDistribution = [],
    performanceStats = [],
    activityChart = []
  } = data;

  if (totalTeams === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-emerald-950 bg-[#0b120c]/30 p-16 text-center max-w-lg mx-auto space-y-4">
        <Database className="h-12 w-12 text-emerald-900 mx-auto" />
        <h3 className="text-sm font-bold text-white">No Database Squads</h3>
        <p className="text-xs text-zinc-550 max-w-xs mx-auto leading-relaxed">
          Seeding or adding national teams is required to generate database metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Statistic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Total Teams Card */}
        <div className="rounded-2xl border border-emerald-950/60 bg-[#0b120c] p-6 flex items-center gap-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-550 font-extrabold uppercase tracking-wider">Total Teams</p>
            <h3 className="text-2xl font-bold text-white mt-1">{totalTeams}</h3>
          </div>
        </div>

        {/* Favorite Teams Card */}
        <div className="rounded-2xl border border-emerald-950/60 bg-[#0b120c] p-6 flex items-center gap-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Heart className="h-6 w-6 fill-current" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-550 font-extrabold uppercase tracking-wider">Favorite Teams</p>
            <h3 className="text-2xl font-bold text-white mt-1">{favoriteTeamsCount}</h3>
          </div>
        </div>

        {/* Total Predictions Card */}
        <div className="rounded-2xl border border-emerald-950/60 bg-[#0b120c] p-6 flex items-center gap-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-550 font-extrabold uppercase tracking-wider">Predictions Run</p>
            <h3 className="text-2xl font-bold text-white mt-1">{totalPredictions}</h3>
          </div>
        </div>

        {/* Database Status Card */}
        <div className="rounded-2xl border border-emerald-950/60 bg-[#0b120c] p-6 flex items-center gap-4 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Sparkles className="h-5.5 w-5.5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-550 font-extrabold uppercase tracking-wider">Analytics Status</p>
            <h3 className="text-2xl font-bold text-emerald-450 mt-1">Live</h3>
          </div>
        </div>

      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Prediction Activity - Area Chart */}
        <div className="rounded-2xl border border-emerald-950/60 bg-[#0b120c] p-6 flex flex-col h-[380px] shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white">Simulation Activity</h3>
            <p className="text-xs text-zinc-550">Match predictions simulated daily over the past week</p>
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="simulationTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#14532d" opacity={0.2} vertical={false} />
                <XAxis dataKey="date" stroke="#52525b" tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070e0a', borderColor: '#14532d', borderRadius: '12px' }}
                  labelClassName="text-zinc-400 text-xs font-bold"
                  itemStyle={{ color: '#ffffff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="predictions" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#simulationTrend)" name="Predictions Simulated" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confederation Distribution - Pie Chart */}
        <div className="rounded-2xl border border-emerald-950/60 bg-[#0b120c] p-6 flex flex-col h-[380px] shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white">Confederation Distribution</h3>
            <p className="text-xs text-zinc-550">National squads grouped by regional confederations</p>
          </div>
          <div className="flex-1 w-full flex items-center justify-center text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={confederationDistribution}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {confederationDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#070e0a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#070e0a', borderColor: '#14532d', borderRadius: '12px' }}
                  itemStyle={{ color: '#ffffff', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ paddingTop: '20px', color: '#a1a1aa', fontSize: '11px', fontWeight: '500' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Squad Performance - Bar Chart */}
        <div className="lg:col-span-8 rounded-2xl border border-emerald-950/60 bg-[#0b120c] p-6 flex flex-col h-[380px] shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white">Squad Performance Metrics</h3>
            <p className="text-xs text-zinc-550">Win rate percentages and total goals scored per squad</p>
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#14532d" opacity={0.2} vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070e0a', borderColor: '#14532d', borderRadius: '12px' }}
                  itemStyle={{ color: '#ffffff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="winRate" name="Win Rate (%)" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={35} />
                <Bar dataKey="goals" name="Goals Scored" fill="#06b6d4" radius={[6, 6, 0, 0]} maxBarSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* World Cups Won - Bar Chart */}
        <div className="lg:col-span-4 rounded-2xl border border-emerald-950/60 bg-[#0b120c] p-6 flex flex-col h-[380px] shadow-sm">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white">World Cup Legacy</h3>
            <p className="text-xs text-zinc-550">Number of World Cup titles won by national teams</p>
          </div>
          <div className="flex-1 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={worldCupsWonDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#14532d" opacity={0.2} vertical={false} />
                <XAxis dataKey="name" stroke="#52525b" tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070e0a', borderColor: '#14532d', borderRadius: '12px' }}
                  itemStyle={{ color: '#ffffff', fontSize: '12px' }}
                />
                <Bar dataKey="value" name="World Cup Titles" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
export default AnalyticsCharts;
