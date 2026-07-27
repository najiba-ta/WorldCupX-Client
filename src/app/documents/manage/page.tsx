'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  Search, Eye, Trash2, Calendar, Trophy, CheckCircle2, 
  AlertTriangle, ArrowRight, ChevronLeft, ChevronRight, RefreshCw, ShieldAlert, FolderOpen
} from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../hooks/use-auth';
import { Sidebar } from '../../../components/dashboard/sidebar';
import { Navbar } from '../../../components/dashboard/navbar';
import { Spinner } from '../../../components/ui/spinner';

interface TeamData {
  _id: string;
  name: string;
  confederation: string;
  fifaRanking: number;
  squadSize: number;
  worldCupTitles: number;
  coach: string;
  description: string;
  imageUrl?: string;
  creatorId?: string;
  createdAt: string;
}

const ITEMS_PER_PAGE = 8;

export default function ManageTeamsPage() {
  const { user, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  // Fetch all teams
  const { data: teams = [], isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['manageTeams'],
    queryFn: async () => {
      const res = await api.get<{ teams: TeamData[] }>('/teams?limit=500');
      return res.teams || [];
    },
    enabled: !!user,
  });

  // Delete team mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/teams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manageTeams'] });
      setDeleteConfirmId(null);
      setDeleteMessage('Team profile deleted successfully.');
      setTimeout(() => setDeleteMessage(null), 3000);
    },
    onError: (err: any) => {
      setDeleteConfirmId(null);
      alert(err.message || 'Failed to delete team profile. Check permissions.');
    }
  });

  // Filter teams by name or coach
  const filteredTeams = React.useMemo(() => {
    return teams.filter((team) =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.coach.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [teams, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredTeams.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTeams = filteredTeams.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const executeDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-muted">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs font-semibold tracking-wider uppercase text-muted">Initializing session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Navigation Sidebar */}
      <Sidebar className="shrink-0" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable Workspace Panel */}
        <main className="flex-1 overflow-y-auto bg-background/20 p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-foreground tracking-tight">Manage Teams</h1>
              <p className="text-xs text-muted mt-0.5 font-medium">Edit, review, or delete registered country team files.</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => refetch()}
                disabled={isLoading || isRefetching}
                className="h-9 px-3.5 rounded-xl border border-emerald-950 bg-zinc-950 text-xs font-bold text-zinc-400 hover:text-white flex items-center gap-2 hover:bg-emerald-950/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
                <span>Refresh List</span>
              </button>

              <Link href="/documents/add">
                <button className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer">
                  Add National Team
                </button>
              </Link>
            </div>
          </div>

          {/* Delete alerts notification */}
          {deleteMessage && (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-xs text-emerald-450 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{deleteMessage}</span>
            </div>
          )}

          {/* Search filter bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-550" />
            <input
              type="text"
              placeholder="Search by country or coach..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full h-10 bg-zinc-950 border border-emerald-950 focus:border-emerald-500/80 focus:outline-none rounded-xl pl-10 pr-4 text-xs text-white placeholder-zinc-600 transition-colors"
            />
          </div>

          {/* Table list view */}
          {error ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-12 text-center max-w-lg mx-auto flex flex-col items-center gap-3.5">
              <ShieldAlert className="h-10 w-10 text-rose-400" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white font-semibold">Failed to fetch squad listings</h3>
                <p className="text-xs text-rose-300/80">{(error as Error).message || 'An unexpected error occurred.'}</p>
              </div>
              <button
                onClick={() => refetch()}
                className="h-9.5 px-6 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 transition-colors cursor-pointer"
              >
                Retry Request
              </button>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-20 text-zinc-500 text-xs gap-2">
              <Spinner size="md" />
              <span>Loading registered squad profiles...</span>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-emerald-950 bg-[#0b120c]/30 p-16 text-center max-w-md mx-auto space-y-4">
              <FolderOpen className="h-12 w-12 text-zinc-700 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">No teams available</h3>
                <p className="text-xs text-zinc-450 max-w-xs mx-auto leading-relaxed">
                  Clear search terms or register a new team profile.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-[#0b120c] border border-emerald-950/60 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-emerald-950/60 text-zinc-450 bg-zinc-950/50">
                        <th className="p-4 font-bold uppercase tracking-wider">Country Team</th>
                        <th className="p-4 font-bold uppercase tracking-wider">Confederation</th>
                        <th className="p-4 font-bold uppercase tracking-wider">FIFA Rank</th>
                        <th className="p-4 font-bold uppercase tracking-wider">Cups Won</th>
                        <th className="p-4 font-bold uppercase tracking-wider">Head Coach</th>
                        <th className="p-4 font-bold uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-950/40">
                      {paginatedTeams.map((team) => {
                        const isCreator = team.creatorId === (user as any).id || (user as any).role === 'admin';
                        return (
                          <tr key={team._id} className="hover:bg-emerald-950/5 transition-colors font-medium">
                            <td className="p-4 flex items-center gap-3">
                              <div className="h-8 w-11 rounded border border-emerald-950/40 overflow-hidden shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={team.imageUrl} alt={team.name} className="h-full w-full object-cover" />
                              </div>
                              <span className="font-extrabold text-white">{team.name}</span>
                            </td>
                            <td className="p-4">
                              <span className="bg-zinc-950 border border-emerald-950 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-bold">
                                {team.confederation}
                              </span>
                            </td>
                            <td className="p-4 font-bold text-zinc-300">#{team.fifaRanking}</td>
                            <td className="p-4 text-teal-400 font-extrabold flex items-center gap-1">
                              <Trophy className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                              <span>{team.worldCupTitles}</span>
                            </td>
                            <td className="p-4 text-zinc-400">{team.coach}</td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link href={`/dashboard/documents/${team._id}`}>
                                  <button className="h-8 px-3 rounded-lg bg-zinc-950 border border-emerald-950 hover:bg-emerald-950/10 text-xs font-bold text-zinc-300 flex items-center gap-1 cursor-pointer">
                                    <Eye className="h-3.5 w-3.5" />
                                    <span>Inspect</span>
                                  </button>
                                </Link>

                                {deleteConfirmId === team._id ? (
                                  <div className="flex items-center gap-1 animate-in slide-in-from-right-1">
                                    <button
                                      onClick={() => executeDelete(team._id)}
                                      disabled={deleteMutation.isPending}
                                      className="h-8 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white cursor-pointer"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => setDeleteConfirmId(null)}
                                      className="h-8 px-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-white cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setDeleteConfirmId(team._id)}
                                    className="h-8 w-8 rounded-lg bg-zinc-950 border border-emerald-950 hover:border-rose-500/40 hover:bg-rose-955/5 text-zinc-400 hover:text-rose-500 flex items-center justify-center cursor-pointer transition-colors"
                                    title="Delete squad"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-emerald-950/40 pt-4">
                  <span className="text-[11px] text-zinc-550 font-bold">
                    Page {currentPage} of {totalPages} ({filteredTeams.length} squads)
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((c) => Math.max(c - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-emerald-950 bg-zinc-950 text-zinc-400 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`h-8.5 w-8.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            currentPage === pageNum
                              ? 'bg-emerald-500 text-white shadow-md'
                              : 'border border-emerald-950 bg-zinc-950 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage((c) => Math.min(c + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-emerald-950 bg-zinc-950 text-zinc-400 hover:text-white disabled:opacity-30 transition-all cursor-pointer"
                      aria-label="Next Page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
