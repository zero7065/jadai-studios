import React from 'react';

export interface DefensiveFallbackProps {
  onNavigate?: (path: string) => void;
  /** Custom failure message. Defaults to an honest load-failure notice. */
  message?: string;
  /** Retry handler. Defaults to a full page reload when omitted. */
  onRetry?: () => void;
}

export default function DefensiveFallback({
  onNavigate,
  message = 'This section failed to load. Nothing else in the studio is affected — retry, or return home.',
  onRetry,
}: DefensiveFallbackProps = {}) {
  const handleHomeClick = (e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate('/');
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050404',
        padding: '1.5rem',
      }}
    >
      <div style={{ textAlign: 'center', color: '#C9A84C', fontFamily: 'Cinzel, serif', maxWidth: '32rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⬡</div>
        <div
          style={{
            fontSize: '0.95rem',
            lineHeight: 1.6,
            marginBottom: '1.5rem',
            fontFamily: 'monospace',
            color: '#c4c0bb',
          }}
        >
          {message}
        </div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleRetry}
            style={{
              background: '#C9A84C',
              color: '#050404',
              border: 'none',
              padding: '0.6rem 1.4rem',
              borderRadius: '0.75rem',
              fontFamily: 'monospace',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
          <a
            href="/"
            onClick={handleHomeClick}
            style={{
              color: '#C9A84C',
              textDecoration: 'none',
              borderBottom: '1px solid #C9A84C',
              padding: '0.6rem 0.4rem',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              alignSelf: 'center',
            }}
          >
            Return home →
          </a>
        </div>
      </div>
    </div>
  );
}
