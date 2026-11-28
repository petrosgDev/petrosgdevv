'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  Copy,
  MessageSquare,
  RotateCcw,
  Send,
  X,
} from 'lucide-react';
import { usePortfolio } from '@/components/PortfolioContext';
import type {
  AssistantHistoryTurn,
  AssistantLink,
  AssistantReply,
} from '@/lib/portfolioAssistant';

interface ChatTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  links?: AssistantLink[];
  followUps?: string[];
  mode?: 'llm' | 'portfolio-engine';
  offTopic?: boolean;
  isError?: boolean;
  retryQuestion?: string;
}

const STARTER_GROUPS = [
  {
    label: 'Hiring & Fit',
    prompts: [
      'Should I hire him?',
      'What is his good side vs limitations?',
    ],
  },
  {
    label: 'Engineering',
    prompts: [
      'Compare his backend & database work',
      'What C++ & Java desktop systems has he built?',
    ],
  },
  {
    label: 'Deep Dives',
    prompts: [
      'What challenges did Aman Pay solve?',
      'Explain Event Hub architecture',
    ],
  },
] as const;

function renderInlineEmphasis(text: string): React.ReactNode {
  const segments = text.split(/(\*\*[^*]+\*\*)/g);
  if (segments.length === 1) return text;
  return segments.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong
          key={`em-${idx}`}
          className="font-semibold text-[#1A1A1A] dark:text-[#F0F0EE]"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={`tx-${idx}`}>{part}</React.Fragment>;
  });
}

