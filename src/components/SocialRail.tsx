'use client';

import { Github, Linkedin, MessageCircle, Send } from 'lucide-react';
import { SITE_PROFILE } from '@/data/portfolio';

interface SocialRailItem {
  id: string;
  label: string;
  handle: string;
  href: string;
  icon: typeof Github;
}

const RAIL_SOCIALS: SocialRailItem[] = [
  {
    id: 'github',
    label: 'GitHub',
    handle: SITE_PROFILE.githubHandle,
    href: SITE_PROFILE.githubUrl,
    icon: Github,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    handle: SITE_PROFILE.linkedinHandle,
    href: SITE_PROFILE.linkedinUrl,
    icon: Linkedin,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    handle: SITE_PROFILE.telegramHandle,
    href: SITE_PROFILE.telegramUrl,
    icon: Send,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    handle: SITE_PROFILE.phoneDisplay,
    href: SITE_PROFILE.whatsappUrl,
    icon: MessageCircle,
  },
];

export function SocialRail() {
  return (
    <aside
      aria-label="Social media accounts"
      className="fixed right-5 top-24 z-40 hidden xl:flex flex-col items-center gap-1.5 rounded-full border border-black/[0.08] dark:border-white/[0.1] bg-[#F5F5F4]/92 dark:bg-[#17191C]/92 p-1.5 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.07)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
    >
      {RAIL_SOCIALS.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.id}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${item.label} (${item.handle})`}
            className="group relative flex h-10 w-10 items-center justify-center rounded-full text-[#5A5A56] dark:text-[#A8ABB0] transition-all duration-200 hover:bg-white dark:hover:bg-[#2B2E33] hover:text-[#111110] dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A] dark:focus-visible:ring-white/60"
          >
            <Icon className="h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
            <span
              role="tooltip"
              className="pointer-events-none absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 translate-x-1 opacity-0 whitespace-nowrap rounded-lg border border-black/[0.08] dark:border-white/[0.1] bg-white/95 dark:bg-[#17191C]/95 px-2.5 py-1 text-[11px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] shadow-md backdrop-blur-md transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
            >
              {item.label}
              <span className="ml-1.5 font-mono text-[10px] text-[#666666] dark:text-[#9A9A96]">
                {item.handle}
              </span>
            </span>
          </a>
        );
      })}
    </aside>
  );
}
