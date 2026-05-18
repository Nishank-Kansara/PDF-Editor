import { Suspense, lazy, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import FeatureCard from '../components/ui/FeatureCard'
import WorkflowSection from '../components/ui/WorkflowSection'
import Footer from '../components/layout/Footer'
import useEditorStore from '../store/editorStore'
import { uploadPDF } from '../services/api'

// Lazy-load Three.js scene
const HeroScene = lazy(() => import('../components/three/HeroScene'))

const FEATURES = [
  { title: 'AI Text Replacement', description: 'Replace any word, phrase, or name across your entire PDF using natural language. No formatting is lost.' },
  { title: 'Smart Summarization', description: 'Get a concise, intelligent summary appended as a new page — powered by GPT-4.1-mini.' },
  { title: 'Translation', description: 'Translate your PDF into any language with a single sentence. Supports 90+ languages.' },
  { title: 'Watermarking', description: 'Add diagonal watermarks like CONFIDENTIAL, DRAFT, or any custom text to every page instantly.' },
  { title: 'Resume Enhancement', description: 'Paste your resume PDF and get a professionally rewritten version with improved tone and language.' },
  { title: 'Fast Export', description: 'Edited PDFs are ready to download within seconds. No queues, no waiting.' },
]

// ── Upload Drop Zone ──────────────────────────────────────────────────────────
function UploadZone({ onUpload, isUploading }) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef()

  const handleFiles = async (files) => {
    const file = files[0]
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please select a PDF file.')
      return
    }
    await onUpload(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div
      onClick={() => !isUploading && inputRef.current?.click()}
      onDragEnter={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        borderRadius: '16px',
        padding: '40px 32px',
        cursor: isUploading ? 'default' : 'pointer',
        transition: 'all 0.25s ease',
        border: `2px dashed ${isDragging ? '#00f5ff' : 'rgba(255,255,255,0.12)'}`,
        background: isDragging ? 'rgba(0,245,255,0.04)' : 'rgba(255,255,255,0.02)',
        minHeight: '220px',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {isUploading ? (
        <>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '2.5px solid rgba(0,245,255,0.2)',
              borderTopColor: '#00f5ff',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Uploading…</p>
        </>
      ) : (
        <>
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,245,255,0.08)',
              border: '1px solid rgba(0,245,255,0.2)',
              color: '#00f5ff',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '28px', height: '28px' }}>
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text)', fontSize: '0.9375rem', fontWeight: 500, marginBottom: '6px' }}>
              Drop your PDF here, or{' '}
              <span style={{ color: '#00f5ff', fontWeight: 600 }}>browse</span>
            </p>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.8125rem' }}>
              Supports typed PDF files · Max 20 MB
            </p>
          </div>
        </>
      )}
    </div>
  )
}

