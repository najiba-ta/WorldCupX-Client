'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/use-auth';
import { api } from '../../../services/api';
import { Pencil, Save, X, Star, StarOff, CheckCircle2, XCircle, Image, ShieldAlert, Globe, Search } from 'lucide-react';
import Link from 'next/link';

interface Team {
  _id: string;
  name: string;
  confederation: string;
  fifaRanking: number;
  worldCupTitles: number;
  coach: string;
  imageUrl?: string;
  status: string;
  isFeatured: boolean;
}

export default function AdminManageTeamsPage() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchQ, setSearchQ] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Team>>({});

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
    queryKey: ['adminAllTeams'],
    queryFn: async () => {
      const res = await api.get<{ teams: Team[] }>('/teams?limit=200');
      return res.teams || [];
    },
  });

  const teams: Team[] = (data || []).filter(t =>
    t.name?.toLowerCase().includes(searchQ.toLowerCase()) ||
    t.confederation?.toLowerCase().includes(searchQ.toLowerCase())
  );

  const editMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Team> }) =>
      api.put(`/admin/teams/${id}/edit`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAllTeams'] });
      queryClient.invalidateQueries({ queryKey: ['exploreTeams'] });
      setEditingId(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      api.put(`/admin/teams/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminAllTeams'] }),
  });

  const featureMutation = useMutation({
    mutationFn: async (id: string) => api.put(`/admin/teams/${id}/feature`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminAllTeams'] }),
  });

  const startEdit = (t: Team) => {
    setEditingId(t._id);
    setEditForm({ name: t.name, confederation: t.confederation, fifaRanking: t.fifaRanking, worldCupTitles: t.worldCupTitles, coach: t.coach, imageUrl: t.imageUrl });
  };

  if (authLoading || isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-[#070e0a]"><div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#070e0a] text-zinc-100">
      <div className="border-b border-emerald-950/60 bg-[#0b120c] px-6 py-5 flex items-center justify-between sticky top-0 z-20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">Admin Control</span>
          </div>
          <h1 className="text-lg font-extrabold text-white">Manage Teams</h1>
          <p className="text-[10px] text-zinc-500 mt-0.5">{teams.length} teams</p>
        </div>
        <Link href="/dashboard" className="text-xs font-bold text-zinc-500 hover:text-emerald-400 transition-colors">← Dashboard</Link>
      </div>

      <div className="px-6 pt-5 pb-3">
        <div className="flex items-center gap-2 bg-zinc-900 border border-emerald-950/60 rounded-2xl px-4 py-2.5 max-w-md">
          <Search className="h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-zinc-600 outline-none w-full"
          />
        </div>
      </div>

      <div className="px-6 pb-10 space-y-3">
        {teams.map(team => (
          <div key={team._id} className="bg-[#0b120c] border border-emerald-950/50 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-4 p-4">
              <div className="h-12 w-12 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-emerald-950/40 flex items-center justify-center">
                {team.imageUrl ? (
                  <img src={team.imageUrl} alt={team.name} className="h-full w-full object-cover" />
                ) : (
                  <Globe className="h-5 w-5 text-zinc-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-white truncate">{team.name}</p>
                <p className="text-[10px] text-zinc-400">{team.confederation} · FIFA #{team.fifaRanking} · Coach: {team.coach}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">🏆 {team.worldCupTitles} World Cup titles</p>
              </div>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${team.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                {team.status}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => featureMutation.mutate(team._id)} className={`p-1.5 rounded-lg cursor-pointer transition-colors ${team.isFeatured ? 'text-amber-400 bg-amber-500/10' : 'text-zinc-500 hover:text-amber-400'}`}>
                  {team.isFeatured ? <Star className="h-3.5 w-3.5 fill-current" /> : <StarOff className="h-3.5 w-3.5" />}
                </button>
                <button onClick={() => statusMutation.mutate({ id: team._id, status: team.status === 'approved' ? 'pending' : 'approved' })} className="p-1.5 rounded-lg cursor-pointer text-zinc-500 hover:text-emerald-400 transition-colors">
                  {team.status === 'approved' ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                </button>
                <button onClick={() => startEdit(team)} className="p-1.5 rounded-lg cursor-pointer text-zinc-500 hover:text-blue-400 transition-colors">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {editingId === team._id && (
              <div className="border-t border-emerald-950/40 px-4 py-4 bg-zinc-950/50">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-500 mb-4 flex items-center gap-2">
                  <Pencil className="h-3 w-3" /> Edit Team Info
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'name', label: 'Country Name', type: 'text' },
                    { key: 'confederation', label: 'Confederation', type: 'text' },
                    { key: 'fifaRanking', label: 'FIFA Ranking', type: 'number' },
                    { key: 'worldCupTitles', label: 'World Cup Titles', type: 'number' },
                    { key: 'coach', label: 'Head Coach', type: 'text' },
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
                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="block text-[9px] font-extrabold uppercase tracking-wider text-zinc-500 mb-1 flex items-center gap-1"><Image className="h-3 w-3" /> Team Image / Flag URL</label>
                    <input
                      type="url"
                      value={editForm.imageUrl || ''}
                      onChange={e => setEditForm(f => ({ ...f, imageUrl: e.target.value }))}
                      placeholder="https://..."
                      className="w-full bg-zinc-900 border border-emerald-950/60 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                    />
                    {editForm.imageUrl && (
                      <div className="mt-2 flex items-center gap-2">
                        <img src={editForm.imageUrl} alt="preview" className="h-14 w-20 rounded-xl object-cover border border-emerald-950/40" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <p className="text-[9px] text-zinc-500">Preview</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <button onClick={() => editMutation.mutate({ id: team._id, updates: editForm })} disabled={editMutation.isPending} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-50">
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
      </div>
    </div>
  );
}
