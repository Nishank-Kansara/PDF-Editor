import { motion } from 'framer-motion'

const steps = [
  {
    number: '01',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '24px', height: '24px' }}>
        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Upload PDF',
    desc: 'Drag and drop or select any typed PDF document from your device.',
    color: '#00f5ff',
    rgb: '0,245,255',
  },
  {
    number: '02',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '24px', height: '24px' }}>
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Type Instruction',
    desc: 'Describe your edit in plain English — replace text, translate, watermark, and more.',
    color: '#a855f7',
    rgb: '168,85,247',
  },
  {
    number: '03',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '24px', height: '24px' }}>
        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'AI Processes',
    desc: 'GPT-4.1-mini understands your intent and applies precise edits to the document.',
    color: '#3b82f6',
    rgb: '59,130,246',
  },
  {
    number: '04',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '24px', height: '24px' }}>
        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Download Result',
    desc: 'Your edited PDF is ready instantly. Download and use it immediately.',
    color: '#10b981',
    rgb: '16,185,129',
  },
]

export default function WorkflowSection() {
  return (
    <section className="section" id="workflow" style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '64px' }}
        >
          <span className="badge badge-purple" style={{ marginBottom: '16px' }}>
            How It Works
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              lineHeight: 1.15,
              marginTop: '12px',
            }}
          >
            From upload to{' '}
            <span className="gradient-text">download in seconds</span>
          </h2>
        </motion.div>

        {/* Steps grid */}
        <div
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '32px',
          }}
        >
          {/* Connector line (large screens) */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: '10%',
              right: '10%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.3), rgba(168,85,247,0.3), transparent)',
              pointerEvents: 'none',
            }}
          />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
            >
              {/* Step orb */}
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 1,
                    background: `radial-gradient(circle, rgba(${step.rgb}, 0.14), rgba(${step.rgb}, 0.03))`,
                    border: `1.5px solid rgba(${step.rgb}, 0.35)`,
                    boxShadow: `0 0 32px rgba(${step.rgb}, 0.18)`,
                    color: step.color,
                    transition: 'box-shadow 0.3s ease',
                  }}
                >
                  {step.icon}
                </div>
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: step.color,
                    color: '#030712',
                    fontSize: '9px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    letterSpacing: '0.02em',
                    boxShadow: `0 2px 8px rgba(${step.rgb}, 0.5)`,
                  }}
                >
                  {step.number}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  marginBottom: '10px',
                }}
              >
                {step.title}
              </h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--color-text-secondary)', maxWidth: '220px' }}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
