'use client';

import React, { useState } from 'react';
import { Check, Copy, Mail, MailOpen, Trash2 } from 'lucide-react';
import type { ContactMessageRecord } from '@/lib/firebase';
import { CARD_CLASS, SectionHeader } from '@/components/admin/AdminFields';

interface MessagesSectionProps {
  messages: ContactMessageRecord[];
  onToggleStatus: (id: string, nextStatus: 'read' | 'unread') => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function MessagesSection({
  messages,
  onToggleStatus,
  onDelete,
}: MessagesSectionProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const unreadCount = messages.filter((m) => m.status === 'unread').length;
  const filtered = messages.filter((m) =>
    filter === 'all' ? true : m.status === filter
  );

  const handleCopyEmail = async (id: string, email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Ignore clipboard failure
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return 'Just now';
    try {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Inbox"
        title="Visitor Messages"
        description="Messages sent from your /contact page arrive directly here."
        action={
          <div className="flex items-center gap-1.5 rounded-full border border-[#EAEAEA] dark:border-[#222220] bg-[#FAFAFA] dark:bg-[#111110] p-1">
            {(['all', 'unread', 'read'] as const).map((tab) => {
              const active = filter === tab;
              const label =
                tab === 'all'
                  ? `All (${messages.length})`
                  : tab === 'unread'
                  ? `Unread (${unreadCount})`
                  : `Read (${messages.length - unreadCount})`;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={`h-7 rounded-full px-3 text-[11.5px] font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#1A1A1A] dark:bg-[#F0F0EE] text-white dark:text-[#0A0A0A]'
                      : 'text-[#666666] dark:text-[#9A9A96] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        }
      />

      {filtered.length === 0 ? (
        <div className={`${CARD_CLASS} py-12 text-center space-y-2`}>
          <p className="font-display text-[20px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
            {messages.length === 0 ? 'No messages yet' : 'No matching messages'}
          </p>
          <p className="text-[12.5px] text-[#666666] dark:text-[#9A9A96]">
            {messages.length === 0
              ? 'Submissions from your /contact form will appear here.'
              : 'Switch the filter above to view other messages.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((msg) => {
            const isUnread = msg.status === 'unread';
            const isBusy = busyId === msg.id;
            return (
              <article
                key={msg.id}
                className={`${CARD_CLASS} space-y-4 ${
                  isUnread
                    ? 'border-[#1A1A1A]/35 dark:border-white/25'
                    : 'opacity-85'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-[19px] font-bold uppercase tracking-tight text-[#1A1A1A] dark:text-[#F0F0EE]">
                        {msg.subject}
                      </h3>
                      {isUnread ? (
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#1A1A1A] dark:text-[#F0F0EE] border border-black/20 dark:border-white/20 rounded-full px-2 py-0.5">
                          New
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[12.5px] text-[#666666] dark:text-[#9A9A96]">
                      <span className="font-medium text-[#1A1A1A] dark:text-[#F0F0EE]">
                        {msg.name}
                      </span>
                      <span aria-hidden="true" className="mx-1.5 opacity-45">·</span>
                      <span className="font-mono text-[12px]">{msg.email}</span>
                    </p>
                  </div>

                  <span className="font-mono text-[11px] text-[#666666] dark:text-[#9A9A96] shrink-0">
                    {formatDate(msg.createdAt)}
                  </span>
                </div>

                <p className="text-[13.5px] leading-[1.7] text-[#2A2A2A] dark:text-[#D4D4D0] whitespace-pre-wrap border-t border-[#EAEAEA] dark:border-[#222220] pt-3.5">
                  {msg.message}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject}`)}`}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] px-3.5 text-[11.5px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-85 transition-opacity"
                    >
                      <Mail className="h-3 w-3" />
                      <span>Reply</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => void handleCopyEmail(msg.id, msg.email)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-3 text-[11.5px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Email</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={async () => {
                        setBusyId(msg.id);
                        try {
                          await onToggleStatus(msg.id, isUnread ? 'read' : 'unread');
                        } finally {
                          setBusyId(null);
                        }
                      }}
                      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-3 text-[11.5px] font-medium text-[#666666] dark:text-[#9A9A96] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <MailOpen className="h-3 w-3" />
                      <span>{isUnread ? 'Mark Read' : 'Mark Unread'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={async () => {
                        setBusyId(msg.id);
                        try {
                          await onDelete(msg.id);
                        } finally {
                          setBusyId(null);
                        }
                      }}
                      className="inline-flex h-8 items-center gap-1 rounded-full border border-red-500/25 px-3 text-[11.5px] font-medium text-red-700 dark:text-red-400 hover:border-red-500 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
