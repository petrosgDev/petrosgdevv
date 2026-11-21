export interface TelegramChannelInfo {
  title: string;
  username: string;
  url: string;
  description: string;
  subscribers: string;
  avatarUrl: string | null;
}

export interface TelegramPostLink {
  label: string;
  href: string;
}

export interface TelegramPost {
  id: string;
  postNumber: number;
  permalink: string;
  title: string;
  body: string;
  paragraphs: string[];
  excerpt: string;
  publishedAt: string | null;
  views: string | null;
  images: string[];
  tags: string[];
  links: TelegramPostLink[];
  readTimeMinutes: number;
}

export interface TelegramFeedPayload {
  channel: TelegramChannelInfo;
  posts: TelegramPost[];
  hasMore: boolean;
  nextBefore: number | null;
  fetchedAt: string;
}

export const TELEGRAM_CHANNEL_USERNAME = 'abysiniyatech';
export const TELEGRAM_CHANNEL_URL = `https://t.me/${TELEGRAM_CHANNEL_USERNAME}`;
export const TELEGRAM_CHANNEL_WEB_URL = `https://t.me/s/${TELEGRAM_CHANNEL_USERNAME}`;

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  hellip: '…',
  middot: '·',
  bull: '•',
};

export function sanitizeTelegramBeforeParam(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!/^\d{1,12}$/.test(trimmed)) return null;
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isSafeInteger(parsed) || parsed <= 1) return null;
  return String(parsed);
}

export function sanitizeHttpsUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null;
  const decoded = decodeHtmlEntities(rawUrl.trim());
  const normalized = decoded.startsWith('//') ? `https:${decoded}` : decoded;
  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export function decodeHtmlEntities(input: string): string {
  return input.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (full, entity: string) => {
    if (entity.startsWith('#x') || entity.startsWith('#X')) {
      const code = Number.parseInt(entity.slice(2), 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : full;
    }
    if (entity.startsWith('#')) {
      const code = Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : full;
    }
    return NAMED_ENTITIES[entity] ?? full;
  });
}

function stripTagsToPlainText(html: string): string {
  const withLineBreaks = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|blockquote|pre)>/gi, '\n')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  const withoutTags = withLineBreaks.replace(/<[^>]+>/g, '');
  const decoded = decodeHtmlEntities(withoutTags);

  return decoded
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractBalancedInnerHtml(source: string, classToken: string): string | null {
  const openRegex = new RegExp(`<div[^>]*class="[^"]*\\b${classToken}\\b[^"]*"[^>]*>`, 'i');
  const match = openRegex.exec(source);
  if (!match) return null;

  const startIdx = match.index + match[0].length;
  let depth = 1;
  const tagRegex = /<\/?div\b[^>]*>/gi;
  tagRegex.lastIndex = startIdx;

  let next: RegExpExecArray | null;
  while ((next = tagRegex.exec(source)) !== null) {
    if (next[0].startsWith('</')) {
      depth -= 1;
      if (depth === 0) {
        return source.slice(startIdx, next.index);
      }
    } else if (!next[0].endsWith('/>')) {
      depth += 1;
    }
  }
  return null;
}

function extractPostLinks(textHtml: string): TelegramPostLink[] {
  const links: TelegramPostLink[] = [];
  const seen = new Set<string>();
  const anchorRegex = /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = anchorRegex.exec(textHtml)) !== null) {
    const safeHref = sanitizeHttpsUrl(match[1]);
    if (!safeHref) continue;
    if (safeHref.startsWith(`${TELEGRAM_CHANNEL_URL}?q=`)) continue;
    if (safeHref === TELEGRAM_CHANNEL_URL || safeHref === `${TELEGRAM_CHANNEL_URL}/`) continue;

    const label = stripTagsToPlainText(match[2]).replace(/\s+/g, ' ').trim();
    if (!label || label.startsWith('#')) continue;

    if (!seen.has(safeHref)) {
      seen.add(safeHref);
      links.push({ label, href: safeHref });
    }
  }

  return links;
}

