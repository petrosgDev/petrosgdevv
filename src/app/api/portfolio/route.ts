import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseAdminIdToken } from '@/lib/adminAccess';
import { isAiCrawlerUserAgent } from '@/lib/dataShield';
import { verifyAdminAuthorizationHeader } from '@/lib/adminAuth';
import { readPortfolioRecord, writePortfolioRecord } from '@/lib/portfolioStore';
import firebaseConfig from '../../../../firebase-applet-config.json';

export const dynamic = 'force-dynamic';

const RESPONSE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store, private',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noai, noimageai, noindex, nofollow, noarchive, nosnippet',
  'TDM-Reservation': '1',
};

export async function GET(req: NextRequest) {
  const userAgent = req.headers.get('user-agent') ?? '';
  if (isAiCrawlerUserAgent(userAgent)) {
    return NextResponse.json(
      { error: 'Access restricted.' },
      { status: 403, headers: RESPONSE_HEADERS }
    );
  }

  const record = readPortfolioRecord();
  return NextResponse.json(record, { status: 200, headers: RESPONSE_HEADERS });
}

export async function PUT(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const allowed =
    verifyAdminAuthorizationHeader(authHeader) ||
    (await verifyFirebaseAdminIdToken(authHeader, firebaseConfig.apiKey));
  if (!allowed) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in with the owner Google account.' },
      { status: 401, headers: RESPONSE_HEADERS }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON payload.' },
      { status: 400, headers: RESPONSE_HEADERS }
    );
  }

  const payload =
    body && typeof body === 'object' && 'data' in body
      ? (body as { data?: unknown }).data
      : body;

  const saved = writePortfolioRecord(payload);
  if (!saved.ok) {
    return NextResponse.json(
      { error: saved.errors[0] || 'Validation failed.', errors: saved.errors },
      { status: 400, headers: RESPONSE_HEADERS }
    );
  }

  return NextResponse.json(saved.record, {
    status: 200,
    headers: RESPONSE_HEADERS,
  });
}
