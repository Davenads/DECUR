import { ImageResponse } from '@vercel/og';
import type { NextRequest } from 'next/server';

export const config = { runtime: 'edge' };

export default function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title    = searchParams.get('title')    ?? 'DECUR';
  const subtitle = searchParams.get('subtitle') ?? 'UAP & NHI Research Archive';

  // Adjust font size based on title length
  const titleSize = title.length > 30 ? 52 : title.length > 20 ? 62 : 76;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f1117',
          padding: '60px 80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Top-left DECUR label */}
        <div
          style={{
            position: 'absolute',
            top: '44px',
            left: '60px',
            fontSize: '15px',
            fontWeight: 700,
            letterSpacing: '0.25em',
            color: '#4b5563',
            textTransform: 'uppercase',
          }}
        >
          DECUR
        </div>

        {/* Accent line */}
        <div
          style={{
            width: '60px',
            height: '3px',
            backgroundColor: '#3b82f6',
            marginBottom: '28px',
            borderRadius: '2px',
          }}
        />

        {/* Main title */}
        <div
          style={{
            fontSize: `${titleSize}px`,
            fontWeight: 700,
            color: '#f9fafb',
            textAlign: 'center',
            lineHeight: 1.1,
            marginBottom: '20px',
            maxWidth: '960px',
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '22px',
            color: '#6b7280',
            textAlign: 'center',
            lineHeight: 1.4,
            maxWidth: '800px',
          }}
        >
          {subtitle}
        </div>

        {/* Bottom tag line */}
        <div
          style={{
            position: 'absolute',
            bottom: '44px',
            display: 'flex',
            gap: '16px',
            fontSize: '14px',
            color: '#374151',
            letterSpacing: '0.1em',
          }}
        >
          <span>UAP</span>
          <span>·</span>
          <span>NHI</span>
          <span>·</span>
          <span>CLASSIFIED PROGRAMS</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
