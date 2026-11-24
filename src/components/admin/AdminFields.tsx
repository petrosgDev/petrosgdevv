'use client';

import React, { Component, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';

export const INPUT_CLASS =
  'h-10 w-full rounded-xl border border-black/[0.1] dark:border-white/[0.12] bg-white dark:bg-[#0E0E0D] px-3.5 text-[13px] text-[#1A1A1A] dark:text-[#F0F0EE] placeholder:text-[#666666]/60 dark:placeholder:text-[#9A9A96]/60 focus:border-[#1A1A1A] dark:focus:border-[#F0F0EE] focus:outline-none transition-colors';

export const TEXTAREA_CLASS =
  'w-full rounded-xl border border-black/[0.1] dark:border-white/[0.12] bg-white dark:bg-[#0E0E0D] p-3.5 text-[13px] leading-relaxed text-[#1A1A1A] dark:text-[#F0F0EE] placeholder:text-[#666666]/60 dark:placeholder:text-[#9A9A96]/60 focus:border-[#1A1A1A] dark:focus:border-[#F0F0EE] focus:outline-none transition-colors';

export const CARD_CLASS =
  'rounded-2xl border border-[#EAEAEA] dark:border-[#222220] bg-[#FAFAFA]/70 dark:bg-[#111110] p-5 sm:p-6';

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-6 border-b border-[#EAEAEA] dark:border-[#222220]">
      <div className="space-y-1.5">
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#666666] dark:text-[#9A9A96]">
          {eyebrow}
        </p>
        <h2 className="font-display text-[28px] sm:text-[34px] font-extrabold uppercase leading-[0.98] tracking-tight text-[#1A1A1A] dark:text-[#F0F0EE]">
          {title}
        </h2>
        <p className="max-w-[60ch] text-[13px] leading-relaxed text-[#666666] dark:text-[#9A9A96]">
          {description}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Field({
  id,
  label,
  hint,
  children,
}: {
  id?: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={id}
          className="block text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE]"
        >
          {label}
        </label>
        {hint ? (
          <span className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
            {hint}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function TextInput({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = 'text',
  maxLength,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'url' | 'number';
  maxLength?: number;
}) {
  return (
    <Field id={id} label={label} hint={hint}>
      <input
        id={id}
        type={type}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={INPUT_CLASS}
      />
    </Field>
  );
}

export function TextAreaField({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
  rows = 3,
  maxLength,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <Field id={id} label={label} hint={hint}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={TEXTAREA_CLASS}
      />
    </Field>
  );
}

export function IconActionButton({
  label,
  onClick,
  disabled,
  destructive,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed ${
        destructive
          ? 'border-red-500/25 text-red-700 dark:text-red-400 hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
          : 'border-black/[0.1] dark:border-white/[0.12] text-[#666666] dark:text-[#9A9A96] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE]'
      }`}
    >
      {children}
    </button>
  );
}

export function ReorderControls({
  index,
  total,
  itemLabel,
  onMoveUp,
  onMoveDown,
  onDelete,
  disableDelete,
}: {
  index: number;
  total: number;
  itemLabel: string;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  disableDelete?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <IconActionButton
        label={`Move ${itemLabel} up`}
        onClick={onMoveUp}
        disabled={index === 0}
      >
        <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
      </IconActionButton>
      <IconActionButton
        label={`Move ${itemLabel} down`}
        onClick={onMoveDown}
        disabled={index >= total - 1}
      >
        <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
      </IconActionButton>
      <IconActionButton
        label={`Delete ${itemLabel}`}
        onClick={onDelete}
        disabled={disableDelete}
        destructive
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      </IconActionButton>
    </div>
  );
}

export function moveArrayItem<T>(items: readonly T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length || from === to) return [...items];
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function StringListEditor({
  id,
  label,
  hint,
  items,
  onChange,
  placeholder = 'Add an item...',
  multiline = false,
}: {
  id: string;
  label: string;
  hint?: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [draft, setDraft] = useState('');

  const addItem = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setDraft('');
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={`${id}-new`}
          className="block text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE]"
        >
          {label}
        </label>
        <span className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96] tabular-nums">
          {hint ? `${hint} · ` : ''}
          {items.length}
        </span>
      </div>

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={`${id}-${idx}`} className="flex items-start gap-2">
              {multiline ? (
                <textarea
                  rows={2}
                  aria-label={`${label} item ${idx + 1}`}
                  value={item}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = e.target.value;
                    onChange(next);
                  }}
                  className={`${TEXTAREA_CLASS} py-2`}
                />
              ) : (
                <input
                  type="text"
                  aria-label={`${label} item ${idx + 1}`}
                  value={item}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = e.target.value;
                    onChange(next);
                  }}
                  className={INPUT_CLASS}
                />
              )}
              <div className="flex items-center gap-1 pt-1 shrink-0">
                <IconActionButton
                  label={`Move ${label} item ${idx + 1} up`}
                  onClick={() => onChange(moveArrayItem(items, idx, idx - 1))}
                  disabled={idx === 0}
                >
                  <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                </IconActionButton>
                <IconActionButton
                  label={`Move ${label} item ${idx + 1} down`}
                  onClick={() => onChange(moveArrayItem(items, idx, idx + 1))}
                  disabled={idx >= items.length - 1}
                >
                  <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                </IconActionButton>
                <IconActionButton
                  label={`Remove ${label} item ${idx + 1}`}
                  onClick={() => onChange(items.filter((_, i) => i !== idx))}
                  destructive
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </IconActionButton>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          id={`${id}-new`}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder={placeholder}
          className={INPUT_CLASS}
        />
        <button
          type="button"
          onClick={addItem}
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-black/[0.12] dark:border-white/[0.14] px-4 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
}

interface BoundaryState {
  hasError: boolean;
  message: string;
}

export class AdminErrorBoundary extends Component<
  { children: React.ReactNode },
  BoundaryState
> {
  state: BoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return {
      hasError: true,
      message: error?.message || 'An unexpected error occurred in Admin Studio.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-xl px-6 py-24">
          <div className={`${CARD_CLASS} space-y-4`}>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-red-700 dark:text-red-400">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <span>Studio Recovery</span>
            </div>
            <h1 className="font-display text-3xl font-extrabold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
              Something went wrong
            </h1>
            <p className="text-[13px] leading-relaxed text-[#666666] dark:text-[#9A9A96] break-words">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, message: '' })}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#1A1A1A] dark:bg-[#F0F0EE] px-5 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-85 transition-opacity cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reload Studio</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
