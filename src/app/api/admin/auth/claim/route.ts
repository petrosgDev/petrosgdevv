import { NextRequest, NextResponse } from 'next/server';
import {
  claimAdminPassword,
  issueAdminSessionToken,
} from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const PRIVATE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store, private',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noai, noimageai, noindex, nofollow, noarchive, nosnippet',
};

export async function POST(req: NextRequest) {
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

  const claimed = claimAdminPassword(password);
  if (!claimed.ok) {
    return NextResponse.json(
      { error: claimed.error },
      { status: claimed.status, headers: PRIVATE_HEADERS }
    );
  }

  const session = issueAdminSessionToken();
  return NextResponse.json(
    {
      token: session.token,
      expiresAt: session.expiresAt,
      mode: 'claimed',
    },
    { status: 201, headers: PRIVATE_HEADERS }
  );
}
