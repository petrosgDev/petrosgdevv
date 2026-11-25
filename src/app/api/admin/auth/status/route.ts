import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminAuthMode,
  isAdminRequestAuthorized,
} from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const PRIVATE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store, private',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noai, noimageai, noindex, nofollow, noarchive, nosnippet',
};

export async function GET(req: NextRequest) {
  const mode = getAdminAuthMode();
  const authenticated = isAdminRequestAuthorized(
    req.headers.get('authorization')
  );

  return NextResponse.json(
    { mode, authenticated },
    { status: 200, headers: PRIVATE_HEADERS }
  );
}
