'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { 
  Trophy, Calendar, Globe, Star, MessageSquare, Send, 
  ArrowRight, BookOpen, AlertCircle, ArrowLeft, Info, User, 
  Award, Activity, Sparkles, Clock, BarChart3, Copy, RotateCcw, Trash2
} from 'lucide-react';
import { api } from '../../../../services/api';
import { Spinner } from '../../../../components/ui/spinner';
import { useAuth } from '../../../../hooks/use-auth';
import { Sidebar } from '../../../../components/dashboard/sidebar';
import { Navbar } from '../../../../components/dashboard/navbar';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
  createdAt: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export default function DashboardTeamDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [lastUserQuestion, setLastUserQuestion] = useState<string>('');
  
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    '🎯 What is this team\'s preferred tactical formation?',
    '⚡ Identify the key attacking and defensive leaders in this squad',
    '🛡️ What defensive system does this team rely on?',
    '📈 How has this team fared in FIFA World Cup knockout stages?',
    '🤝 How does this team\'s squad depth compare to other top nations?',
    '🔥 What are the tactical weaknesses opponents can exploit?',
  ]);

  // Fetch team details
  const { data: team, isLoading: teamLoading, error: teamError } = useQuery({
    queryKey: ['teamDetails', id],
    queryFn: async () => {
      const res = await api.get<{ team: TeamData }>(`/teams/${id}`);
      return res.team;
    },
    enabled: !!id,
  });

  // Fetch AI Tactical Analysis
  const { data: tacticalAnalysis, isLoading: analysisLoading, refetch: runAnalysis } = useQuery({
    queryKey: ['tacticalAnalysis', id],
    queryFn: async () => {
      const res = await api.post<{ analysis: any }>('/ai/analyze', { teamId: id });
      return res.analysis;
    },
    enabled: !!team,
  });

  // Fetch related teams (same confederation)
  const { data: relatedTeams = [] } = useQuery({
    queryKey: ['relatedTeams', team?.confederation],
    queryFn: async () => {
      const res = await api.get<{ teams: TeamData[] }>(`/teams?confederation=${team?.confederation}`);
      return res.teams.filter(t => t._id !== id).slice(0, 3);
    },
    enabled: !!team?.confederation,
  });

  // Handle Chat message
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isSendingChat) return;

    setLastUserQuestion(textToSend);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { id: Math.random().toString(), sender: 'user', text: textToSend, timestamp };
    setChatHistory((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsSendingChat(true);

    try {
      const apiHistory = chatHistory.map((msg) => ({
        sender: msg.sender,
        text: msg.text
      }));

      const res = await api.post<{ response: string; suggestedFollowUp?: string[] }>('/ai/chat', {
        teamId: id,
        text: textToSend,
        history: apiHistory
      });

      const aiMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'ai',
        text: res.response,
        timestamp
      };

      setChatHistory((prev) => [...prev, aiMsg]);
      if (res.suggestedFollowUp) {
        setSuggestedQuestions(res.suggestedFollowUp);
      }
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { id: Math.random().toString(), sender: 'ai', text: 'Connection error. Unable to fetch football chat response.', timestamp }
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  if (teamLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-muted">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs font-semibold tracking-wider uppercase text-muted">Loading squad details...</p>
        </div>
      </div>
    );
  }

  if (teamError || !team) {
    return (
      <div className="flex h-screen w-screen bg-background">
        <Sidebar className="shrink-0" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto gap-4">
            <AlertCircle className="h-12 w-12 text-rose-500" />
            <h2 className="text-xl font-bold text-foreground">Squad Not Found</h2>
            <p className="text-xs text-muted font-medium">The team profile could not be loaded or database record does not exist.</p>
            <Link href="/documents" className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline text-xs font-bold">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Explorer</span>
            </Link>
          </main>
        </div>
      </div>
    );
  }

  // Generate simple form timeline chart data for Recharts
  const formChartData = team.recentForm.map((result, idx) => ({
    match: `Match ${idx + 1}`,
    value: result === 'W' ? 3 : result === 'D' ? 1 : 0,
    result
  }));

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Navigation Sidebar */}
      <Sidebar className="shrink-0" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Workspace Frame */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto bg-background/20 p-8 space-y-6">
          {/* Breadcrumb back navigation */}
          <div>
            <Link href="/documents" className="inline-flex items-center gap-1 text-xs font-bold text-zinc-450 hover:text-emerald-400 transition-colors cursor-pointer">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to explore list</span>
            </Link>
          </div>

          {/* Hero banner layout */}
          <div className="bg-[#0b120c] border border-emerald-950/80 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-6 p-6 md:p-8">
            <div className="md:col-span-1 border border-emerald-950 rounded-xl overflow-hidden h-48 md:h-64 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={team.imageUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=350&auto=format&fit=crop'} 
                alt={team.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="md:col-span-2 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <span className="bg-emerald-950 border border-emerald-900/40 px-2 py-0.5 rounded text-emerald-400 uppercase">
                    {team.confederation}
                  </span>
                  <span className="text-zinc-500">FIFA Rank: #{team.fifaRanking}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">{team.name}</h2>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  {team.description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-emerald-950/40 pt-4 text-center">
                <div className="bg-zinc-950/50 border border-emerald-950/30 p-2.5 rounded-xl">
                  <span className="text-[9px] text-zinc-500 uppercase block font-semibold">World Cups</span>
                  <span className="text-base font-extrabold text-emerald-400 flex items-center justify-center gap-1">
                    <Trophy className="h-4 w-4 shrink-0 text-amber-500" />
                    <span>{team.worldCupTitles}</span>
                  </span>
                </div>
                <div className="bg-zinc-950/50 border border-emerald-950/30 p-2.5 rounded-xl">
                  <span className="text-[9px] text-zinc-500 uppercase block font-semibold">Squad Size</span>
                  <span className="text-base font-extrabold text-teal-400">{team.squadSize} Players</span>
                </div>
                <div className="bg-zinc-950/50 border border-emerald-950/30 p-2.5 rounded-xl col-span-2 sm:col-span-2">
                  <span className="text-[9px] text-zinc-500 uppercase block font-semibold">Head Coach</span>
                  <span className="text-xs font-bold text-white">{team.coach}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Tabs Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Main Info Blocks */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* World Cup History & Achievements */}
              <div className="bg-[#0b120c] border border-emerald-950/60 p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-extrabold text-white border-b border-emerald-950/40 pb-2 flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-400" />
                  <span>World Cup Legacy & History</span>
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  {team.history || 'No historical documentation seeded.'}
                </p>
                
                <div className="space-y-2 pt-2">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Key Achievements</span>
                  <div className="flex flex-wrap gap-2">
                    {team.achievements.map((ach, idx) => (
                      <span 
                        key={idx} 
                        className="px-2.5 py-1 bg-zinc-950 border border-emerald-950/80 rounded-lg text-[10px] font-bold text-emerald-400 flex items-center gap-1"
                      >
                        <Award className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span>{ach}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Players & Recent Form */}
              <div className="bg-[#0b120c] border border-emerald-950/60 p-6 rounded-2xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Top Players */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <User className="h-4 w-4 text-teal-400" />
                      <span>Top Playmakers</span>
                    </h4>
                    <ul className="space-y-2">
                      {team.topPlayers.map((player, idx) => (
                        <li 
                          key={idx} 
                          className="flex items-center justify-between p-2.5 bg-zinc-950 border border-emerald-950/40 rounded-xl text-xs font-semibold"
                        >
                          <span className="text-white">{player}</span>
                          <span className="text-[9px] bg-emerald-950 px-2 py-0.5 border border-emerald-900 rounded text-emerald-400">Watch List</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Form Line Chart */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                      <Activity className="h-4 w-4 text-emerald-400" />
                      <span>Recent Match Form Sequence</span>
                    </h4>
                    <div className="h-40 w-full bg-zinc-950 border border-emerald-950/40 p-3 rounded-xl">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={formChartData}>
                          <XAxis dataKey="match" stroke="#52525b" fontSize={9} />
                          <YAxis stroke="#52525b" fontSize={9} ticks={[0, 1, 3]} />
                          <Tooltip contentStyle={{ backgroundColor: '#070e0a', borderColor: '#14532d', color: '#fff', fontSize: '10px' }} />
                          <Line type="monotone" dataKey="value" name="Match Points" stroke="#10b981" strokeWidth={2} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              </div>

              {/* AI Tactical Analysis */}
              <div className="bg-[#0b120c] border border-emerald-950/60 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-950/40 pb-2">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-450" />
                    <span>AI Tactical Analysis Report</span>
                  </h3>
                  <button
                    onClick={() => runAnalysis()}
                    disabled={analysisLoading}
                    className="h-7.5 px-3 rounded-lg border border-emerald-950 bg-zinc-950 text-[10px] font-bold text-zinc-400 hover:text-white flex items-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <RotateCcw className={`h-3 w-3 ${analysisLoading ? 'animate-spin' : ''}`} />
                    <span>Regenerate Report</span>
                  </button>
                </div>

                {analysisLoading ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-zinc-550 text-xs">
                    <Spinner size="md" />
                    <span>Simulating game states & analysis...</span>
                  </div>
                ) : tacticalAnalysis ? (
                  <div className="text-xs text-zinc-450 leading-relaxed font-medium space-y-4 whitespace-pre-wrap markdown-parsed-container">
                    {typeof tacticalAnalysis === 'string' ? tacticalAnalysis : (tacticalAnalysis.summary || tacticalAnalysis.tacticalSummary || '')}
                    
                    {tacticalAnalysis.keyPoints && (
                      <div className="pt-3 border-t border-emerald-950/40 space-y-2">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">AI Tactical Focus Points</span>
                        <ul className="space-y-1.5">
                          {tacticalAnalysis.keyPoints.map((pt: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-zinc-400">
                              <span className="text-emerald-500 font-bold">✓</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500 italic">No tactical breakdown is generated. Click Regenerate to activate analysis.</div>
                )}
              </div>

            </div>

            {/* Chatbot & Assistant embedded Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#0b120c] border border-emerald-950/60 rounded-2xl flex flex-col h-[520px] shadow-sm overflow-hidden">
                <div className="bg-zinc-950 border-b border-emerald-950/60 p-4.5">
                  <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-emerald-450" />
                    <span>Squad Tactical Assistant</span>
                  </h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Chat directly with an AI trained on World Cup stats.</p>
                </div>

                {/* Message History list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-zinc-950/20">
                  {chatHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-zinc-550">
                      <Trophy className="h-9 w-9 text-emerald-900" />
                      <h5 className="text-[11px] font-bold text-zinc-400">Contextual Football Chat</h5>
                      <p className="text-[9px] max-w-xs mx-auto">
                        Ask about playstyles, tactics, comparisons, or historical performances of {team.name}.
                      </p>
                    </div>
                  ) : (
                    chatHistory.map((msg) => {
                      const isAi = msg.sender === 'ai';
                      return (
                        <div 
                          key={msg.id}
                          className={`flex flex-col ${isAi ? 'items-start' : 'items-end'} space-y-1`}
                        >
                          <span className="text-[9px] font-bold text-zinc-650 px-1 capitalize">
                            {isAi ? 'WorldMind AI' : 'You'}
                          </span>
                          <div className={`p-3 rounded-2xl text-[11px] font-medium leading-relaxed max-w-[85%] ${
                            isAi 
                              ? 'bg-[#0e1710] text-zinc-300 border border-emerald-950/60' 
                              : 'bg-emerald-500 text-white'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      );
                    })
                  )}
                  {isSendingChat && (
                    <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-bold pl-2">
                      <Spinner size="sm" />
                      <span>AI Assistant typing...</span>
                    </div>
                  )}
                </div>

                {/* Suggested Questions Grid */}
                {chatHistory.length === 0 && (
                  <div className="p-3 border-t border-emerald-950/40 bg-zinc-950/10 space-y-2">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Suggested Prompts</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(q)}
                          className="p-1.5 bg-zinc-950 border border-emerald-950/60 rounded-lg text-[9px] font-bold text-left text-zinc-400 hover:text-white hover:border-emerald-500/20 truncate cursor-pointer transition-colors"
                          title={q}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Form */}
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(chatInput); }}
                  className="p-4 bg-zinc-950 border-t border-emerald-950/60 flex gap-2"
                >
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1 h-9.5 bg-zinc-950 border border-emerald-950 focus:border-emerald-500 focus:outline-none rounded-xl px-3 text-xs text-white"
                  />
                  <button
                    type="submit"
                    disabled={isSendingChat || !chatInput.trim()}
                    className="h-9.5 w-9.5 bg-emerald-500 rounded-xl flex items-center justify-center text-white hover:opacity-90 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>

              {/* Related Teams Grid */}
              <div className="bg-[#0b120c] border border-emerald-950/60 p-6 rounded-2xl space-y-4">
                <h4 className="text-xs font-extrabold text-white border-b border-emerald-950/40 pb-2">
                  Related {team.confederation} Contenders
                </h4>
                
                <div className="space-y-3">
                  {relatedTeams.length > 0 ? (
                    relatedTeams.map((t) => (
                      <Link 
                        key={t._id} 
                        href={`/dashboard/documents/${t._id}`}
                        className="flex items-center gap-3 p-2 border border-emerald-950 bg-zinc-950/30 hover:bg-emerald-950/10 rounded-xl transition-all"
                      >
                        <div className="h-10 w-14 border border-emerald-950 rounded-lg overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-white block truncate">{t.name}</span>
                          <span className="text-[9px] text-zinc-550 block">FIFA Rank: #{t.fifaRanking}</span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-[10px] text-zinc-550 italic">No related squads found in database.</p>
                  )}
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
