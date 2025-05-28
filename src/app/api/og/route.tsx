import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get('tag') || 'tag';

  return new ImageResponse(
    (
      <div
        style={{
          background: '#1a1a1a',
          color: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: 60,
          fontWeight: 'bold',
        }}
      >
        #{tag}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