// ── Demo Section ──────────────────────────────────────────────────────────────
function DemoSection({ onUpload, isUploading }) {
  return (
    <section className="section" id="demo" style={{ paddingBottom: '40px' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
          <span className="badge badge-cyan" style={{ marginBottom: '16px' }}>
            <span className="status-dot status-dot-cyan" />
            Try It Now
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              lineHeight: 1.15,
              marginTop: '12px',
              marginBottom: '16px',
            }}
          >
            Upload your PDF &{' '}
            <span className="gradient-text">let AI do the rest</span>
          </h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '1rem', maxWidth: '480px', margin: '0 auto' }}>
            No account needed. Upload any typed PDF and edit it with a single sentence.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{ maxWidth: '540px', margin: '0 auto' }}
        >
          <div
            style={{
              borderRadius: '20px',
              overflow: 'hidden',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
            }}
          >
            {/* Card header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {['#f87171', '#fbbf24', '#34d399'].map((c, i) => (
                <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
              ))}
              <span style={{ color: 'var(--color-muted)', fontSize: '0.75rem', marginLeft: '6px' }}>
                pdfai.app — upload
              </span>
            </div>
            <div style={{ padding: '24px' }}>
              <UploadZone onUpload={onUpload} isUploading={isUploading} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ── Landing Page ──────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()
  const { setUpload, setUploadedFile } = useEditorStore()
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = useCallback(async (file) => {
    setIsUploading(true)
    try {
      const data = await uploadPDF(file)
      setUpload(data)
      setUploadedFile(file)
      navigate('/editor')
    } catch (err) {
      alert('Upload failed: ' + (err?.response?.data?.detail ?? err.message))
    } finally {
      setIsUploading(false)
    }
  }, [navigate, setUpload, setUploadedFile])

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          overflow: 'hidden',
          minHeight: '100vh',
          paddingTop: 'var(--navbar-height)',
        }}
      >
        {/* Animated background blobs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div
            className="animate-blob"
            style={{
              position: 'absolute',
              width: '700px',
              height: '700px',
              top: '-250px',
              right: '-150px',
              background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
              borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            }}
          />
          <div
            className="animate-blob"
            style={{
              position: 'absolute',
              width: '600px',
              height: '600px',
              bottom: '-150px',
              left: '-150px',
              background: 'radial-gradient(circle, rgba(0,245,255,0.08) 0%, transparent 70%)',
              borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%',
              animationDelay: '4s',
            }}
          />
        </div>

        {/* Three.js Canvas */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
        </div>

        {/* Hero Content */}
        <div style={{ position: 'relative', zIndex: 10, padding: '0 24px', maxWidth: '900px', width: '100%' }}>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ marginBottom: '28px' }}
          >
            <span className="badge badge-cyan">
              <span className="status-dot status-dot-cyan" />
              Powered by GPT-4.1-mini
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              marginBottom: '24px',
            }}
          >
            Edit PDFs With{' '}
            <span className="gradient-text text-glow-cyan">AI</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              maxWidth: '560px',
              margin: '0 auto 36px',
              lineHeight: 1.7,
            }}
          >
            Upload any PDF and modify it using{' '}
            <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>natural language</span>.
            Replace text, translate, watermark, summarize — instantly.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
            }}
          >
            <label htmlFor="hero-upload" style={{ cursor: 'pointer' }}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-primary btn-lg"
                style={{ cursor: 'pointer', minWidth: '180px' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '18px', height: '18px' }}>
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Upload PDF
              </motion.div>
              <input
                id="hero-upload"
                type="file"
                accept=".pdf"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])}
              />
            </label>

            <a href="#demo" style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn btn-secondary btn-lg"
                style={{ minWidth: '160px' }}
              >
                Try Demo
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '16px', height: '16px' }}>
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '40px',
              marginTop: '56px',
            }}
          >
            {[
              { value: '6+', label: 'Edit Actions' },
              { value: '90+', label: 'Languages' },
              { value: '<5s', label: 'Processing' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p
                  className="gradient-text"
                  style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1 }}
                >
                  {s.value}
                </p>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.75rem', marginTop: '4px', fontWeight: 500 }}>
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{
            position: 'absolute',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ color: 'var(--color-muted)', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '20px', height: '20px', color: 'var(--color-muted)' }}>
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section className="section" id="features">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '56px' }}
          >
            <span className="badge badge-purple" style={{ marginBottom: '16px' }}>
              Capabilities
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontWeight: 700,
                lineHeight: 1.15,
                marginTop: '12px',
                marginBottom: '16px',
              }}
            >
              Everything you need to{' '}
              <span className="gradient-text">edit PDFs</span>
            </h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '1rem', maxWidth: '480px', margin: '0 auto' }}>
              One tool, infinite possibilities. Just describe what you want in plain English.
            </p>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} {...f} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── WORKFLOW ─────────────────────────────────────────────────────── */}
      <WorkflowSection />

      {/* ── DEMO UPLOAD ──────────────────────────────────────────────────── */}
      <DemoSection onUpload={handleUpload} isUploading={isUploading} />

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <Footer />
    </div>
  )
}
