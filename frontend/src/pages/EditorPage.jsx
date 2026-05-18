import { useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PDFViewer from '../components/ui/PDFViewer'
import CommandPanel from '../components/ui/CommandPanel'
import useEditorStore from '../store/editorStore'
import { uploadPDF } from '../services/api'

export default function EditorPage() {
  const navigate = useNavigate()
  const { fileName, fileId, setUpload, setUploadedFile, reset } = useEditorStore()
  const inputRef = useRef()

  const handleNewUpload = useCallback(async (file) => {
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) return
    try {
      const data = await uploadPDF(file)
      reset()
      setUpload(data)
      setUploadedFile(file)
    } catch (err) {
      alert('Upload failed: ' + (err?.response?.data?.detail ?? err.message))
    }
  }, [reset, setUpload, setUploadedFile])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'var(--color-bg)',
        overflow: 'hidden',
      }}
    >
      {/* ── Editor Topbar ───────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          height: '56px',
          flexShrink: 0,
          background: 'rgba(3,7,18,0.95)',
          borderBottom: '1px solid var(--color-border)',
          backdropFilter: 'blur(20px)',
          gap: '12px',
        }}
      >
        {/* Left: logo + breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              transition: 'background 0.2s ease',
              flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #00f5ff, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#030712" strokeWidth="2.5" style={{ width: '13px', height: '13px' }}>
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9375rem', color: 'var(--color-text)' }}>
              PDF<span style={{ color: '#00f5ff' }}>AI</span>
            </span>
          </button>

          {fileName && (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                style={{ width: '14px', height: '14px', color: 'var(--color-border)', flexShrink: 0 }}>
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#00f5ff" strokeWidth="1.5"
                  style={{ width: '14px', height: '14px', flexShrink: 0 }}>
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.8125rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '220px',
                  }}
                >
                  {fileName}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Right: actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => inputRef.current?.click()}
            className="btn btn-secondary btn-sm"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            New PDF
          </motion.button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files[0] && handleNewUpload(e.target.files[0])}
          />
        </div>
      </div>

      {/* ── Main Split Layout ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* LEFT: PDF Viewer */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            borderRight: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {fileId ? (
            <PDFViewer />
          ) : (
            <EmptyState onUpload={() => inputRef.current?.click()} />
          )}
        </div>

        {/* RIGHT: AI Command Panel */}
        <div
          style={{
            width: 'var(--sidebar-width)',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'var(--color-surface)',
          }}
        >
          <CommandPanel />
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onUpload }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '20px',
        padding: '40px',
        textAlign: 'center',
        background: 'var(--color-surface)',
      }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,245,255,0.07)',
          border: '1px solid rgba(0,245,255,0.15)',
          color: '#00f5ff',
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ width: '40px', height: '40px' }}>
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.div>

      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px' }}>
          No PDF Loaded
        </h3>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', maxWidth: '280px', lineHeight: 1.6 }}>
          Click <strong style={{ color: 'var(--color-text)' }}>New PDF</strong> in the top bar or upload below to get started.
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        onClick={onUpload}
        className="btn btn-primary btn-md"
        style={{ minWidth: '160px' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '16px', height: '16px' }}>
          <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Upload PDF
      </motion.button>
    </div>
  )
}
