import { NextRequest, NextResponse } from 'next/server';
import { verifyFirebaseAdminIdToken } from '@/lib/adminAccess';
import { verifyAdminAuthorizationHeader } from '@/lib/adminAuth';
import { resetPortfolioRecord } from '@/lib/portfolioStore';
import firebaseConfig from '../../../../../firebase-applet-config.json';

export const dynamic = 'force-dynamic';

const RESPONSE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store, private',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noai, noimageai, noindex, nofollow, noarchive, nosnippet',
};

export async function POST(req: NextRequest) {
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

  const record = resetPortfolioRecord();
  return NextResponse.json(record, { status: 200, headers: RESPONSE_HEADERS });
}
