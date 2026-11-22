import { NextRequest, NextResponse } from 'next/server';
import {
  checkLoginRateLimit,
  clearLoginFailures,
  getAdminAuthMode,
  issueAdminSessionToken,
  recordLoginFailure,
  verifyAdminPassword,
} from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const PRIVATE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store, private',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noai, noimageai, noindex, nofollow, noarchive, nosnippet',
};

function getClientKey(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim() || 'unknown';
  }
  return req.headers.get('x-real-ip') || 'local';
}

export async function POST(req: NextRequest) {
  const mode = getAdminAuthMode();
  if (mode === 'claim') {
    return NextResponse.json(
      { error: 'Admin password has not been set up yet.' },
      { status: 409, headers: PRIVATE_HEADERS }
    );
  }

  const clientKey = getClientKey(req);
  const rate = checkLoginRateLimit(clientKey);
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: `Too many failed attempts. Please try again in ${Math.ceil(
          rate.retryAfterSeconds / 60
        )} minute(s).`,
      },
      {
        status: 429,
        headers: {
          ...PRIVATE_HEADERS,
          'Retry-After': String(rate.retryAfterSeconds),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON request body.' },
      { status: 400, headers: PRIVATE_HEADERS }
    );
  }

  const password =
    body && typeof body === 'object' && 'password' in body
      ? String((body as { password?: unknown }).password ?? '')
      : '';

  if (!verifyAdminPassword(password)) {
    recordLoginFailure(clientKey);
    return NextResponse.json(
      { error: 'Invalid admin password.' },
      { status: 401, headers: PRIVATE_HEADERS }
    );
  }

  clearLoginFailures(clientKey);
  const session = issueAdminSessionToken();
  return NextResponse.json(
    {
      token: session.token,
      expiresAt: session.expiresAt,
      mode,
    },
    { status: 200, headers: PRIVATE_HEADERS }
  );
}
