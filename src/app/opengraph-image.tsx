import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = "Loaves of Love – St. Anne's Episcopal Church"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        <h1
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            color: '#78350F',
            textAlign: 'center',
            margin: '0 0 24px 0',
            lineHeight: 1.1,
          }}
        >
          Loaves of Love
        </h1>
        <p
          style={{
            fontSize: '32px',
            color: '#92400E',
            textAlign: 'center',
            margin: 0,
          }}
        >
          St. Anne&apos;s Episcopal Church · Tifton, Georgia
        </p>
      </div>
    ),
    size,
  )
}
