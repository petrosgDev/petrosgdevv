import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuthorizationHeader } from '@/lib/adminAuth';
import { resetPortfolioRecord } from '@/lib/portfolioStore';

export const dynamic = 'force-dynamic';

const RESPONSE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store, private',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noai, noimageai, noindex, nofollow, noarchive, nosnippet',
};

export async function POST(req: NextRequest) {
  if (!verifyAdminAuthorizationHeader(req.headers.get('authorization'))) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in to the admin studio.' },
      { status: 401, headers: RESPONSE_HEADERS }
    );
  }

  const record = resetPortfolioRecord();
  return NextResponse.json(record, { status: 200, headers: RESPONSE_HEADERS });
}