function extractHashtags(plainText: string): string[] {
  const matches = plainText.match(/#[A-Za-z0-9_\u1200-\u137F]+/g) ?? [];
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const tag of matches) {
    const clean = tag.slice(1);
    const key = clean.toLowerCase();
    if (clean.length > 0 && !seen.has(key)) {
      seen.add(key);
      unique.push(clean);
    }
  }
  return unique.slice(0, 6);
}

function deriveTitleAndParagraphs(textHtml: string, plainText: string): {
  title: string;
  body: string;
  paragraphs: string[];
  excerpt: string;
} {
  const trimmedPlain = plainText.trim();
  if (!trimmedPlain) {
    return {
      title: 'Visual Dispatch',
      body: '',
      paragraphs: [],
      excerpt: '',
    };
  }

  // Prefer a leading bold headline (<b>...</b> or <strong>...</strong>) when Telegram authors lead with bold text
  const leadingBoldMatch = textHtml.trim().match(/^<(?:b|strong)\b[^>]*>([\s\S]*?)<\/(?:b|strong)>/i);
  let title = '';
  let remainingBody = trimmedPlain;

  if (leadingBoldMatch) {
    const candidate = stripTagsToPlainText(leadingBoldMatch[1]).replace(/\s+/g, ' ').trim();
    if (candidate.length >= 4 && candidate.length <= 180) {
      title = candidate;
      const afterBoldHtml = textHtml.trim().slice(leadingBoldMatch[0].length);
      const afterBoldPlain = stripTagsToPlainText(afterBoldHtml).replace(/^[\s\-–—:]+/, '').trim();
      remainingBody = afterBoldPlain || trimmedPlain;
    }
  }

  if (!title) {
    const lines = trimmedPlain
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length > 1 && lines[0].length <= 140) {
      title = lines[0];
      remainingBody = lines.slice(1).join('\n\n');
    } else {
      const sentenceMatch = trimmedPlain.match(/^(.{12,135}?[.!?])(?:\s+|$)/);
      if (sentenceMatch) {
        title = sentenceMatch[1].trim();
        const rest = trimmedPlain.slice(sentenceMatch[0].length).trim();
        remainingBody = rest || trimmedPlain;
      } else {
        title = trimmedPlain.length > 110 ? `${trimmedPlain.slice(0, 107).trimEnd()}…` : trimmedPlain;
        remainingBody = trimmedPlain;
      }
    }
  }

  const paragraphs = remainingBody
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const flatBody = paragraphs.join(' ');
  const excerpt =
    flatBody.length > 220 ? `${flatBody.slice(0, 217).trimEnd()}…` : flatBody;

  return {
    title,
    body: remainingBody,
    paragraphs,
    excerpt,
  };
}

function estimateReadTimeMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function parseTelegramChannelHtml(html: string): TelegramFeedPayload {
  // 1. Parse channel header info
  const titleMatch = html.match(
    /class="tgme_channel_info_header_title"[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i
  );
  const title = titleMatch
    ? stripTagsToPlainText(titleMatch[1]).replace(/\s+/g, ' ').trim() || 'Abyssinia Tech'
    : 'Abyssinia Tech';

  const descInner = extractBalancedInnerHtml(html, 'tgme_channel_info_description');
  const description = descInner ? stripTagsToPlainText(descInner) : '';

  const subMatch = html.match(
    /class="counter_value"[^>]*>([^<]+)<\/span>\s*<span[^>]*class="counter_type"[^>]*>\s*subscribers?/i
  );
  const subscribers = subMatch ? decodeHtmlEntities(subMatch[1].trim()) : '';

  const avatarMatch = html.match(
    /class="tgme_page_photo_image[^"]*"[\s\S]*?<img[^>]*src="([^"]+)"/i
  );
  const avatarUrl = sanitizeHttpsUrl(avatarMatch?.[1]);

  // 2. Parse individual message wraps
  const wraps = html.split('class="tgme_widget_message_wrap');
  const parsedPosts: TelegramPost[] = [];

  for (let i = 1; i < wraps.length; i += 1) {
    const chunk = wraps[i];

    // Skip Telegram system/service messages ("Channel created", "Channel photo updated", etc.)
    const messageHeaderMatch = chunk.match(
      /<div[^>]*class="([^"]*tgme_widget_message[^"]*)"[^>]*data-post="([^"]+)"/i
    );
    if (!messageHeaderMatch) continue;

    const messageClasses = messageHeaderMatch[1];
    const dataPost = messageHeaderMatch[2];
    if (/\bservice_message\b/i.test(messageClasses)) continue;

    const postNumberMatch = dataPost.match(/\/(\d+)$/);
    if (!postNumberMatch) continue;
    const postNumber = Number.parseInt(postNumberMatch[1], 10);
    if (!Number.isFinite(postNumber)) continue;

    // Extract images from background-image:url('...') on photo wraps
    const images: string[] = [];
    const seenImages = new Set<string>();
    const photoRegex =
      /class="[^"]*tgme_widget_message_photo_wrap[^"]*"[^>]*style="[^"]*background-image:url\(['"]?([^'")]+)['"]?\)/gi;
    let photoMatch: RegExpExecArray | null;
    while ((photoMatch = photoRegex.exec(chunk)) !== null) {
      const safeImg = sanitizeHttpsUrl(photoMatch[1]);
      if (safeImg && !seenImages.has(safeImg)) {
        seenImages.add(safeImg);
        images.push(safeImg);
      }
    }

    // Extract message text HTML
    const textHtml = extractBalancedInnerHtml(chunk, 'tgme_widget_message_text') ?? '';
    const plainText = stripTagsToPlainText(textHtml);

    // Ignore completely empty messages with neither text nor photos
    if (!plainText && images.length === 0) continue;

    const { title: postTitle, body, paragraphs, excerpt } = deriveTitleAndParagraphs(
      textHtml,
      plainText
    );
    const links = extractPostLinks(textHtml);
    const tags = extractHashtags(plainText);

    const timeMatch = chunk.match(/<time[^>]*datetime="([^"]+)"/i);
    const publishedAt = timeMatch ? timeMatch[1] : null;

    const viewsMatch = chunk.match(/class="tgme_widget_message_views"[^>]*>([^<]+)<\/span>/i);
    const views = viewsMatch ? decodeHtmlEntities(viewsMatch[1].trim()) : null;

    const permalink = `${TELEGRAM_CHANNEL_URL}/${postNumber}`;

    parsedPosts.push({
      id: dataPost,
      postNumber,
      permalink,
      title: postTitle,
      body,
      paragraphs,
      excerpt,
      publishedAt,
      views,
      images,
      tags,
      links,
      readTimeMinutes: estimateReadTimeMinutes(`${postTitle} ${body}`),
    });
  }

  // Sort newest posts first
  parsedPosts.sort((a, b) => b.postNumber - a.postNumber);

  // Check if Telegram provides an older-messages pagination link (?before=...)
  const beforeMatches = Array.from(html.matchAll(/href="\/s\/abysiniyatech\?before=(\d+)"/gi));
  let nextBefore: number | null = null;
  for (const m of beforeMatches) {
    const candidate = Number.parseInt(m[1], 10);
    if (Number.isFinite(candidate) && candidate > 1) {
      nextBefore = nextBefore === null ? candidate : Math.min(nextBefore, candidate);
    }
  }

  return {
    channel: {
      title,
      username: `@${TELEGRAM_CHANNEL_USERNAME}`,
      url: TELEGRAM_CHANNEL_URL,
      description,
      subscribers,
      avatarUrl,
    },
    posts: parsedPosts,
    hasMore: nextBefore !== null && parsedPosts.length > 0,
    nextBefore,
    fetchedAt: new Date().toISOString(),
  };
}
