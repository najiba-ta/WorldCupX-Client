'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowRight, Sparkles, BookOpen, Trophy } from 'lucide-react';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';

export default function BlogPage() {
  const blogs = [
    {
      title: "Analyzing Argentina's Midspace Progressions under Scaloni",
      desc: "An in-depth data study on how Argentina overloaded central channels during transition build-ups to release Lionel Messi in dangerous zones.",
      date: 'July 14, 2026',
      author: 'Lionel Vance',
      readTime: '6 min read',
      tag: 'Tactics',
      color: 'from-emerald-500 to-teal-500'
    },
    {
      title: "Morocco's Low Block: The Defensive Blueprint of the Cup",
      desc: "A structural breakdown of Morocco's compact defensive shape, showcasing coordinate adjustments, zonal coverages, and counter-press setups.",
      date: 'June 29, 2026',
      author: 'Sofiane Hakimi',
      readTime: '5 min read',
      tag: 'Scouting',
      color: 'from-teal-500 to-indigo-500'
    },
    {
      title: "Lamine Yamal & 1v1 Iso Dynamics in Final Third Zones",
      desc: "Tracing progression carrying stats, cut-back angles, and target delivery speeds of Spain's winger in transition zones.",
      date: 'May 18, 2026',
      author: 'Pep Busquets',
      readTime: '8 min read',
      tag: 'Analytics',
      color: 'from-emerald-500 to-green-600'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#070e0a] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <PublicNavbar />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 md:py-24 w-full space-y-16">
        {/* Header Block */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Tactical Publications</span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
            The WorldMind AI Journal
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed font-medium">
            Deep tactical reviews, player analysis matrices, and coach interview reviews written by AI sportswriters.
          </p>
        </div>

        {/* Featured Blog */}
        <section className="rounded-2xl border border-zinc-200 dark:border-emerald-950 bg-white dark:bg-[#0b120c] p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center shadow-md">
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>Featured Post</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white hover:text-emerald-400 transition-colors">
              <a href="#">The Rise of Asymmetric Tactical Shapes in World Cup Football</a>
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
              Classical flat 4-4-2 shapes are declining on the world stage. We inspect how top-ranking nations transition into asymmetric 3-2-5 setups during possession phases, creating mid-space overloads while maintaining optimal rest defense.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-zinc-550 pt-2 font-semibold">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Aug 12, 2026</span>
              <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Marcus Vance</span>
            </div>
          </div>
          <div className="md:col-span-5 h-48 md:h-64 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-green-600 opacity-90 relative flex items-center justify-center border border-emerald-900/30">
            <Trophy className="h-16 w-16 text-white/30" />
          </div>
        </section>

        {/* Article Grid */}
        <section className="space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-emerald-950/40 pb-2">
            <span>Recent Publications</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((blog, i) => (
              <article key={i} className="rounded-2xl border border-emerald-950 bg-[#0b120c] flex flex-col justify-between overflow-hidden shadow-sm hover:border-emerald-500/30 transition-all duration-300">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-emerald-400 uppercase tracking-wider">{blog.tag}</span>
                    <span className="text-zinc-550">{blog.readTime}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug hover:text-emerald-450 transition-colors">
                    <a href="#">{blog.title}</a>
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                    {blog.desc}
                  </p>
                </div>
                <div className="border-t border-emerald-950/40 px-6 py-4 flex items-center justify-between mt-auto bg-zinc-950/10">
                  <span className="text-[10px] text-zinc-500 font-semibold">{blog.date}</span>
                  <a href="#" className="text-xs font-bold text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer">
                    <span>Read Article</span>
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
