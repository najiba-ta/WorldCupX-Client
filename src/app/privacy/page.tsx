'use client';

import React from 'react';
import { ShieldAlert, Key, FolderSync, Trash2 } from 'lucide-react';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#070e0a] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <PublicNavbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 md:py-24 w-full space-y-12">
        {/* Header Block */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Compliance Guidelines</span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed font-medium">
            Effective Date: July 18, 2026. Review details about how WorldMind AI processes and handles your custom squad profiles and predictive simulation logs.
          </p>
        </div>

        {/* Content body */}
        <div className="rounded-2xl border border-zinc-200 dark:border-emerald-950 bg-white dark:bg-[#0b120c] p-6 md:p-10 space-y-8 shadow-sm">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" /> Custom Squad Isolation
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-450 leading-relaxed font-medium">
              Every custom team profile or tactical lineup you add to the database is bound explicitly to your user identifier. There is no shared model training across tenant boundaries. Your teams and match prediction histories are stored securely in MongoDB Atlas using access lists.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Key className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400" /> Secure Token Verification
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-450 leading-relaxed font-medium">
              All communications between your client browser and the Next.js API endpoints are encrypted using industry-standard TLS protocols. Better Auth session variables are signed and verified dynamically to block unauthorized database lookups.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <FolderSync className="h-4.5 w-4.5 text-amber-600 dark:text-amber-500" /> AI LLM Processing Boundary
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-450 leading-relaxed font-medium">
              When processing team tactical data with the Google Gemini API, we send variables in strict API-boundary containers. The content is processed under Google's enterprise confidentiality terms, meaning uploaded material is never indexed into public databases or used for baseline LLM optimization training.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Trash2 className="h-4.5 w-4.5 text-rose-600 dark:text-rose-500" /> Permanent Purges
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-450 leading-relaxed font-medium">
              Under our privacy standards, you hold complete ownership of your library. When you select 'Delete' on a custom team profile or match prediction log from your dashboard, the system immediately purges the record, tactical summaries, and associated chat logs permanently from MongoDB.
            </p>
          </section>

          <div className="border-t border-emerald-950/40 pt-6 text-[10px] text-zinc-550 text-center leading-relaxed font-semibold">
            If you have questions regarding data storage regulations or compliance, please contact our privacy compliance desk at <span className="text-emerald-400 font-semibold font-mono">privacy@worldmind.ai</span>.
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
