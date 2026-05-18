import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const location = useLocation()
  const isEditor = location.pathname === '/editor'
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5" style={{ textDecoration: 'none' }}>
        <div
          className="flex items-center justify-center"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00f5ff, #a855f7)',
            flexShrink: 0,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#030712" strokeWidth="2.5" style={{ width: '16px', height: '16px' }}>
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
      </Link>

      {/* Nav links */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        {!isEditor && (
          <div className="hidden md:flex items-center" style={{ gap: '4px' }}>
            {[
              { href: '#features', label: 'Features' },
              { href: '#workflow', label: 'How It Works' },
              { href: '#demo', label: 'Try Demo' },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                style={{
                  color: 'var(--color-text-secondary)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'color 0.2s ease, background 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--color-text)'
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--color-text-secondary)'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                {label}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <Link to={isEditor ? '/' : '/editor'} style={{ textDecoration: 'none' }}>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="btn btn-primary btn-sm"
        >
          {isEditor ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '14px', height: '14px' }}>
                <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Home
            </>
          ) : (
            <>
              Open Editor
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '14px', height: '14px' }}>
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          )}
        </motion.button>
      </Link>
    </motion.nav>
  )
}
