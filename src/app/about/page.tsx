'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, Cpu, Shield, Users, ArrowRight } from 'lucide-react';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#070e0a] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <PublicNavbar />

      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 md:py-24 space-y-20">
        {/* About Hero */}
        <section className="text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Our Mission</span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
            Democratizing Football Analytics
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-medium">
            WorldMind AI was founded to bridge the gap between complex tactical analytics and football enthusiasts. We build specialized, agentic sports AI engines that simulate and dissect matches instantly.
          </p>
        </section>

        {/* Core Pillars */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-zinc-200 dark:border-emerald-950 bg-white dark:bg-[#0b120c] p-6 space-y-4 shadow-sm hover:border-emerald-500/30 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Predictive Core</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              We invoke advanced reasoning workflows that process FIFA ranks, squad size, injured list metrics, and weather conditions to determine expected goal counts and probabilities.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-emerald-950 bg-white dark:bg-[#0b120c] p-6 space-y-4 shadow-sm hover:border-emerald-500/30 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Tactical Chat</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              Interact directly with our contextual sports assistant to evaluate team records, midfield press designs, or compare top player statistics like Messi vs Mbappé.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-emerald-950 bg-white dark:bg-[#0b120c] p-6 space-y-4 shadow-sm hover:border-emerald-500/30 transition-all">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-500">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Interactive Sorters</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              Deep dive into team registries. Sort by FIFA ranks, filter by regional confederation groups, and keep track of your bookmarked favorites.
            </p>
          </div>
        </section>

        {/* Our Approach Story */}
        <section className="rounded-2xl border border-emerald-950/80 bg-[#0b120c]/45 p-8 md:p-12 space-y-6">
          <h2 className="text-xl md:text-2xl font-bold text-white">
            The Tech Behind WorldMind AI
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed font-medium">
            By combining Google Gemini LLMs with customized sports database parameters, WorldMind simulates football games. Our agents analyze defensive lines, midfield press designs, build-up shapes, and forward pacing. The result is expected goal rates and winning probabilities mapped to a highly tactical, human-scouted review summary.
          </p>
          <div className="pt-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3.5 text-xs font-bold text-white hover:opacity-90 transition-all cursor-pointer shadow-md"
            >
              <span>Create Your Analyst Account</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
