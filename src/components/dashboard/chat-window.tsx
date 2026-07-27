'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Trash2, RefreshCw } from 'lucide-react';
import { useChat } from '../../hooks/use-chat';
import { useAuth } from '../../hooks/use-auth';
import { Button } from '../ui/button';
import { cn } from '../../utils/cn';

interface ChatWindowProps {
  teamId: string;
  className?: string;
}

export function ChatWindow({ teamId, className }: ChatWindowProps) {
  const { user } = useAuth();
  const { 
    messages, 
    sendMessage, 
    isSending, 
    streamingText,
    suggestedFollowUps,
    clearHistory,
    isClearing,
    loadingMessages 
  } = useChat(teamId);

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending, streamingText]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const query = inputText.trim();
    setInputText('');
    
    try {
      await sendMessage(query);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSuggestionClick = async (prompt: string) => {
    if (isSending) return;
    try {
      await sendMessage(prompt);
    } catch (error) {
      console.error('Failed to send suggestion prompt:', error);
    }
  };

  const initialSuggestions = [
    '⚽ Predict who will win the 2026 FIFA World Cup and why?',
    '🎯 What are the best attacking tactics against a 4-4-2 defensive block?',
    '🧠 Compare the playing styles of Brazil and Argentina — who has the tactical edge?',
    '📊 Who are the top 3 midfielders in the current World Cup cycle?',
    '🔥 What pressing system does a high-intensity gegenpressing team use?',
    '🏆 Which team has the strongest defensive record in World Cup history?',
  ];

  return (
    <div className={cn('flex flex-col h-full bg-white dark:bg-[#0b120c] rounded-2xl border border-zinc-200 dark:border-emerald-950 overflow-hidden shadow-sm', className)}>
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-emerald-950 bg-zinc-50 dark:bg-zinc-950/40">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Bot className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Tactical Assistant</h4>
            <span className="text-[10px] text-zinc-500 font-semibold tracking-wider uppercase">Context Aware QA</span>
          </div>
        </div>

        {/* Clear History Button */}
        {messages.length > 0 && (
          <button
            onClick={() => clearHistory()}
            disabled={isClearing}
            className="h-8 px-3 rounded-lg border border-zinc-200 dark:border-emerald-950 bg-white dark:bg-zinc-950 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-rose-500 hover:border-rose-500/20 hover:bg-rose-500/5 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Clear Chat History"
          >
            {isClearing ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Messages Feed Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {loadingMessages ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <svg className="animate-spin h-5 w-5 text-emerald-600 dark:text-emerald-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-xs text-zinc-500 font-medium">Fetching history...</span>
          </div>
        ) : messages.length === 0 && !isSending ? (
          /* Empty Initial Suggestions State */
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-zinc-950 border border-emerald-200 dark:border-emerald-950 text-emerald-600 dark:text-emerald-400 mb-4">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <h5 className="text-sm font-bold text-zinc-900 dark:text-white">Start the conversation</h5>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed font-medium">
              Discuss build-up configurations, playstyles, defensive patterns or request explanations of the team's historical legacies.
            </p>
            
            <div className="mt-6 w-full space-y-2 text-left">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Suggested prompts:</span>
              {initialSuggestions.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSuggestionClick(prompt)}
                  className="w-full text-xs text-zinc-700 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-955 border border-zinc-200 dark:border-emerald-950/60 rounded-xl px-4 py-2.5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-left truncate font-semibold cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={cn('flex items-start gap-3.5 max-w-[85%]', {
                    'ml-auto flex-row-reverse': isUser,
                  })}
                >
                  {/* Avatar */}
                  <div className={cn(
                    'flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl text-xs font-bold border',
                    isUser
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-emerald-950 text-emerald-600 dark:text-emerald-400'
                  )}>
                    {isUser ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
                  </div>

                  {/* Bubble content */}
                  <div className="space-y-1">
                    <div className={cn(
                      'rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm font-medium whitespace-pre-wrap',
                      isUser
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-zinc-100 dark:bg-[#0f1a10] border border-zinc-200 dark:border-emerald-950/60 text-zinc-900 dark:text-zinc-300 rounded-tl-none'
                    )}>
                      {msg.text}
                    </div>
                    {/* Timestamp */}
                    <p className={cn('text-[9px] text-zinc-500 font-semibold px-1', {
                      'text-right': isUser,
                    })}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* SSE Accumulated Streaming Bubble */}
            {isSending && streamingText && (
              <div className="flex items-start gap-3.5 max-w-[85%]">
                <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-1">
                  <div className="rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm font-medium whitespace-pre-wrap bg-zinc-100 dark:bg-[#0f1a10] border border-zinc-200 dark:border-emerald-950/60 text-zinc-900 dark:text-zinc-300 rounded-tl-none">
                    {streamingText}
                  </div>
                </div>
              </div>
            )}
            
            {/* Bouncing Typing Dot Indicator */}
            {isSending && !streamingText && (
              <div className="flex items-start gap-3.5 max-w-[85%] animate-pulse">
                <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-1">
                  <div className="bg-zinc-100 dark:bg-[#0f1a10] border border-zinc-200 dark:border-emerald-950/60 rounded-2xl rounded-tl-none px-4 py-3 text-zinc-600 dark:text-zinc-400 text-sm flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Suggested Follow Up Buttons */}
      {suggestedFollowUps.length > 0 && !isSending && (
        <div className="px-6 py-2 border-t border-zinc-200 dark:border-emerald-950/60 bg-zinc-50/50 dark:bg-zinc-950/30 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider shrink-0">Follow ups:</span>
          {suggestedFollowUps.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => handleSuggestionClick(suggestion)}
              className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/30 rounded-xl px-3 py-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors whitespace-nowrap font-medium cursor-pointer"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Message input field */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-200 dark:border-emerald-950 bg-zinc-50 dark:bg-zinc-950/60 flex items-center gap-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask a question about tactics..."
          className="flex-1 h-11 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-950 focus:border-emerald-500 rounded-xl px-4 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 transition-colors focus:outline-none disabled:opacity-50"
          disabled={isSending}
        />
        <Button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
        >
          <span>Send</span>
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  );
}
export default ChatWindow;
