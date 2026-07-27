'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, X, CheckCheck, CheckCircle2, XCircle, ThumbsUp, Heart, LogIn, UserPlus, AlertTriangle, Users } from 'lucide-react';
import { api } from '../../services/api';

interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  metadata?: { itemName?: string; itemType?: string };
  createdAt: string;
}

const typeIcon: Record<string, React.ReactNode> = {
  post_approved:    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />,
  post_rejected:    <XCircle className="h-4 w-4 text-rose-500 shrink-0" />,
  post_submitted:   <Bell className="h-4 w-4 text-blue-500 shrink-0" />,
  like_received:    <ThumbsUp className="h-4 w-4 text-blue-400 shrink-0" />,
  favorite_received:<Heart className="h-4 w-4 text-pink-400 shrink-0" />,
  admin_warning:    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />,
  user_activity:    <Users className="h-4 w-4 text-purple-400 shrink-0" />,
  login:            <LogIn className="h-4 w-4 text-teal-400 shrink-0" />,
  register:         <UserPlus className="h-4 w-4 text-indigo-400 shrink-0" />,
};

const typeBg: Record<string, string> = {
  post_approved:    'border-l-emerald-500',
  post_rejected:    'border-l-rose-500',
  post_submitted:   'border-l-blue-500',
  like_received:    'border-l-blue-400',
  favorite_received:'border-l-pink-400',
  admin_warning:    'border-l-amber-400',
  user_activity:    'border-l-purple-400',
  login:            'border-l-teal-400',
  register:         'border-l-indigo-400',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

function fullDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/** Play a subtle notification sound using Web Audio API */
function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.2);
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  } catch (_) {
    // Fail silently if audio not supported
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [bellShake, setBellShake] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const prevUnreadRef = useRef<number>(0);
  const isFirstLoadRef = useRef(true);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get<{ notifications: NotificationItem[]; unreadCount: number }>('/notifications');
      return res;
    },
    refetchInterval: 10000,      // poll every 10 seconds
    refetchOnMount: true,        // always refetch when component mounts
    refetchOnWindowFocus: true,  // refetch when user comes back to tab
    staleTime: 0,                // always consider data stale
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Detect new notifications → shake bell + play sound
  useEffect(() => {
    if (isFirstLoadRef.current) {
      prevUnreadRef.current = unreadCount;
      isFirstLoadRef.current = false;
      return;
    }
    if (unreadCount > prevUnreadRef.current) {
      // New notification arrived!
      setBellShake(true);
      playNotificationSound();
      setTimeout(() => setBellShake(false), 700);
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => api.put(`/notifications/${id}/read`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => api.put('/notifications/read-all', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const handleNotificationClick = (n: NotificationItem) => {
    if (!n.read) markReadMutation.mutate(n._id);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-emerald-950/60 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer"
        aria-label="Notifications"
        style={bellShake ? { animation: 'bellShake 0.6s ease' } : {}}
      >
        <Bell className={`h-4.5 w-4.5 text-zinc-600 dark:text-zinc-300 transition-transform ${bellShake ? 'scale-110' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4.5 w-4.5 flex items-center justify-center text-[9px] font-black bg-rose-500 text-white rounded-full border-2 border-white dark:border-zinc-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Bell shake keyframes injected inline */}
      <style>{`
        @keyframes bellShake {
          0%  { transform: rotate(0deg) scale(1); }
          15% { transform: rotate(-18deg) scale(1.15); }
          30% { transform: rotate(18deg) scale(1.15); }
          45% { transform: rotate(-12deg) scale(1.1); }
          60% { transform: rotate(12deg) scale(1.1); }
          75% { transform: rotate(-6deg) scale(1.05); }
          90% { transform: rotate(6deg) scale(1.05); }
          100%{ transform: rotate(0deg) scale(1); }
        }
      `}</style>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white dark:bg-[#0b120c] border border-zinc-200 dark:border-emerald-950/60 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[520px]">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-200 dark:border-emerald-950/60 shrink-0">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-emerald-500" />
              <h3 className="text-xs font-extrabold text-zinc-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="text-[9px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/20 px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllReadMutation.mutate()}
                  className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-10 gap-2">
                <div className="h-4 w-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-zinc-400 font-medium">Loading...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Bell className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                <p className="text-xs font-bold text-zinc-500">No notifications yet</p>
                <p className="text-[10px] text-zinc-400">Activities will appear here when they happen.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-emerald-950/40">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    className={`flex items-start gap-3 px-4 py-3.5 border-l-4 transition-colors cursor-pointer ${typeBg[n.type] || 'border-l-zinc-300'} ${!n.read ? 'bg-zinc-50 dark:bg-emerald-950/10' : 'hover:bg-zinc-50 dark:hover:bg-zinc-950/30'}`}
                  >
                    {/* Icon */}
                    <div className="mt-0.5 shrink-0">
                      {typeIcon[n.type] || <Bell className="h-4 w-4 text-zinc-400 shrink-0" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[11px] font-extrabold text-zinc-900 dark:text-white leading-tight">
                          {n.title}
                        </p>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(n._id); }}
                          className="text-zinc-400 hover:text-rose-500 cursor-pointer shrink-0 mt-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>

                      <p className="text-[10px] text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed mt-0.5 line-clamp-2">
                        {n.message}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[9px] text-zinc-400 font-bold">{timeAgo(n.createdAt)}</span>
                        <span className="text-[9px] text-zinc-300 dark:text-zinc-600">•</span>
                        <span className="text-[9px] text-zinc-400">{fullDate(n.createdAt)}</span>
                        {!n.read && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
