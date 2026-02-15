import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);

  const title = searchParams.get('title') || 'NeuralCards';
  const author = searchParams.get('author') || 'Vaibhav Kumar Mishra';
  const type = searchParams.get('type') || 'blog'; // blog | topic | default
  const cover = searchParams.get('cover') || ''; // Optional cover image URL

  // Dynamic emoji based on type
  const emoji = type === 'topic' ? '🧠' : type === 'blog' ? '📝' : '🚀';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundImage: cover
            ? 'none'
            : 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
          padding: '60px',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Cover image background */}
        {cover && (
          <img
            src={cover}
            alt=""
            width={1200}
            height={630}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}
        {/* Dark overlay for text readability when cover image is present */}
        {cover && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(30,27,75,0.75) 50%, rgba(49,46,129,0.7) 100%)',
            }}
          />
        )}
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '40px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
              }}
            >
              {emoji}
            </div>
            <span
              style={{
                color: '#c4b5fd',
                fontSize: '24px',
                fontWeight: 700,
                letterSpacing: '-0.5px',
              }}
            >
              NeuralCards
            </span>
          </div>
          <div
            style={{
              color: '#818cf8',
              fontSize: '18px',
              fontWeight: 600,
              padding: '8px 20px',
              borderRadius: '9999px',
              border: '1px solid rgba(129,140,248,0.3)',
              background: 'rgba(129,140,248,0.1)',
            }}
          >
            {type === 'blog' ? 'Blog' : type === 'topic' ? 'Flashcards' : 'Learn AI'}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <h1
            style={{
              fontSize: title.length > 60 ? '48px' : '56px',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.2,
              letterSpacing: '-1px',
              margin: 0,
              maxWidth: '900px',
            }}
          >
            {title}
          </h1>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '40px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                fontWeight: 700,
              }}
            >
              AI
            </div>
            <span style={{ color: '#94a3b8', fontSize: '20px', fontWeight: 500 }}>{author}</span>
          </div>
          <span style={{ color: '#64748b', fontSize: '18px' }}>neural-cards.vercel.app</span>
        </div>

        {/* Decorative gradient orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
