'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, MessageSquare, Send, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { PublicNavbar } from '../../components/public/PublicNavbar';
import { PublicFooter } from '../../components/public/PublicFooter';

const contactSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  subject: z.string().min(4, { message: 'Subject must be at least 4 characters.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: anyErrors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const errors = anyErrors as any;

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    try {
      // Simulate API submit delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Submitted contact request:', data);
      setSubmitStatus('success');
      reset();
    } catch (e) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#070e0a] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <PublicNavbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-16 md:py-24 w-full space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Support Portal</span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
            Contact Support & Analysts
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed font-medium">
            Need assistance with tactical simulations, seeding custom squads, or custom API limits? Send us a message and we'll reply shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Support Channels */}
          <div className="md:col-span-4 space-y-6">
            <div className="rounded-2xl border border-emerald-950 bg-[#0b120c] p-6 space-y-3.5 shadow-sm hover:border-emerald-500/20 transition-all">
              <Mail className="h-6 w-6 text-emerald-450" />
              <h3 className="text-sm font-bold text-white">Email Support</h3>
              <p className="text-xs text-zinc-450 leading-relaxed font-medium">
                Contact our sports desk for database additions.
              </p>
              <span className="text-xs font-semibold text-emerald-400 block font-mono">support@worldmind.ai</span>
            </div>

            <div className="rounded-2xl border border-emerald-950 bg-[#0b120c] p-6 space-y-3.5 shadow-sm hover:border-emerald-500/20 transition-all">
              <MessageSquare className="h-6 w-6 text-teal-400" />
              <h3 className="text-sm font-bold text-white">Live Workspace Chat</h3>
              <p className="text-xs text-zinc-450 leading-relaxed font-medium">
                Talk directly with analytical agents from the tactical assistant dashboard.
              </p>
              <span className="text-xs font-semibold text-teal-400 block">Response time &lt; 1m</span>
            </div>
          </div>

          {/* Form Block */}
          <div className="md:col-span-8 rounded-2xl border border-emerald-950 bg-[#0b120c] p-6 md:p-8 shadow-md">
            {submitStatus === 'success' && (
              <div className="rounded-xl border border-emerald-550/20 bg-emerald-500/5 p-4 text-emerald-450 flex items-start gap-3 mb-6 animate-in fade-in duration-205">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold">Message sent successfully!</h4>
                  <p className="text-[11px] text-emerald-455 mt-1 font-medium">
                    Thank you for reaching out. We have logged your analyst query and will follow up within 24 hours.
                  </p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-rose-500 flex items-start gap-3 mb-6 animate-in fade-in duration-205">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold">Submission failed</h4>
                  <p className="text-[11px] text-rose-500/85 mt-1 font-medium">
                    An error occurred while dispatching your request. Please try again or email us directly.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 font-semibold">
                    Your Name
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    placeholder="Diego Scaloni"
                    className="flex h-11 w-full rounded-xl border border-emerald-950 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-650 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                  {errors.name && <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 font-semibold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="analyst@worldmind.ai"
                    className="flex h-11 w-full rounded-xl border border-emerald-950 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-650 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                  {errors.email && <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.email.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 font-semibold">
                  Subject
                </label>
                <input
                  type="text"
                  {...register('subject')}
                  placeholder="How can we help you?"
                  className="flex h-11 w-full rounded-xl border border-emerald-950 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-655 focus:border-emerald-500 focus:outline-none transition-colors"
                />
                {errors.subject && <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.subject.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 font-semibold">
                  Message Description
                </label>
                <textarea
                  rows={5}
                  {...register('message')}
                  placeholder="Outline squad metrics, details or queries..."
                  className="flex w-full rounded-xl border border-emerald-950 bg-zinc-950 px-4 py-2.5 text-xs text-white placeholder-zinc-655 focus:border-emerald-500 focus:outline-none resize-none"
                />
                {errors.message && <p className="mt-1 text-[11px] text-rose-500 font-semibold">{errors.message.message}</p>}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-xs font-bold text-white shadow-lg flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
