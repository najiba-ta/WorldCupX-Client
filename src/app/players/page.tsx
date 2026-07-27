'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  Search, Award, Trophy, Heart, ThumbsUp, ThumbsDown, 
  ArrowRight, ShieldAlert, Sparkles, User, Flame, Filter, UserPlus
} from 'lucide-react';
import { api } from '../../services/api';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { useAuth } from '../../hooks/use-auth';
import { usePlayerFavorites } from '../../hooks/use-player-favorites';
import { Spinner } from '../../components/ui/spinner';

export interface PlayerData {
  _id: string;
  name: string;
  ranking?: number;
  currentClub: string;
  nationalTeam: string;
  position: string;
  jerseyNumber: number;
  age: number;
  matchesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  foulsCommitted: number;
  personalAchievements: string[];
  nationalAchievements: string[];
  goodRecords: string[];
  badRecords: string[];
  imageUrl: string;
  likesCount: number;
  unlikesCount: number;
  likedBy?: string[];
  unlikedBy?: string[];
}

export default function PlayersExplorerPage() {
  const { user } = useAuth();
  const { isFavorited, toggleFavorite } = usePlayerFavorites();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [sortBy, setSortBy] = useState<'ranking' | 'goals' | 'assists' | 'likes' | 'matches'>('ranking');

  // Fetch players from backend
  const { data: players = [], isLoading, error, refetch } = useQuery({
    queryKey: ['explorePlayers'],
    queryFn: async () => {
      const res = await api.get<{ players: PlayerData[] }>('/players?limit=50');
      return res.players || [];
    },
  });

  // Like / Unlike mutation
  const likeMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'like' | 'unlike' }) => {
      return api.post(`/players/${id}/like`, { action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['explorePlayers'] });
    },
  });

  const handleLike = (id: string, action: 'like' | 'unlike', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    likeMutation.mutate({ id, action });
  };

  // Filter and sort players
  const filteredPlayers = React.useMemo(() => {
    return players.filter((player) => {
      const matchesSearch = 
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.currentClub.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.nationalTeam.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPos = selectedPosition === 'all' || player.position.toLowerCase() === selectedPosition.toLowerCase();

      return matchesSearch && matchesPos;
    });
  }, [players, searchQuery, selectedPosition]);

  const sortedPlayers = React.useMemo(() => {
    return [...filteredPlayers].sort((a, b) => {
      if (sortBy === 'ranking') return (a.ranking || 99) - (b.ranking || 99);
      if (sortBy === 'goals') return b.goals - a.goals;
      if (sortBy === 'assists') return b.assists - a.assists;
      if (sortBy === 'likes') return b.likesCount - a.likesCount;
      if (sortBy === 'matches') return b.matchesPlayed - a.matchesPlayed;
      return 0;
    });
  }, [filteredPlayers, sortBy]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#070e0a] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 md:px-8 space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 dark:border-emerald-950/60 pb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Flame className="h-3.5 w-3.5" />
              <span>Top 20 Current Football Stars</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Global Player Directory
            </h1>
            <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl font-medium leading-relaxed">
              Explore serial-wise statistics, individual Ballon d'Or achievements, national team honors, and good/bad career records for top active football stars.
            </p>
          </div>

          {/* Quick Stats Pill & Add Player Button */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/players/add"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add New Player</span>
            </Link>

            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950/60 px-4 py-3 rounded-2xl">
              <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Total Players</span>
                <span className="text-sm font-extrabold text-zinc-900 dark:text-white">{players.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-zinc-50 dark:bg-[#0b120c]/60 p-4 rounded-2xl border border-zinc-200 dark:border-emerald-950/60">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search player, club (e.g. Real Madrid), or nation (e.g. Argentina)..."
              className="w-full h-11 pl-10 pr-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Position Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {['all', 'Forward', 'Midfielder', 'Defender', 'Goalkeeper'].map((pos) => (
              <button
                key={pos}
                onClick={() => setSelectedPosition(pos)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all capitalize whitespace-nowrap cursor-pointer ${
                  selectedPosition.toLowerCase() === pos.toLowerCase()
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {pos === 'all' ? 'All Positions' : pos}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="h-11 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 text-xs font-bold text-zinc-900 dark:text-white rounded-xl px-3 focus:outline-none cursor-pointer"
            >
              <option value="ranking">Official Rank (1 to 20)</option>
              <option value="goals">Most Goals</option>
              <option value="assists">Most Assists</option>
              <option value="likes">Most Liked</option>
              <option value="matches">Most Matches</option>
            </select>
          </div>
        </div>

        {/* Players Grid Area */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-zinc-500">
            <Spinner size="lg" />
            <p className="text-xs font-bold uppercase tracking-wider">Loading top 20 football players...</p>
          </div>
        ) : sortedPlayers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-emerald-950/60 p-16 text-center max-w-md mx-auto space-y-4">
            <ShieldAlert className="h-12 w-12 text-emerald-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">No players found</h3>
              <p className="text-xs text-zinc-500">Try adjusting your search criteria or position filter.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedPlayers.map((player, idx) => {
              return (
                <div
                  key={player._id}
                  className="flex flex-col h-[460px] w-full rounded-2xl border border-zinc-200 dark:border-emerald-950/60 bg-white dark:bg-[#0b120c] hover:border-emerald-500/40 shadow-sm transition-all hover:shadow-md overflow-hidden group hover:-translate-y-1 duration-300 relative"
                >
                  {/* Serial Rank Badge */}
                  <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[10px] font-extrabold shadow-md">
                    Rank #{player.ranking || idx + 1}
                  </div>

                  {/* Favorite Heart Button */}
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(player._id, e)}
                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 dark:bg-zinc-950/80 border border-zinc-200 dark:border-emerald-900/40 shadow-sm hover:scale-110 transition-transform cursor-pointer"
                    title={isFavorited(player._id) ? "Remove from Favorites" : "Add to Favorites"}
                  >
                    <Heart className={`h-4 w-4 transition-colors ${isFavorited(player._id) ? 'fill-rose-500 text-rose-500' : 'text-zinc-400 hover:text-rose-500'}`} />
                  </button>

                  {/* Photo Header */}
                  <div className="w-full h-44 border-b border-zinc-200 dark:border-emerald-950/60 relative overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={player.imageUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=350&auto=format&fit=crop'}
                      alt={player.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-extrabold text-white bg-zinc-950/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                      <span>{player.currentClub}</span>
                      <span className="text-emerald-400">{player.nationalTeam}</span>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500">
                        <span className="uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-extrabold">
                          {player.position} #{player.jerseyNumber}
                        </span>
                        <span>Age {player.age}</span>
                      </div>

                      <h3 className="text-base font-extrabold text-zinc-900 dark:text-white line-clamp-1 group-hover:text-emerald-500 transition-colors">
                        {player.name}
                      </h3>

                      {/* Stats Pills */}
                      <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
                        <div className="bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-emerald-950/60 p-1.5 rounded-lg">
                          <span className="text-[9px] text-zinc-500 font-bold uppercase block">Matches</span>
                          <span className="text-xs font-extrabold text-zinc-900 dark:text-white">{player.matchesPlayed}</span>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-emerald-950/60 p-1.5 rounded-lg">
                          <span className="text-[9px] text-zinc-500 font-bold uppercase block">Goals</span>
                          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">{player.goals}</span>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-emerald-950/60 p-1.5 rounded-lg">
                          <span className="text-[9px] text-zinc-500 font-bold uppercase block">Assists</span>
                          <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400">{player.assists}</span>
                        </div>
                      </div>
                    </div>

                    {/* Like / Unlike & View Details Actions */}
                    <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-emerald-950/60">
                      <div className="flex items-center justify-between">
                        {/* Like & Unlike buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => handleLike(player._id, 'like', e)}
                            className="flex items-center gap-1 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 transition-colors px-2 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 cursor-pointer"
                          >
                            <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" />
                            <span>{player.likesCount}</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleLike(player._id, 'unlike', e)}
                            className="flex items-center gap-1 text-[11px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-rose-500 transition-colors px-2 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 cursor-pointer"
                          >
                            <ThumbsDown className="h-3.5 w-3.5 text-rose-500" />
                            <span>{player.unlikesCount}</span>
                          </button>
                        </div>

                        {/* View Details Link */}
                        <Link
                          href={`/players/${player._id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          <span>Details</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
