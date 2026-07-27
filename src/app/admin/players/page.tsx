'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/use-auth';
import { api } from '../../../services/api';
import { Pencil, Trash2, Save, X, Star, StarOff, CheckCircle2, XCircle, Image, ShieldAlert, Users, ChevronDown, ChevronUp, Search } from 'lucide-react';
import Link from 'next/link';

interface Player {
  _id: string;
  name: string;
  currentClub: string;
  nationalTeam: string;
  position: string;
  age: number;
  goals: number;
  assists: number;
  matchesPlayed: number;
  imageUrl: string;
  status: string;
  isFeatured: boolean;
  ranking?: number;
}

export default function AdminManagePlayersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQ, setSearchQ] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Player>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Auth guard
  if (!authLoading && user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#070e0a] text-white gap-4">
        <ShieldAlert className="h-12 w-12 text-rose-500" />
        <h1 className="text-2xl font-black text-rose-400">Admin Access Only</h1>
        <p className="text-sm text-zinc-500">You do not have permission to view this page.</p>
        <Link href="/dashboard" className="text-xs font-bold text-emerald-400 hover:underline">← Back to Dashboard</Link>
      </div>
    );
  }

  const { data, isLoading } = useQuery({
    queryKey: ['adminAllPlayers'],
    queryFn: async () => {
      const res = await api.get<{ players: Player[] }>('/players?status=all&limit=200');
      return res.players || [];
    },
  });

  const players: Player[] = (data || []).filter(p =>
    p.name?.toLowerCase().includes(searchQ.toLowerCase()) ||
    p.currentClub?.toLowerCase().includes(searchQ.toLowerCase())
  );

  const editMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Player> }) =>
      api.put(`/admin/players/${id}/edit`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAllPlayers'] });
      queryClient.invalidateQueries({ queryKey: ['explorePlayers'] });
      setEditingId(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      api.put(`/admin/players/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminAllPlayers'] }),
  });

  const featureMutation = useMutation({
    mutationFn: async (id: string) => api.put(`/admin/players/${id}/feature`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminAllPlayers'] }),
  });

  const startEdit = (p: Player) => {
    setEditingId(p._id);
    setEditForm({ name: p.name, currentClub: p.currentClub, nationalTeam: p.nationalTeam, position: p.position, age: p.age, goals: p.goals, assists: p.assists, matchesPlayed: p.matchesPlayed, imageUrl: p.imageUrl, ranking: p.ranking });
    setExpandedId(null);
  };

  const saveEdit = (id: string) => editMutation.mutate({ id, updates: editForm });

  if (authLoading || isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-[#070e0a]"><div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#070e0a] text-zinc-100">
      {/* Header */}
      <div className="border-b border-emerald-950/60 bg-[#0b120c] px-6 py-5 flex items-center justify-between sticky top-0 z-20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">Admin Control</span>
          </div>
          <h1 className="text-lg font-extrabold text-white">Manage Players</h1>
          <p className="text-[10px] text-zinc-500 mt-0.5">{players.length} players found</p>
        </div>
        <Link href="/dashboard" className="text-xs font-bold text-zinc-500 hover:text-emerald-400 transition-colors">← Dashboard</Link>
      </div>

      {/* Search */}
      <div className="px-6 pt-5 pb-3">
        <div className="flex items-center gap-2 bg-zinc-900 border border-emerald-950/60 rounded-2xl px-4 py-2.5 max-w-md">
          <Search className="h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by name or club..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-zinc-600 outline-none w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="px-6 pb-10 space-y-3">
        {players.map(player => (
          <div
            key={player._id}
            className="bg-[#0b120c] border border-emerald-950/50 rounded-2xl overflow-hidden"
          >
            {/* Row */}
            <div className="flex items-center gap-4 p-4">
              {/* Image */}
              <div className="h-12 w-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-emerald-950/40">
                {player.imageUrl ? (
                  <img src={player.imageUrl} alt={player.name} className="h-full w-full object-cover object-top" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-zinc-600 text-xs font-bold">{player.name?.[0]}</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-white truncate">{player.name}</p>
                <p className="text-[10px] text-zinc-400">{player.currentClub} · {player.nationalTeam} · {player.position}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">⚽ {player.goals} goals · 🎯 {player.assists} assists · 📋 {player.matchesPlayed} matches</p>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${player.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : player.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                  {player.status}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => featureMutation.mutate(player._id)}
                  title={player.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                  className={`p-1.5 rounded-lg cursor-pointer transition-colors ${player.isFeatured ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-500 hover:text-amber-400'}`}
                >
                  {player.isFeatured ? <Star className="h-3.5 w-3.5 fill-current" /> : <StarOff className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => statusMutation.mutate({ id: player._id, status: player.status === 'approved' ? 'pending' : 'approved' })}
                  title="Toggle approve/pending"
                  className="p-1.5 rounded-lg cursor-pointer text-zinc-500 hover:text-emerald-400 transition-colors"
                >
                  {player.status === 'approved' ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => startEdit(player)}
                  title="Edit player"
                  className="p-1.5 rounded-lg cursor-pointer text-zinc-500 hover:text-blue-400 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setExpandedId(expandedId === player._id ? null : player._id)}
                  className="p-1.5 rounded-lg cursor-pointer text-zinc-500 hover:text-white transition-colors"
                >
                  {expandedId === player._id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Edit Form */}
            {editingId === player._id && (
              <div className="border-t border-emerald-950/40 px-4 py-4 bg-zinc-950/50">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-500 mb-4 flex items-center gap-2">
                  <Pencil className="h-3 w-3" /> Edit Player Info
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'name', label: 'Name', type: 'text' },
                    { key: 'currentClub', label: 'Current Club', type: 'text' },
                    { key: 'nationalTeam', label: 'National Team', type: 'text' },
                    { key: 'position', label: 'Position', type: 'text' },
                    { key: 'age', label: 'Age', type: 'number' },
                    { key: 'goals', label: 'Goals', type: 'number' },
                    { key: 'assists', label: 'Assists', type: 'number' },
                    { key: 'matchesPlayed', label: 'Matches Played', type: 'number' },
                    { key: 'ranking', label: 'Ranking #', type: 'number' },
                  ].map(({ key, label, type }) => (
                    <div key={key}>
                      <label className="block text-[9px] font-extrabold uppercase tracking-wider text-zinc-500 mb-1">{label}</label>
                      <input
                        type={type}
                        value={(editForm as any)[key] || ''}
                        onChange={e => setEditForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                        className="w-full bg-zinc-900 border border-emerald-950/60 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                      />
                    </div>
                  ))}
                  {/* Image URL full width */}
                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="block text-[9px] font-extrabold uppercase tracking-wider text-zinc-500 mb-1 flex items-center gap-1"><Image className="h-3 w-3" /> Player Image URL</label>
                    <input
                      type="url"
                      value={editForm.imageUrl || ''}
                      onChange={e => setEditForm(f => ({ ...f, imageUrl: e.target.value }))}
                      placeholder="https://..."
                      className="w-full bg-zinc-900 border border-emerald-950/60 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                    />
                    {editForm.imageUrl && (
                      <div className="mt-2 flex items-center gap-2">
                        <img src={editForm.imageUrl} alt="preview" className="h-16 w-16 rounded-xl object-cover object-top border border-emerald-950/40" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <p className="text-[9px] text-zinc-500">Preview</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => saveEdit(player._id)}
                    disabled={editMutation.isPending}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {editMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button onClick={() => setEditingId(null)} className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-white px-3 py-2 rounded-xl cursor-pointer">
                    <X className="h-3.5 w-3.5" /> Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {players.length === 0 && (
          <div className="text-center py-20 text-zinc-600">
            <Users className="h-10 w-10 mx-auto mb-3" />
            <p className="text-sm font-bold">No players found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
