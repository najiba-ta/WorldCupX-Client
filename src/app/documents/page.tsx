'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  Search, AlertCircle, ChevronLeft, ChevronRight,
  ArrowRight, RefreshCw, FolderOpen, Award, Trophy, ShieldAlert, Heart
} from 'lucide-react';
import { api } from '../../services/api';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';
import { useAuth } from '../../hooks/use-auth';
import { useFavorites } from '../../hooks/use-favorites';
import { Sidebar } from '../../components/dashboard/sidebar';
import { Navbar } from '../../components/dashboard/navbar';
import { Spinner } from '../../components/ui/spinner';

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
  imageUrl?: string;
  createdAt: string;
}

const ITEMS_PER_PAGE = 8; // Desktop: 4 cards per row, 2 rows

export default function ExploreTeamsPage() {
  const { user, loading: authLoading } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConfederation, setSelectedConfederation] = useState('all');
  const [selectedTitles, setSelectedTitles] = useState('all');
  const [selectedRanking, setSelectedRanking] = useState('all');
  const [sortBy, setSortBy] = useState<'ranking' | 'titles' | 'name'>('ranking');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch teams from backend
  const { data: teams = [], isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['exploreTeams'],
    queryFn: async () => {
      const res = await api.get<{ teams: TeamData[] }>('/teams?limit=500');
      return res.teams || [];
    },
  });

  // Filter teams by search, confederation, ranking, titles
  const filteredTeams = React.useMemo(() => {
    return teams.filter((team) => {
      const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            team.coach.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesConf = selectedConfederation === 'all' || team.confederation === selectedConfederation;
      
      let matchesTitles = true;
      if (selectedTitles !== 'all') {
        if (selectedTitles === 'none') {
          matchesTitles = team.worldCupTitles === 0;
        } else if (selectedTitles === 'winner') {
          matchesTitles = team.worldCupTitles > 0;
        } else if (selectedTitles === 'multiple') {
          matchesTitles = team.worldCupTitles >= 3;
        }
      }

      let matchesRank = true;
      if (selectedRanking !== 'all') {
        if (selectedRanking === 'top5') {
          matchesRank = team.fifaRanking <= 5;
        } else if (selectedRanking === 'top10') {
          matchesRank = team.fifaRanking <= 10;
        } else if (selectedRanking === 'top20') {
          matchesRank = team.fifaRanking <= 20;
        }
      }

      return matchesSearch && matchesConf && matchesTitles && matchesRank;
    });
  }, [teams, searchQuery, selectedConfederation, selectedTitles, selectedRanking]);

  // Sort teams
  const sortedTeams = React.useMemo(() => {
    return [...filteredTeams].sort((a, b) => {
      if (sortBy === 'ranking') {
        return a.fifaRanking - b.fifaRanking; // lower rank number = better
      }
      if (sortBy === 'titles') {
        return b.worldCupTitles - a.worldCupTitles; // highest titles first
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [filteredTeams, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedTeams.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTeams = sortedTeams.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleFilterChange = (setter: (val: any) => void, val: any) => {
    setter(val);
    setCurrentPage(1);
  };

  const renderMainContent = () => {
    return (
      <>
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className={user ? "text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight" : "text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white"}>Explore National Teams</h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 font-medium">Search, filter, and inspect football squad dynamics and tactical layouts.</p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className={user ? "h-9 px-3.5 rounded-xl border border-zinc-200 dark:border-emerald-950 bg-white dark:bg-zinc-950 text-xs font-bold text-zinc-700 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-white flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-emerald-950/20 disabled:opacity-50 transition-all cursor-pointer shadow-sm" : "h-10 px-4 rounded-xl border border-zinc-200 dark:border-emerald-950 bg-white dark:bg-[#0b120c] text-xs font-bold text-zinc-700 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-white flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-emerald-950/20 disabled:opacity-50 transition-all cursor-pointer shadow-sm"}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>Refresh Explorer</span>
          </button>
        </div>

        {/* Filters and sorting panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-4 items-center bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950/80 p-4.5 rounded-2xl shadow-sm">
          {/* Search bar */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by country or coach..."
              value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
              className="w-full h-10.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950/80 focus:border-emerald-500/80 rounded-xl pl-10 pr-4 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 transition-colors focus:outline-none"
            />
          </div>

          {/* Confederation Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedConfederation}
              onChange={(e) => handleFilterChange(setSelectedConfederation, e.target.value)}
              className="w-full h-10.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950/80 rounded-xl px-4 text-xs font-bold text-zinc-700 dark:text-zinc-400 focus:outline-none focus:border-emerald-500/80 transition-colors cursor-pointer"
            >
              <option value="all">All Confederations</option>
              <option value="UEFA">UEFA (Europe)</option>
              <option value="CONMEBOL">CONMEBOL (S. America)</option>
              <option value="CAF">CAF (Africa)</option>
              <option value="AFC">AFC (Asia)</option>
              <option value="CONCACAF">CONCACAF (N. America)</option>
            </select>
          </div>

          {/* World Cup Titles Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedTitles}
              onChange={(e) => handleFilterChange(setSelectedTitles, e.target.value)}
              className="w-full h-10.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950/80 rounded-xl px-4 text-xs font-bold text-zinc-700 dark:text-zinc-400 focus:outline-none focus:border-emerald-500/80 transition-colors cursor-pointer"
            >
              <option value="all">World Cup Titles</option>
              <option value="winner">Has Won Title (1+)</option>
              <option value="multiple">Multiple Winner (3+)</option>
              <option value="none">No Titles</option>
            </select>
          </div>

          {/* FIFA Ranking Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedRanking}
              onChange={(e) => handleFilterChange(setSelectedRanking, e.target.value)}
              className="w-full h-10.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950/80 rounded-xl px-4 text-xs font-bold text-zinc-700 dark:text-zinc-400 focus:outline-none focus:border-emerald-500/80 transition-colors cursor-pointer"
            >
              <option value="all">FIFA Ranking</option>
              <option value="top10">Top 10 Ranked</option>
              <option value="top20">Top 20 Ranked</option>
            </select>
          </div>

          {/* Sort By Select */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
              className="w-full h-10.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950/80 rounded-xl px-4 text-xs font-bold text-zinc-700 dark:text-zinc-400 focus:outline-none focus:border-emerald-500/80 transition-colors cursor-pointer"
            >
              <option value="ranking">Sort by Rank</option>
              <option value="titles">Sort by Titles</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>

        {/* Results grid or states */}
        {error ? (
          <div className="rounded-2xl border border-rose-200 dark:border-rose-950/40 bg-rose-50/50 dark:bg-rose-950/10 p-12 text-center max-w-md mx-auto space-y-3">
            <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Failed to load teams</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">Network connection error or server backend unreachable.</p>
            <button
              onClick={() => refetch()}
              className="h-9 px-4 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-500 transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : isLoading ? (
          /* Skeleton Loader */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col h-[415px] w-full rounded-xl border border-zinc-200 dark:border-emerald-950/50 bg-white dark:bg-[#0b120c] animate-pulse overflow-hidden">
                <div className="w-full h-36 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-emerald-950/50" />
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <div className="h-4 w-16 bg-zinc-100 dark:bg-zinc-900 rounded-md" />
                      <div className="h-4 w-12 bg-zinc-100 dark:bg-zinc-900 rounded-md" />
                    </div>
                    <div className="h-5 w-3/4 bg-zinc-100 dark:bg-zinc-900 rounded-md" />
                    <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-900 rounded-md" />
                  </div>
                  <div className="h-9.5 w-full bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedTeams.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-emerald-950/60 bg-white dark:bg-[#0b120c]/30 p-16 text-center max-w-md mx-auto space-y-4">
            <ShieldAlert className="h-12 w-12 text-emerald-600 dark:text-emerald-900 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-foreground">No squads found</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-500 max-w-xs mx-auto leading-relaxed">
                Try modifying your filters, search queries, or clear inputs.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedConfederation('all');
                setSelectedTitles('all');
                setSelectedRanking('all');
                setSortBy('ranking');
              }}
              className="h-9 px-4 rounded-xl border border-zinc-300 dark:border-emerald-950 text-xs font-semibold text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          /* Responsive Cards Grid */
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedTeams.map((team) => {
                return (
                  <div 
                    key={team._id}
                    className="flex flex-col h-[415px] w-full rounded-xl border border-zinc-200 dark:border-emerald-950/60 bg-white dark:bg-[#0b120c] hover:border-emerald-500/40 shadow-sm transition-all hover:shadow-md overflow-hidden group hover:translate-y-[-2px] duration-300"
                  >
                    {/* Country Flag image */}
                    <div className="w-full h-36 border-b border-zinc-200 dark:border-emerald-950/60 relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={team.imageUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=250&auto=format&fit=crop'} 
                        alt={team.name}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(team._id, e)}
                          className="p-1.5 rounded-full bg-white/90 dark:bg-zinc-950/80 border border-zinc-200 dark:border-emerald-900/40 shadow-sm hover:scale-110 transition-transform cursor-pointer"
                          title={isFavorited(team._id) ? "Remove from Favorites" : "Add to Favorites"}
                        >
                          <Heart className={`h-4 w-4 transition-colors ${isFavorited(team._id) ? 'fill-rose-500 text-rose-500' : 'text-zinc-400 hover:text-rose-500'}`} />
                        </button>
                        <div className="px-2 py-0.5 rounded-md bg-white/90 dark:bg-zinc-950/80 border border-zinc-200 dark:border-emerald-900/40 text-[9px] font-extrabold text-emerald-700 dark:text-emerald-400 shadow-sm">
                          Rank #{team.fifaRanking}
                        </div>
                      </div>
                    </div>

                    {/* Meta detail description body */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-bold text-zinc-600 dark:text-zinc-500">
                          <span className="bg-emerald-50 dark:bg-zinc-950 px-2 py-0.5 border border-emerald-200 dark:border-emerald-950 rounded uppercase text-emerald-700 dark:text-emerald-400">
                            {team.confederation}
                          </span>
                          <span>Coach: {team.coach}</span>
                        </div>

                        <h3 
                          className="text-sm font-extrabold text-zinc-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" 
                          title={team.name}
                        >
                          {team.name}
                        </h3>

                        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed font-medium">
                          {team.description || 'No description provided.'}
                        </p>
                      </div>

                      {/* Score metrics & View details actions */}
                      <div className="space-y-3 pt-3">
                        <div className="flex items-center justify-between text-[10px] text-zinc-600 dark:text-zinc-550 border-t border-zinc-200 dark:border-emerald-950/40 pt-2.5 font-medium">
                          <span className="flex items-center gap-1 font-bold text-teal-700 dark:text-teal-400">
                            <Trophy className="h-3.5 w-3.5" />
                            <span>World Cups: {team.worldCupTitles}</span>
                          </span>
                          <span>Squad: {team.squadSize} players</span>
                        </div>

                        <Link href={`/documents/${team._id}`} className="block">
                          <button className="w-full h-9.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm">
                            <span>View Details</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-emerald-950/40 pt-4">
                <span className="text-[11px] text-zinc-500 font-bold">
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
      </>
    );
  };

  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#070e0a] text-zinc-500">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs font-semibold tracking-wider uppercase text-zinc-500">Initializing session...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-[#070e0a]">
        {/* Navigation Sidebar */}
        <Sidebar className="shrink-0" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Workspace Frame */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          {/* Scrollable Context Area */}
          <main className="flex-1 overflow-y-auto bg-background/20 p-8 space-y-6">
            {renderMainContent()}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#070e0a] text-zinc-100 transition-colors duration-300">
      <PublicNavbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:px-8 space-y-8">
        {renderMainContent()}
      </main>

      <PublicFooter />
    </div>
  );
}
