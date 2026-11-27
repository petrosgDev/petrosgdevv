import { NextRequest, NextResponse } from 'next/server';
import { getDefaultPortfolioBundle } from '@/data/portfolio';
import { getPublishedPortfolioServer } from '@/lib/serverPortfolio';
import { generateResumePdfBytes } from '@/lib/resumePdf';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const snapshot = await getPublishedPortfolioServer();
    const bundle = snapshot?.data ?? getDefaultPortfolioBundle();
    const hostHeader = request.headers.get('host');
    const protoHeader = request.headers.get('x-forwarded-proto') || 'https';
    const requestOrigin = hostHeader ? `${protoHeader}://${hostHeader}` : undefined;
    const pdfBytes = await generateResumePdfBytes(bundle, requestOrigin);

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="Petros-Geto-Resume.pdf"',
        'Cache-Control': 'no-store, must-revalidate',
        'X-Robots-Tag': 'index, follow',
      },
    });
  } catch (error) {
    console.error('Failed to generate resume PDF:', error);
    return NextResponse.json(
      { error: 'Unable to generate resume PDF at this moment.' },
      { status: 500 }
    );
  }
}
