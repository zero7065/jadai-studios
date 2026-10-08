import React from 'react';

export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050404' }}>
      <div style={{ textAlign: 'center', color: '#C9A84C', fontFamily: 'Cinzel, serif' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⬡</div>
        <div>
          This section is loading.{' '}
          <a href="/" style={{ color: '#C9A84C', textDecoration: 'none', borderBottom: '1px solid #C9A84C' }}>
            Return home →
          </a>
        </div>
      </div>
    </div>
  );
}
