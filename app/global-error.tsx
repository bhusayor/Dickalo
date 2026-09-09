'use client';

/**
 * Last-resort error boundary.
 *
 * Catches failures in the root layout itself, which means React has torn down
 * everything below it — this component must render its own <html> and <body>,
 * and it cannot use any of the site's components or global CSS, because those
 * may be exactly what failed. Hence the inline styles.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F6F5F0',
          color: '#242620',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '2rem',
        }}
      >
        <div style={{ maxWidth: '32rem' }}>
          <h1 style={{ fontSize: '2rem', margin: '0 0 1rem', lineHeight: 1.2 }}>
            The site failed to load.
          </h1>
          <p style={{ color: '#62645A', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
            Something went wrong before the page could render. Reloading usually fixes it. If it
            does not, email studio@dickalo.com.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: '#EDC65A',
              color: '#20211D',
              border: 0,
              padding: '0.875rem 1.75rem',
              borderRadius: 0,
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          {error.digest ? (
            <p style={{ color: '#66665F', fontSize: '0.8125rem', marginTop: '1.5rem' }}>
              Reference: {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
