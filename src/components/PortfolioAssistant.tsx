'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, MessageSquare, RotateCcw, Send, X } from 'lucide-react';
import { usePortfolio } from '@/components/PortfolioContext';
import {
  answerPortfolioQuestion,
  type AssistantLink,
  type AssistantReply,
} from '@/lib/portfolioAssistant';

interface ChatTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  links?: AssistantLink[];
}

const STARTER_QUESTIONS = [
  'What is his good side?',
  'Should I hire him?',
  'What are his limitations?',
  'Best backend & AI work?',
] as const;

export function PortfolioAssistant() {
  const { data } = usePortfolio();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [turns, loading, open]);

  const askQuestion = async (rawQuestion: string) => {
    const question = rawQuestion.trim();
    if (!question || loading) return;

    const userTurn: ChatTurn = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: question,
    };

    const nextHistory = [...turns, userTurn];
    setTurns(nextHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          history: turns.map((t) => ({ role: t.role, content: t.content })),
        }),
      });

      let reply: AssistantReply;
      if (res.ok) {
        reply = (await res.json()) as AssistantReply;
      } else {
        reply = answerPortfolioQuestion(question, data);
      }

      setTurns((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: reply.answer,
          links: reply.links,
        },
      ]);
    } catch {
      const fallback = answerPortfolioQuestion(question, data);
      setTurns((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: fallback.answer,
          links: fallback.links,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void askQuestion(input);
  };

  return (
    <div className="no-print">
      {/* Compact Monochrome Trigger Button */}
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ask questions about Petros Geto"
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 inline-flex h-10 items-center gap-2 rounded-full border border-black/[0.1] dark:border-white/[0.12] bg-[#F5F5F4]/95 dark:bg-[#17191C]/95 px-4 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors cursor-pointer"
        >
          <MessageSquare className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
          <span>Ask about {data.SITE_PROFILE.fullName.split(' ')[0]}</span>
        </button>
      ) : (
        <section
          role="dialog"
          aria-modal="false"
          aria-label={`Q&A Assistant for ${data.SITE_PROFILE.fullName}`}
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[390px] max-h-[min(72vh,560px)] flex flex-col rounded-2xl border border-[#EAEAEA] dark:border-[#242422] bg-white dark:bg-[#111110] shadow-[0_24px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.72)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#EAEAEA] dark:border-[#222220] px-4 py-3 shrink-0">
            <div className="min-w-0">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#666666] dark:text-[#9A9A96]">
                Portfolio Q&amp;A
              </p>
              <p className="text-[13px] font-semibold text-[#1A1A1A] dark:text-[#F0F0EE] truncate">
                {data.SITE_PROFILE.fullName}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {turns.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setTurns([])}
                  aria-label="Reset conversation"
                  title="Clear conversation"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.08] dark:border-white/[0.1] text-[#666666] dark:text-[#9A9A96] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close Q&A assistant"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.08] dark:border-white/[0.1] text-[#666666] dark:text-[#9A9A96] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-[13px] leading-relaxed"
          >
            {turns.length === 0 ? (
              <div className="space-y-4">
                <p className="text-[12.5px] leading-relaxed text-[#555553] dark:text-[#A3A6AB]">
                  Ask honest questions about {data.SITE_PROFILE.fullName}&apos;s strengths,
                  hiring fit, experience, tech stack, or specific projects.
                </p>

                <div className="space-y-1.5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#666666] dark:text-[#9A9A96]">
                    Common Questions
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {STARTER_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => void askQuestion(q)}
                        className="rounded-xl border border-[#EAEAEA] dark:border-[#242422] bg-[#FAFAFA] dark:bg-[#161615] px-3 py-1.5 text-left text-[12px] text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors cursor-pointer"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              turns.map((turn) => (
                <div
                  key={turn.id}
                  className={
                    turn.role === 'user'
                      ? 'flex justify-end'
                      : 'space-y-2.5'
                  }
                >
                  {turn.role === 'user' ? (
                    <div className="max-w-[85%] rounded-2xl bg-[#1A1A1A] dark:bg-[#F0F0EE] px-3.5 py-2 text-[12.5px] text-white dark:text-[#0A0A0A]">
                      {turn.content}
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="rounded-2xl border border-[#EAEAEA] dark:border-[#222220] bg-[#FAFAFA] dark:bg-[#161615] px-3.5 py-3 text-[12.5px] leading-[1.65] text-[#2A2A2A] dark:text-[#D4D4D0] whitespace-pre-line">
                        {turn.content}
                      </div>
                      {turn.links && turn.links.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {turn.links.map((link) =>
                            link.external ? (
                              <a
                                key={link.href}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-full border border-black/[0.1] dark:border-white/[0.12] px-2.5 py-1 text-[11px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors"
                              >
                                <span>{link.label}</span>
                                <ArrowUpRight className="h-3 w-3 opacity-65" aria-hidden="true" />
                              </a>
                            ) : (
                              <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setOpen(false)}
                                className="inline-flex items-center gap-1 rounded-full border border-black/[0.1] dark:border-white/[0.12] px-2.5 py-1 text-[11px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors"
                              >
                                <span>{link.label}</span>
                                <ArrowUpRight className="h-3 w-3 opacity-65" aria-hidden="true" />
                              </Link>
                            )
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ))
            )}

            {loading ? (
              <div className="rounded-2xl border border-[#EAEAEA] dark:border-[#222220] bg-[#FAFAFA] dark:bg-[#161615] px-3.5 py-2.5 text-[12px] font-mono text-[#666666] dark:text-[#9A9A96]">
                Thinking...
              </div>
            ) : null}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-[#EAEAEA] dark:border-[#222220] px-3 py-2.5 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              maxLength={600}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about strengths, hiring fit, projects..."
              aria-label="Ask a question about Petros Geto"
              className="h-9 flex-1 rounded-full border border-black/[0.1] dark:border-white/[0.12] bg-transparent px-3.5 text-[12.5px] text-[#1A1A1A] dark:text-[#F0F0EE] placeholder:text-[#666666]/65 dark:placeholder:text-[#9A9A96]/65 focus:outline-none focus:border-[#1A1A1A] dark:focus:border-[#F0F0EE]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send question"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] text-white dark:text-[#0A0A0A] hover:opacity-85 disabled:opacity-40 transition-opacity cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
