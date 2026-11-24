import { ImageResponse } from 'next/og';

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#0A0A0A',
          color: '#F5F5F2',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top editorial hairline header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #262624',
            paddingBottom: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              fontSize: '20px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#A3A39E',
            }}
          >
            <span>PETROS G DEV</span>
          </div>
          <div
            style={{
              fontSize: '18px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#8A8A85',
            }}
          >
            ADDIS ABABA, ETHIOPIA
          </div>
        </div>

        {/* Main Identity Block */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            marginTop: '12px',
            marginBottom: '12px',
          }}
        >
          <div
            style={{
              fontSize: '88px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 0.96,
              textTransform: 'uppercase',
              color: '#FFFFFF',
            }}
          >
            PETROS GETO
          </div>
          <div
            style={{
              fontSize: '34px',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: '#D4D4D0',
            }}
          >
            Software Engineer &amp; AI Developer
          </div>
          <div
            style={{
              fontSize: '22px',
              lineHeight: 1.5,
              color: '#9A9A96',
              maxWidth: '900px',
            }}
          >
            Building full-stack web applications, AI-powered systems, cross-platform mobile apps,
            and scalable digital products.
          </div>
        </div>

        {/* Bottom capability bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #262624',
            paddingTop: '24px',
            fontSize: '18px',
            color: '#9A9A96',
            letterSpacing: '0.06em',
          }}
        >
          <div style={{ display: 'flex', gap: '28px' }}>
            <span>NEXT.JS &amp; TYPESCRIPT</span>
            <span>·</span>
            <span>APPLIED AI</span>
            <span>·</span>
            <span>FULL-STACK SYSTEMS</span>
          </div>
          <div style={{ color: '#F5F5F2', fontWeight: 600 }}>github.com/petrosgDev</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    }
  );
}
