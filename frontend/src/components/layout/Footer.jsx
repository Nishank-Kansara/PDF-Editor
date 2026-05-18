export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border)',
        background: '#030712',
        padding: '40px 0',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '9px',
                background: 'linear-gradient(135deg, #00f5ff, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#030712" strokeWidth="2.5" style={{ width: '15px', height: '15px' }}>
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text)',
                fontWeight: 700,
                fontSize: '1rem',
                letterSpacing: '-0.01em',
              }}
            >
              PDF<span style={{ color: '#00f5ff' }}>AI</span>
            </span>
          </div>

          {/* Tech stack */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {['GPT-4.1-mini', 'PyMuPDF', 'FastAPI', 'React', 'Three.js'].map((tech, i, arr) => (
              <span key={tech} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--color-muted)', fontSize: '0.8125rem' }}>{tech}</span>
                {i < arr.length - 1 && (
                  <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '0.75rem' }}>·</span>
                )}
              </span>
            ))}
          </div>

          <hr className="divider" style={{ width: '100%', maxWidth: '480px' }} />

          <p style={{ color: 'var(--color-muted)', fontSize: '0.8125rem' }}>
            © {new Date().getFullYear()} PDFAI. Built with ❤️ for productivity.
          </p>
        </div>
      </div>
    </footer>
  )
}
