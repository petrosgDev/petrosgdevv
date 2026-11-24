import { NextRequest, NextResponse } from 'next/server';
import { isAiCrawlerUserAgent } from '@/lib/dataShield';
import {
  parseTelegramChannelHtml,
  sanitizeTelegramBeforeParam,
  TELEGRAM_CHANNEL_USERNAME,
} from '@/lib/telegramParser';
import { extractFirestoreTelegramChannel } from '@/lib/adminAccess';
import firebaseConfig from '../../../../firebase-applet-config.json';

export const dynamic = 'force-dynamic';

const SECURITY_HEADERS: Record<string, string> = {
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noai, noimageai, noindex, nofollow, noarchive, nosnippet',
  'TDM-Reservation': '1',
};

async function resolveConfiguredTelegramChannel(): Promise<string> {
  try {
    const restUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      firebaseConfig.projectId
    )}/databases/${encodeURIComponent(
      firebaseConfig.firestoreDatabaseId
    )}/documents/portfolio/published`;

    const res = await fetch(restUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return TELEGRAM_CHANNEL_USERNAME;
    const json = await res.json();
    return extractFirestoreTelegramChannel(json) ?? TELEGRAM_CHANNEL_USERNAME;
  } catch {
    return TELEGRAM_CHANNEL_USERNAME;
  }
}

export async function GET(req: NextRequest) {
  const userAgent = req.headers.get('user-agent') ?? '';
  if (isAiCrawlerUserAgent(userAgent)) {
    return NextResponse.json(
      { error: 'Access restricted.' },
      { status: 403, headers: SECURITY_HEADERS }
    );
  }

  const rawBefore = req.nextUrl.searchParams.get('before');
  const safeBefore = sanitizeTelegramBeforeParam(rawBefore);
  if (rawBefore && !safeBefore) {
    return NextResponse.json(
      { error: 'Invalid pagination parameter.' },
      { status: 400, headers: SECURITY_HEADERS }
    );
  }

  const configuredChannel = await resolveConfiguredTelegramChannel();

  // Strictly locked to the allowlisted Telegram public channel endpoint (no SSRF surface)
  const channelWebUrl = `https://t.me/s/${configuredChannel}`;
  const upstreamUrl = safeBefore
    ? `${channelWebUrl}?before=${safeBefore}`
    : channelWebUrl;

  try {
    const response = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Telegram channel responded with status ${response.status}.` },
        { status: 502, headers: SECURITY_HEADERS }
      );
    }

    const html = await response.text();
    const payload = parseTelegramChannelHtml(html);

    return NextResponse.json(payload, {
      status: 200,
      headers: SECURITY_HEADERS,
    });
  } catch {
    return NextResponse.json(
      { error: 'Unable to reach Telegram channel right now. Please try again shortly.' },
      { status: 502, headers: SECURITY_HEADERS }
    );
  }
}
