'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  ShieldCheck, CheckCircle2, XCircle, Star, Edit3, Trash2, 
  Users, Trophy, User, PlusCircle, AlertCircle, Sparkles, RefreshCw, Image as ImageIcon
} from 'lucide-react';
import { api } from '../../services/api';
import { Spinner } from '../ui/spinner';

export function AdminDashboardView() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'pending' | 'teams' | 'players'>('pending');

  // Image Edit State
  const [editingItem, setEditingItem] = useState<{ id: string; type: 'team' | 'player'; name: string; imageUrl: string } | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Fetch admin stats
  const { data: adminStatsData } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await api.get<{ stats: any }>('/admin/stats');
      return res.stats;
    },
  });

  // Fetch pending submissions
  const { data: pendingData, isLoading: pendingLoading, refetch: refetchPending } = useQuery({
    queryKey: ['adminPending'],
    queryFn: async () => {
      const res = await api.get<{ pendingTeams: any[]; pendingPlayers: any[]; totalPending: number }>('/admin/pending');
      return res;
    },
  });

  // Fetch all teams for admin management
  const { data: allTeams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['adminAllTeams'],
    queryFn: async () => {
      const res = await api.get<{ teams: any[] }>('/teams?status=all&limit=200');
      return res.teams || [];
    },
  });

  // Fetch all players for admin management
  const { data: allPlayers = [], isLoading: playersLoading } = useQuery({
    queryKey: ['adminAllPlayers'],
    queryFn: async () => {
      const res = await api.get<{ players: any[] }>('/players?status=all&limit=200');
      return res.players || [];
    },
  });

  // Approve / Reject Team mutation
  const teamStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      return api.put(`/admin/teams/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPending'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminAllTeams'] });
      queryClient.invalidateQueries({ queryKey: ['exploreTeams'] });
    },
  });

  // Approve / Reject Player mutation
  const playerStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      return api.put(`/admin/players/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPending'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminAllPlayers'] });
      queryClient.invalidateQueries({ queryKey: ['explorePlayers'] });
    },
  });

  // Toggle Featured Team mutation
  const toggleTeamFeaturedMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.put(`/admin/teams/${id}/feature`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAllTeams'] });
      queryClient.invalidateQueries({ queryKey: ['exploreTeams'] });
    },
  });

  // Toggle Featured Player mutation
  const togglePlayerFeaturedMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.put(`/admin/players/${id}/feature`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAllPlayers'] });
      queryClient.invalidateQueries({ queryKey: ['explorePlayers'] });
    },
  });

  // Save Edit Image mutation
  const saveImageMutation = useMutation({
    mutationFn: async () => {
      if (!editingItem || !newImageUrl.trim()) return;
      if (editingItem.type === 'team') {
        return api.post('/teams', { name: editingItem.name, imageUrl: newImageUrl.trim(), confederation: 'UEFA', fifaRanking: 1 });
      } else {
        return api.post('/players', { name: editingItem.name, imageUrl: newImageUrl.trim(), currentClub: 'Club', nationalTeam: 'Nation', position: 'Forward' });
      }
    },
    onSuccess: () => {
      setEditingItem(null);
      setNewImageUrl('');
      queryClient.invalidateQueries({ queryKey: ['adminAllTeams'] });
      queryClient.invalidateQueries({ queryKey: ['adminAllPlayers'] });
      queryClient.invalidateQueries({ queryKey: ['exploreTeams'] });
      queryClient.invalidateQueries({ queryKey: ['explorePlayers'] });
    },
  });

  const pendingTeams = pendingData?.pendingTeams || [];
  const pendingPlayers = pendingData?.pendingPlayers || [];
  const totalPending = pendingData?.totalPending || 0;

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-[#0b150f] to-zinc-950 p-6 md:p-8 rounded-3xl border border-emerald-900/60 shadow-lg">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-xs font-extrabold text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Admin Control Center</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">System Moderation & Management</h1>
          <p className="text-xs text-zinc-400 font-medium">Approve user submissions, edit player/team images, and manage featured items.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/documents/add"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Team</span>
          </Link>
          <Link
            href="/players/add"
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Player</span>
          </Link>
        </div>
      </div>

      {/* Admin KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950/60 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Pending Approvals</span>
            <h3 className="text-2xl font-black text-amber-500">{totalPending}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950/60 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Total Teams</span>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white">{adminStatsData?.approvedTeamsCount || allTeams.length}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
            <Trophy className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950/60 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Total Players</span>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white">{adminStatsData?.approvedPlayersCount || allPlayers.length}</h3>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-500 rounded-xl border border-teal-500/20">
            <User className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950/60 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Registered Users</span>
            <h3 className="text-2xl font-black text-indigo-500">{adminStatsData?.totalUsers || 1}</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl border border-indigo-500/20">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 dark:border-emerald-950/60 pb-3">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          <span>Pending Approvals ({totalPending})</span>
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'teams'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Trophy className="h-4 w-4" />
          <span>Manage Teams ({allTeams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('players')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'players'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Manage Players ({allPlayers.length})</span>
        </button>

        {/* Dedicated Admin Pages */}
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/admin/teams"
            className="px-3 py-2 rounded-xl text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-emerald-400 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-emerald-950/40 flex items-center gap-1.5 transition-all"
          >
            <Trophy className="h-3.5 w-3.5" /> Full Teams Page
          </Link>
          <Link
            href="/admin/players"
            className="px-3 py-2 rounded-xl text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-emerald-400 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-emerald-950/40 flex items-center gap-1.5 transition-all"
          >
            <User className="h-3.5 w-3.5" /> Full Players Page
          </Link>
          <Link
            href="/admin/users"
            className="px-3 py-2 rounded-xl text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-emerald-400 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-emerald-950/40 flex items-center gap-1.5 transition-all"
          >
            <Users className="h-3.5 w-3.5" /> Manage Users
          </Link>
        </div>
      </div>

      {/* Tab 1: Pending Approvals Queue */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          {totalPending === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-300 dark:border-emerald-950/60 p-12 text-center bg-zinc-50/50 dark:bg-[#0b120c]/40 space-y-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">All Submissions Approved</h4>
              <p className="text-xs text-zinc-500">There are no pending user-submitted teams or players awaiting review.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Pending Teams Section */}
              {pendingTeams.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-emerald-500" />
                    <span>Pending Teams ({pendingTeams.length})</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingTeams.map((team: any) => (
                      <div key={team._id} className="bg-white dark:bg-[#0b120c] border border-amber-500/30 p-5 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <img src={team.imageUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=150&auto=format&fit=crop'} alt={team.name} className="h-12 w-12 rounded-xl object-cover border border-zinc-200 dark:border-emerald-950 shrink-0" />
                          <div className="overflow-hidden">
                            <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white truncate">{team.name}</h4>
                            <p className="text-[10px] text-zinc-500 font-medium truncate">{team.confederation} • Rank #{team.fifaRanking}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[9px] font-bold">Pending Review</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => teamStatusMutation.mutate({ id: team._id, status: 'approved' })}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => teamStatusMutation.mutate({ id: team._id, status: 'rejected' })}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending Players Section */}
              {pendingPlayers.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <User className="h-4 w-4 text-teal-500" />
                    <span>Pending Players ({pendingPlayers.length})</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingPlayers.map((player: any) => (
                      <div key={player._id} className="bg-white dark:bg-[#0b120c] border border-amber-500/30 p-5 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <img src={player.imageUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=150&auto=format&fit=crop'} alt={player.name} className="h-12 w-12 rounded-xl object-cover border border-zinc-200 dark:border-emerald-950 shrink-0" />
                          <div className="overflow-hidden">
                            <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white truncate">{player.name}</h4>
                            <p className="text-[10px] text-zinc-500 font-medium truncate">{player.currentClub} • {player.nationalTeam}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[9px] font-bold">Pending Review</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => playerStatusMutation.mutate({ id: player._id, status: 'approved' })}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => playerStatusMutation.mutate({ id: player._id, status: 'rejected' })}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* Tab 2: Manage Teams */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allTeams.map((team: any) => (
              <div key={team._id} className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950/60 p-4 rounded-2xl flex flex-col justify-between h-44 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img src={team.imageUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=150&auto=format&fit=crop'} alt={team.name} className="h-12 w-12 rounded-xl object-cover border border-zinc-200 dark:border-emerald-950 shrink-0" />
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white truncate">{team.name}</h4>
                      <p className="text-[10px] text-zinc-500 font-medium truncate">{team.confederation} • Rank #{team.fifaRanking}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold ${team.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {team.status === 'pending' ? 'Pending' : 'Published'}
                      </span>
                    </div>
                  </div>

                  {/* Feature Star Toggle */}
                  <button
                    onClick={() => toggleTeamFeaturedMutation.mutate(team._id)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${team.isFeatured ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-emerald-950 text-zinc-400 hover:text-amber-500'}`}
                    title={team.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
                  >
                    <Star className={`h-4 w-4 ${team.isFeatured ? 'fill-amber-500' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-200 dark:border-emerald-950/60 pt-3">
                  <button
                    onClick={() => {
                      setEditingItem({ id: team._id, type: 'team', name: team.name, imageUrl: team.imageUrl || '' });
                      setNewImageUrl(team.imageUrl || '');
                    }}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Edit Image</span>
                  </button>

                  <button
                    onClick={() => teamStatusMutation.mutate({ id: team._id, status: 'rejected' })}
                    className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Manage Players */}
      {activeTab === 'players' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPlayers.map((player: any) => (
              <div key={player._id} className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950/60 p-4 rounded-2xl flex flex-col justify-between h-44 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img src={player.imageUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=150&auto=format&fit=crop'} alt={player.name} className="h-12 w-12 rounded-xl object-cover border border-zinc-200 dark:border-emerald-950 shrink-0" />
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white truncate">{player.name}</h4>
                      <p className="text-[10px] text-zinc-500 font-medium truncate">{player.currentClub} • {player.nationalTeam}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold ${player.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {player.status === 'pending' ? 'Pending' : 'Published'}
                      </span>
                    </div>
                  </div>

                  {/* Feature Star Toggle */}
                  <button
                    onClick={() => togglePlayerFeaturedMutation.mutate(player._id)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${player.isFeatured ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-emerald-950 text-zinc-400 hover:text-amber-500'}`}
                    title={player.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
                  >
                    <Star className={`h-4 w-4 ${player.isFeatured ? 'fill-amber-500' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-200 dark:border-emerald-950/60 pt-3">
                  <button
                    onClick={() => {
                      setEditingItem({ id: player._id, type: 'player', name: player.name, imageUrl: player.imageUrl || '' });
                      setNewImageUrl(player.imageUrl || '');
                    }}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Edit Image</span>
                  </button>

                  <button
                    onClick={() => playerStatusMutation.mutate({ id: player._id, status: 'rejected' })}
                    className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-emerald-950/60 pb-3">
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">Edit Image for {editingItem.name}</h3>
              <button onClick={() => setEditingItem(null)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">New Image URL</label>
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full h-11 px-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 rounded-xl text-xs"
              />

              {newImageUrl && (
                <div className="h-32 w-full rounded-xl overflow-hidden border border-zinc-200 dark:border-emerald-950">
                  <img src={newImageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setEditingItem(null)} className="px-4 py-2 rounded-xl border text-xs font-bold cursor-pointer">Cancel</button>
              <button
                onClick={() => saveImageMutation.mutate()}
                disabled={saveImageMutation.isPending}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer shadow-sm"
              >
                {saveImageMutation.isPending ? 'Saving...' : 'Update Image'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
