'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/use-auth';
import { api } from '../../../services/api';
import { ShieldAlert, Users, Search, AlertTriangle, X, Send, Trash2, ShieldCheck, ShieldX, Crown } from 'lucide-react';
import Link from 'next/link';

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  favoriteTeams?: string[];
  favoritePlayers?: string[];
}

export default function AdminManageUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchQ, setSearchQ] = useState('');
  const [warningUserId, setWarningUserId] = useState<string | null>(null);
  const [warningMsg, setWarningMsg] = useState('');
  const [warningSuccess, setWarningSuccess] = useState(false);

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
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await api.get<{ users: UserRecord[] }>('/admin/users');
      return res.users || [];
    },
  });

  const users: UserRecord[] = (data || []).filter(u =>
    u.name?.toLowerCase().includes(searchQ.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQ.toLowerCase())
  );

  const warnMutation = useMutation({
    mutationFn: async () => api.post('/notifications/admin-warning', { targetUserId: warningUserId, message: warningMsg }),
    onSuccess: () => {
      setWarningSuccess(true);
      setWarningMsg('');
      setTimeout(() => { setWarningUserId(null); setWarningSuccess(false); }, 2000);
    },
  });

  const defaultWarning = (name: string) =>
    `⚠️ Warning: Dear ${name}, our admin team has noticed that you may have submitted incorrect or inaccurate information to WorldCupX. Please ensure all submissions are factual and accurate. If this happens again, your account may be removed from the platform.`;

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
          <h1 className="text-lg font-extrabold text-white">Manage Users</h1>
          <p className="text-[10px] text-zinc-500 mt-0.5">{users.length} registered users</p>
        </div>
        <Link href="/dashboard" className="text-xs font-bold text-zinc-500 hover:text-emerald-400 transition-colors">← Dashboard</Link>
      </div>

      <div className="px-6 pt-5 pb-3">
        <div className="flex items-center gap-2 bg-zinc-900 border border-emerald-950/60 rounded-2xl px-4 py-2.5 max-w-md">
          <Search className="h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-zinc-600 outline-none w-full"
          />
        </div>
      </div>

      <div className="px-6 pb-10 space-y-3">
        {users.map(u => (
          <div key={u._id} className="bg-[#0b120c] border border-emerald-950/50 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-4 p-4">
              {/* Avatar */}
              <div className="h-11 w-11 rounded-full bg-gradient-to-br from-emerald-800 to-zinc-800 border border-emerald-950/40 flex items-center justify-center shrink-0">
                <span className="text-sm font-black text-emerald-300">{u.name?.[0]?.toUpperCase()}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-extrabold text-white truncate">{u.name}</p>
                  {u.role === 'admin' && (
                    <span className="flex items-center gap-1 text-[8px] font-black uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                      <Crown className="h-2.5 w-2.5" /> Admin
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 truncate">{u.email}</p>
                <p className="text-[9px] text-zinc-600 mt-0.5">
                  ❤️ {u.favoritePlayers?.length || 0} fav players · ⭐ {u.favoriteTeams?.length || 0} fav teams
                  {u.createdAt && ` · Joined ${new Date(u.createdAt).toLocaleDateString()}`}
                </p>
              </div>

              {/* Role badge */}
              <span className={`shrink-0 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                {u.role}
              </span>

              {/* Actions */}
              {u.role !== 'admin' && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => { setWarningUserId(u._id); setWarningMsg(defaultWarning(u.name)); setWarningSuccess(false); }}
                    title="Send admin warning"
                    className="p-1.5 rounded-lg cursor-pointer text-zinc-500 hover:text-amber-400 transition-colors"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Warning Panel */}
            {warningUserId === u._id && (
              <div className="border-t border-amber-500/20 px-4 py-4 bg-amber-500/5">
                {warningSuccess ? (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <ShieldCheck className="h-4 w-4" /> Warning sent successfully!
                  </div>
                ) : (
                  <>
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
                      <AlertTriangle className="h-3 w-3" /> Send Warning to {u.name}
                    </h4>
                    <p className="text-[9px] text-zinc-500 mb-3">This warning will appear in the user's notification feed immediately.</p>
                    <textarea
                      rows={4}
                      value={warningMsg}
                      onChange={e => setWarningMsg(e.target.value)}
                      className="w-full bg-zinc-900 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-500 resize-none"
                    />
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => warnMutation.mutate()}
                        disabled={!warningMsg.trim() || warnMutation.isPending}
                        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold px-4 py-2 rounded-xl cursor-pointer disabled:opacity-50 transition-colors"
                      >
                        <Send className="h-3.5 w-3.5" />
                        {warnMutation.isPending ? 'Sending...' : 'Send Warning'}
                      </button>
                      <button onClick={() => setWarningUserId(null)} className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-white px-3 py-2 rounded-xl cursor-pointer">
                        <X className="h-3.5 w-3.5" /> Cancel
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}

        {users.length === 0 && (
          <div className="text-center py-20 text-zinc-600">
            <Users className="h-10 w-10 mx-auto mb-3" />
            <p className="text-sm font-bold">No users found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