function FormattedAssistantContent({ content }: { content: string }) {
  const blocks = content.split('\n');

  return (
    <div className="space-y-1.5 text-[12.5px] leading-[1.6] text-[#2A2A2A] dark:text-[#D4D4D0]">
      {blocks.map((rawLine, index) => {
        const line = rawLine.trim();
        if (!line) {
          return <div key={`sp-${index}`} className="h-1" aria-hidden="true" />;
        }

        // Markdown heading fallback ("## Title" or "### Title")
        if (/^#{1,4}\s+/.test(line)) {
          return (
            <p
              key={`mhd-${index}`}
              className="pt-1 first:pt-0 text-[12px] font-semibold tracking-[-0.01em] text-[#1A1A1A] dark:text-[#F0F0EE]"
            >
              {line.replace(/^#{1,4}\s+/, '').replace(/\*\*/g, '')}
            </p>
          );
        }

        // Bullet line: "• Label: body", "- body", or "* body"
        if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
          const isNested = rawLine.startsWith('  - ') || rawLine.startsWith('  • ');
          const body = line.replace(/^[•*-]\s+/, '');
          const cleanBody = body.replace(/^\*\*([^*]+)\*\*/, '$1');
          const colonIdx = cleanBody.indexOf(':');
          const hasLeadLabel =
            !body.startsWith('**') && colonIdx > 0 && colonIdx <= 42;

          return (
            <div
              key={`bl-${index}`}
              className={`flex items-start gap-2 ${isNested ? 'pl-3.5 text-[12px]' : ''}`}
            >
              <span
                className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#1A1A1A]/55 dark:bg-[#F0F0EE]/55"
                aria-hidden="true"
              />
              <span>
                {hasLeadLabel ? (
                  <>
                    <strong className="font-semibold text-[#1A1A1A] dark:text-[#F0F0EE]">
                      {body.slice(0, colonIdx + 1)}
                    </strong>
                    {renderInlineEmphasis(body.slice(colonIdx + 1))}
                  </>
                ) : (
                  renderInlineEmphasis(body)
                )}
              </span>
            </div>
          );
        }

        // Section title ending with ":" (excluding URLs like "https:")
        if (line.endsWith(':') && !/^https?:/i.test(line) && line.length < 85) {
          return (
            <p
              key={`hd-${index}`}
              className="pt-1 first:pt-0 text-[12px] font-semibold tracking-[-0.01em] text-[#1A1A1A] dark:text-[#F0F0EE]"
            >
              {line.slice(0, -1).replace(/\*\*/g, '')}
            </p>
          );
        }

        return (
          <p key={`tx-${index}`} className="text-[#2A2A2A] dark:text-[#D4D4D0]">
            {renderInlineEmphasis(line)}
          </p>
        );
      })}
    </div>
  );
}

export function PortfolioAssistant() {
  const { data } = usePortfolio();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
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
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [turns, loading, open]);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 1600);
    } catch {
      // Clipboard write unavailable in non-secure context
    }
  };

  const askQuestion = async (rawQuestion: string, options?: { isRetry?: boolean }) => {
    const question = rawQuestion.trim();
    if (!question || loading) return;

    const cleanPreviousTurns = options?.isRetry
      ? turns.filter((t, idx) => !(idx === turns.length - 1 && t.isError))
      : turns;

    const historySnapshot: AssistantHistoryTurn[] = cleanPreviousTurns
      .filter((t) => !t.isError)
      .map((t) => ({
        role: t.role,
        content: t.content,
      }));

    if (options?.isRetry) {
      setTurns(cleanPreviousTurns);
    } else {
      const userTurn: ChatTurn = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: question,
      };
      setTurns((prev) => [...prev, userTurn]);
    }

    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          history: historySnapshot,
        }),
      });

      const payload = (await res.json().catch(() => null)) as
        | (AssistantReply & { error?: string })
        | null;

      if (!res.ok || !payload || typeof payload.answer !== 'string') {
        const errorMessage =
          payload?.error ||
          'Unable to get an answer right now. Please try again in a moment.';
        setTurns((prev) => [
          ...prev,
          {
            id: `e-${Date.now()}`,
            role: 'assistant',
            content: errorMessage,
            isError: true,
            retryQuestion: question,
          },
        ]);
        return;
      }

      setTurns((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: payload.answer,
          links: payload.links,
          followUps: payload.followUps,
          mode: payload.mode,
          offTopic: Boolean(payload.offTopic),
        },
      ]);
    } catch {
      setTurns((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          content:
            'Could not reach the assistant right now. Check your connection and try again.',
          isError: true,
          retryQuestion: question,
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

  const latestAssistantId =
    [...turns].reverse().find((t) => t.role === 'assistant')?.id ?? null;

  return (
    <div className="no-print">
      {/* Compact Monochrome Trigger Button */}
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Ask questions about ${data.SITE_PROFILE.fullName}`}
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
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[412px] max-h-[min(76vh,580px)] flex flex-col rounded-2xl border border-[#EAEAEA] dark:border-[#242422] bg-white dark:bg-[#111110] shadow-[0_24px_60px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.72)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#EAEAEA] dark:border-[#222220] px-4 py-3 shrink-0">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#666666] dark:text-[#9A9A96]">
                Portfolio Q&amp;A
              </p>
              <p className="text-[13.5px] font-semibold text-[#1A1A1A] dark:text-[#F0F0EE] truncate">
                {data.SITE_PROFILE.fullName}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {turns.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setTurns([])}
                  aria-label="Reset conversation"
                  title="New conversation"
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] px-2.5 text-[11px] font-medium text-[#666666] dark:text-[#9A9A96] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                  <span>Reset</span>
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

          {/* Body — native scrollbar hidden cleanly via .no-scrollbar */}
          <div
            ref={scrollRef}
            className="no-scrollbar overscroll-contain flex-1 overflow-y-auto px-4 py-4 space-y-4"
          >
            {turns.length === 0 ? (
              <div className="space-y-4">
                <p className="text-[12.5px] leading-relaxed text-[#555553] dark:text-[#A3A6AB]">
                  Ask critical hiring questions, compare strengths vs limitations, or drill into{' '}
                  {data.SITE_PROFILE.fullName}&apos;s architecture, backend stack, and follow-ups.
                </p>

                <div className="space-y-3">
                  {STARTER_GROUPS.map((group) => (
                    <div key={group.label} className="space-y-1.5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#777773] dark:text-[#8E8E88]">
                        {group.label}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {group.prompts.map((prompt) => (
                          <button
                            key={prompt}
                            type="button"
                            onClick={() => void askQuestion(prompt)}
                            className="rounded-xl border border-[#EAEAEA] dark:border-[#242422] bg-[#FAFAFA] dark:bg-[#161615] px-3 py-1.5 text-left text-[12px] text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] hover:bg-white dark:hover:bg-[#1B1B19] transition-colors cursor-pointer"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              turns.map((turn) => (
                <div
                  key={turn.id}
                  className={turn.role === 'user' ? 'flex justify-end' : 'space-y-2.5'}
                >
                  {turn.role === 'user' ? (
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#1A1A1A] dark:bg-[#F0F0EE] px-3.5 py-2 text-[12.5px] leading-relaxed text-white dark:text-[#0A0A0A]">
                      {turn.content}
                    </div>
                  ) : turn.isError ? (
                    <div
                      role="alert"
                      className="rounded-2xl rounded-tl-md border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 px-3.5 py-3 space-y-2"
                    >
                      <div className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-red-700 dark:text-red-300">
                        <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
                        <span>Assistant Unavailable</span>
                      </div>
                      <p className="text-[12.5px] leading-[1.55] text-[#2A2A2A] dark:text-[#E5E5E1]">
                        {turn.content}
                      </p>
                      {turn.retryQuestion ? (
                        <button
                          type="button"
                          onClick={() =>
                            void askQuestion(turn.retryQuestion!, { isRetry: true })
                          }
                          className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.12] dark:border-white/[0.16] bg-white dark:bg-[#161615] px-3 py-1 text-[11px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors cursor-pointer"
                        >
                          <RotateCcw className="h-3 w-3" aria-hidden="true" />
                          <span>Try again</span>
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="group relative rounded-2xl rounded-tl-md border border-[#EAEAEA] dark:border-[#222220] bg-[#FAFAFA] dark:bg-[#161615] px-3.5 py-3">
                        <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-black/[0.05] dark:border-white/[0.06]">
                          <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[#777773] dark:text-[#8E8E88]">
                            {turn.offTopic
                              ? 'Out of Scope'
                              : turn.mode === 'llm'
                                ? 'AI Answer'
                                : 'Verified Answer'}
                          </span>
                          <button
                            type="button"
                            onClick={() => void handleCopy(turn.id, turn.content)}
                            aria-label="Copy answer"
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono text-[#777773] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] transition-colors cursor-pointer"
                          >
                            {copiedId === turn.id ? (
                              <>
                                <Check className="h-3 w-3" aria-hidden="true" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" aria-hidden="true" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>

                        <FormattedAssistantContent content={turn.content} />
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

                      {turn.id === latestAssistantId &&
                      !loading &&
                      turn.followUps &&
                      turn.followUps.length > 0 ? (
                        <div className="pt-0.5 space-y-1.5">
                          <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[#777773] dark:text-[#8E8E88]">
                            {turn.offTopic ? 'Try asking about Petros' : 'Follow up'}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {turn.followUps.map((followUp) => (
                              <button
                                key={followUp}
                                type="button"
                                onClick={() => void askQuestion(followUp)}
                                className="rounded-xl border border-dashed border-black/[0.14] dark:border-white/[0.16] px-2.5 py-1 text-left text-[11.5px] text-[#444442] dark:text-[#C4C4BE] hover:border-solid hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] transition-colors cursor-pointer"
                              >
                                {followUp}
                              </button>
                            ))}
                          </div>
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
            className="flex items-center gap-2 border-t border-[#EAEAEA] dark:border-[#222220] px-3 py-2.5 shrink-0 bg-white dark:bg-[#111110]"
          >
            <input
              ref={inputRef}
              type="text"
              maxLength={600}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question or follow up..."
              aria-label={`Ask a question about ${data.SITE_PROFILE.fullName}`}
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
