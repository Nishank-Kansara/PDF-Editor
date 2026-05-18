import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useEditorStore from '../../store/editorStore'
import { editPDF } from '../../services/api'

const SUGGESTIONS = [
  { label: 'Replace text', prompt: 'Replace [old text] with [new text]' },
  { label: 'Add watermark', prompt: 'Add a CONFIDENTIAL watermark to all pages' },
  { label: 'Summarize PDF', prompt: 'Summarize this PDF and add a summary page' },
  { label: 'Translate Hindi', prompt: 'Translate this PDF to Hindi' },
  { label: 'Improve writing', prompt: 'Improve the text professionally and rewrite it' },
  { label: 'Highlight keys', prompt: 'Highlight the most important phrases' },
]

export default function CommandPanel() {
  const {
    fileId, fileName, instruction, setInstruction,
    isProcessing, setProcessing, setEditResult,
    downloadUrl, actionDescription, editHistory,
  } = useEditorStore()

  const [error, setError] = useState(null)

  const handleProcess = async () => {
    if (!fileId || !instruction.trim()) return
    setError(null)
    setProcessing(true)
    try {
      const result = await editPDF(fileId, instruction)
      setEditResult(result)
    } catch (err) {
      const msg = err?.response?.data?.detail ?? err.message ?? 'Unknown error'
      setError(msg)
      setProcessing(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleProcess()
  }

  const canProcess = fileId && instruction.trim() && !isProcessing

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface-2)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(168,85,247,0.15))',
              border: '1px solid rgba(0,245,255,0.2)',
              color: '#00f5ff',
              flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '18px', height: '18px' }}>
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.2 }}>
              AI Command
            </h3>
            {fileName && (
              <p
                style={{
                  color: 'var(--color-muted)',
                  fontSize: '0.75rem',
                  marginTop: '2px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {fileName}
              </p>
            )}
          </div>

          {fileId && (
            <span
              className="badge badge-cyan"
              style={{ marginLeft: 'auto', flexShrink: 0, fontSize: '0.6875rem' }}
            >
              <span className="status-dot status-dot-green" style={{ background: '#10b981' }} />
              Ready
            </span>
          )}
        </div>
      </div>

      {/* ── Body (scrollable) ────────────────────────────────────────────── */}
      <div
        className="scrollable"
        style={{
          flex: 1,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          overflowY: 'auto',
        }}
      >

        {/* Instruction textarea */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              marginBottom: '8px',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}
          >
            Your Instruction
          </label>
          <textarea
            className="input-field"
            rows={5}
            placeholder='e.g. "Replace John with Nishank" or "Add a CONFIDENTIAL watermark"'
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing || !fileId}
            style={{
              fontFamily: 'var(--font-sans)',
              resize: 'none',
              lineHeight: 1.6,
            }}
          />
          <p style={{ color: 'var(--color-muted)', fontSize: '0.75rem', marginTop: '6px' }}>
            Tip: Press <kbd style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
              padding: '1px 6px',
              fontSize: '0.7rem',
              fontFamily: 'monospace',
            }}>Ctrl+Enter</kbd> to process
          </p>
        </div>

        {/* Suggestion chips */}
        <div>
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
          >
            Quick Suggestions
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => setInstruction(s.prompt)}
                disabled={isProcessing || !fileId}
                className="chip chip-cyan"
                style={{ lineHeight: 1.4 }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.22)',
                color: '#f87171',
                fontSize: '0.8125rem',
                lineHeight: 1.5,
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
              }}
            >
              <span style={{ flexShrink: 0, marginTop: '1px' }}>⚠</span>
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success / Download */}
        <AnimatePresence>
          {downloadUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(16,185,129,0.07)',
                border: '1px solid rgba(16,185,129,0.22)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'rgba(16,185,129,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10b981',
                    fontSize: '11px',
                    flexShrink: 0,
                  }}
                >
                  ✓
                </div>
                <p style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 600 }}>Edit complete!</p>
              </div>
              {actionDescription && (
                <p style={{ color: 'var(--color-muted)', fontSize: '0.8125rem', marginBottom: '14px', lineHeight: 1.5 }}>
                  {actionDescription}
                </p>
              )}
              <a
                href={downloadUrl}
                download
                className="btn btn-primary btn-sm btn-full"
                style={{ textDecoration: 'none' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '14px', height: '14px' }}>
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Download Edited PDF
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit History */}
        {editHistory.length > 0 && (
          <div>
            <p
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
              }}
            >
              Edit History
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {editHistory.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '100px',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        background: 'rgba(0,245,255,0.1)',
                        color: '#00f5ff',
                      }}
                    >
                      {item.action}
                    </span>
                    <span style={{ color: 'var(--color-muted)', fontSize: '0.6875rem' }}>{item.timestamp}</span>
                  </div>
                  <p
                    style={{
                      color: 'var(--color-muted)',
                      fontSize: '0.8125rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.instruction}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {!fileId && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px 16px',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255,255,255,0.02)',
              border: '1px dashed var(--color-border)',
              textAlign: 'center',
              gap: '8px',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '32px', height: '32px', color: 'var(--color-muted)' }}>
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>
              Upload a PDF to start editing
            </p>
          </div>
        )}
      </div>

      {/* ── Process Button (sticky footer) ──────────────────────────────── */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          flexShrink: 0,
        }}
      >
        <motion.button
          whileHover={{ scale: canProcess ? 1.02 : 1 }}
          whileTap={{ scale: canProcess ? 0.97 : 1 }}
          onClick={handleProcess}
          disabled={!canProcess}
          className={`btn btn-lg btn-full ${canProcess ? 'btn-primary' : ''}`}
          style={
            !canProcess
              ? {
                  background: 'rgba(255,255,255,0.05)',
                  color: 'var(--color-muted)',
                  cursor: 'not-allowed',
                  border: '1px solid var(--color-border)',
                }
              : {}
          }
        >
          {isProcessing ? (
            <>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  border: '2px solid rgba(3,7,18,0.3)',
                  borderTopColor: '#030712',
                  animation: 'spin 0.75s linear infinite',
                }}
              />
              Processing with AI…
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '16px', height: '16px' }}>
                <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Process with AI
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}
