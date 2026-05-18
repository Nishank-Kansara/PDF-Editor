import { motion } from 'framer-motion'
import { useRef } from 'react'

const iconMap = {
  'AI Text Replacement': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '22px', height: '22px' }}>
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'Smart Summarization': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '22px', height: '22px' }}>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'Translation': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '22px', height: '22px' }}>
      <path d="M3 5h12M9 3v2m-3.232 13.232a7.5 7.5 0 1010.607-10.607" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13 21l2.5-5 2.5 5M14.5 18.5h3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'Watermarking': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '22px', height: '22px' }}>
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'Resume Enhancement': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '22px', height: '22px' }}>
      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'Fast Export': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '22px', height: '22px' }}>
      <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

const colorMap = {
  'AI Text Replacement': { icon: '#00f5ff', rgb: '0,245,255' },
  'Smart Summarization': { icon: '#a855f7', rgb: '168,85,247' },
  'Translation':         { icon: '#3b82f6', rgb: '59,130,246' },
  'Watermarking':        { icon: '#f59e0b', rgb: '245,158,11' },
  'Resume Enhancement':  { icon: '#ec4899', rgb: '236,72,153' },
  'Fast Export':         { icon: '#10b981', rgb: '16,185,129' },
}

export default function FeatureCard({ title, description, index }) {
  const colors = colorMap[title] ?? { icon: '#00f5ff', rgb: '0,245,255' }
  const cardRef = useRef()
  const glowRef = useRef()
  const iconRef = useRef()
  const accentRef = useRef()

  const handleEnter = () => {
    if (cardRef.current) {
      cardRef.current.style.borderColor = `rgba(${colors.rgb}, 0.25)`
      cardRef.current.style.boxShadow = `0 20px 56px rgba(0,0,0,0.4), 0 0 0 1px rgba(${colors.rgb}, 0.08)`
    }
    if (glowRef.current) glowRef.current.style.opacity = '1'
    if (iconRef.current) iconRef.current.style.transform = 'scale(1.12)'
    if (accentRef.current) accentRef.current.style.width = '100%'
  }

  const handleLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.borderColor = 'rgba(255,255,255,0.07)'
      cardRef.current.style.boxShadow = 'none'
    }
    if (glowRef.current) glowRef.current.style.opacity = '0'
    if (iconRef.current) iconRef.current.style.transform = 'scale(1)'
    if (accentRef.current) accentRef.current.style.width = '0%'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6 }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{ cursor: 'default' }}
    >
      <div
        ref={cardRef}
        style={{
          position: 'relative',
          padding: '28px 24px',
          borderRadius: '18px',
          border: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(13,17,23,0.85)',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden',
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
          height: '100%',
        }}
      >
        {/* Hover glow overlay */}
        <div
          ref={glowRef}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            transition: 'opacity 0.4s ease',
            background: `radial-gradient(ellipse at 50% 0%, rgba(${colors.rgb}, 0.1), transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Icon */}
        <div
          ref={iconRef}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '18px',
            background: `rgba(${colors.rgb}, 0.1)`,
            border: `1px solid rgba(${colors.rgb}, 0.2)`,
            color: colors.icon,
            transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            position: 'relative',
          }}
        >
          {iconMap[title]}
        </div>

        {/* Content */}
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--color-text)',
            marginBottom: '10px',
            position: 'relative',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: '0.875rem',
            lineHeight: 1.65,
            color: 'var(--color-text-secondary)',
            position: 'relative',
          }}
        >
          {description}
        </p>

        {/* Bottom accent line */}
        <div
          ref={accentRef}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '2px',
            width: '0%',
            background: `linear-gradient(90deg, ${colors.icon}, transparent)`,
            transition: 'width 0.5s ease',
          }}
        />
      </div>
    </motion.div>
  )
}
