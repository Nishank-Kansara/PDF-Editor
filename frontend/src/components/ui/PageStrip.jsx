import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import useEditorStore from '../../store/editorStore'

/**
 * PageStrip — left vertical column showing thumbnail for every page.
 * Clicking a thumbnail navigates to that page in the PDF viewer.
 */
export default function PageStrip() {
  const { pages, currentPage, setCurrentPage, fileId } = useEditorStore()
  const stripRef = useRef()

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (!stripRef.current) return
    const active = stripRef.current.querySelector('[data-active="true"]')
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [currentPage])

  if (!fileId || pages.length === 0) return null

  return (
    <div
      className="page-strip scrollable"
      style={{
        width: '100px',
        flexShrink: 0,
        borderRight: '1px solid var(--color-border)',
        background: 'var(--color-surface-2)',
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '10px 8px',
      }}
      ref={stripRef}
    >
      {pages.length === 0 ? (
        /* Skeleton placeholders while thumbnails load */
        Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{ width: '100%', height: '120px', borderRadius: '6px', flexShrink: 0 }}
          />
        ))
      ) : (
        pages.map((p) => {
          const isActive = p.page === currentPage
          return (
            <motion.button
              key={p.page}
              data-active={isActive}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCurrentPage(p.page)}
              style={{
                all: 'unset',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                flexShrink: 0,
                borderRadius: '8px',
                padding: '5px',
                background: isActive ? 'rgba(0,245,255,0.08)' : 'transparent',
                border: isActive
                  ? '1.5px solid rgba(0,245,255,0.4)'
                  : '1.5px solid transparent',
                transition: 'background 0.2s, border-color 0.2s',
              }}
            >
              <img
                src={p.data}
                alt={`Page ${p.page}`}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '4px',
                  display: 'block',
                  objectFit: 'contain',
                  boxShadow: isActive
                    ? '0 0 10px rgba(0,245,255,0.3)'
                    : '0 2px 8px rgba(0,0,0,0.4)',
                  filter: isActive ? 'brightness(1.05)' : 'brightness(0.85)',
                  transition: 'box-shadow 0.2s, filter 0.2s',
                }}
              />
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  color: isActive ? '#00f5ff' : 'var(--color-muted)',
                  letterSpacing: '0.03em',
                  transition: 'color 0.2s',
                }}
              >
                {p.page}
              </span>
            </motion.button>
          )
        })
      )}
    </div>
  )
}
