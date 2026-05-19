import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useEditorStore from '../../store/editorStore'
import { editPDF } from '../../services/api'

// ── Suggestion definitions ─────────────────────────────────────────────────
// Each suggestion has a visible label, an icon emoji, a color accent,
// and the hidden instruction sent to the AI backend.
const SUGGESTIONS = [
  {
    label: 'Dark Mode',
    icon: '🌙',
    accent: '#a855f7',
    accentBg: 'rgba(168,85,247,0.08)',
    accentBorder: 'rgba(168,85,247,0.25)',
    prompt: 'Convert this PDF to dark mode — make the background black and all text white, preserve images',
  },
  {
    label: 'Add Watermark',
    icon: '🔒',
    accent: '#00f5ff',
    accentBg: 'rgba(0,245,255,0.06)',
    accentBorder: 'rgba(0,245,255,0.2)',
    prompt: 'Add a CONFIDENTIAL watermark to all pages',
  },
  {
    label: 'Summarize',
    icon: '📝',
    accent: '#10b981',
    accentBg: 'rgba(16,185,129,0.07)',
    accentBorder: 'rgba(16,185,129,0.22)',
    prompt: 'Summarize this PDF and add a summary page at the end',
  },
  {
    label: 'Translate Hindi',
    icon: '🇮🇳',
    accent: '#f59e0b',
    accentBg: 'rgba(245,158,11,0.07)',
    accentBorder: 'rgba(245,158,11,0.2)',
    prompt: 'Translate this PDF to Hindi',
  },
  {
    label: 'Improve Writing',
    icon: '✨',
    accent: '#3b82f6',
    accentBg: 'rgba(59,130,246,0.07)',
    accentBorder: 'rgba(59,130,246,0.2)',
    prompt: 'Improve the text professionally and rewrite it',
  },
  {
    label: 'Highlight Keys',
    icon: '🔍',
    accent: '#ec4899',
    accentBg: 'rgba(236,72,153,0.07)',
    accentBorder: 'rgba(236,72,153,0.2)',
    prompt: 'Highlight the most important phrases and key points',
  },
  {
    label: 'Replace Text',
    icon: '🔄',
    accent: '#06b6d4',
    accentBg: 'rgba(6,182,212,0.07)',
    accentBorder: 'rgba(6,182,212,0.2)',
    prompt: 'Replace [old text] with [new text]',
    hasInput: true,   // this chip opens a mini input instead of firing directly
  },
]

export default function CommandPanel() {
  const {
    fileId, fileName, instruction, setInstruction,
    isProcessing, setProcessing, setEditResult,
    downloadUrl, actionDescription, editHistory,
  } = useEditorStore()

  const [error, setError] = useState(null)
  const [activeChip, setActiveChip] = useState(null)
  const [customText, setCustomText] = useState('')  // for "Replace Text" mini input

  // ── Fire edit with a given prompt ──────────────────────────────────────
  const fireEdit = async (prompt) => {
    if (!fileId || !prompt.trim()) return
    setError(null)
    setProcessing(true)
    setInstruction(prompt)  // keep store in sync (hidden from UI)
    try {
      const result = await editPDF(fileId, prompt)
      setEditResult(result)
      setActiveChip(null)
      setCustomText('')
    } catch (err) {
      const msg = err?.response?.data?.detail ?? err.message ?? 'Unknown error'
      setError(msg)
      setProcessing(false)
    }
  }

  const handleChipClick = (s) => {
    if (!fileId || isProcessing) return
    if (s.hasInput) {
      setActiveChip(activeChip === s.label ? null : s.label)
    } else {
      fireEdit(s.prompt)
    }
  }

  const canProcess = fileId && !isProcessing

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
              AI Commands
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

        {/* No PDF uploaded state */}
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

        {/* Quick Action chips */}
        {fileId && (
          <div>
            <p
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: 'var(--color-muted)',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Quick Actions
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {SUGGESTIONS.map((s) => {
                const isChipActive = activeChip === s.label
                const isRunning = isProcessing
                return (
                  <div key={s.label}>
                    <motion.button
                      whileHover={canProcess ? { x: 3 } : {}}
                      whileTap={canProcess ? { scale: 0.97 } : {}}
                      onClick={() => handleChipClick(s)}
                      disabled={!canProcess}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: isChipActive ? s.accentBg : 'rgba(255,255,255,0.025)',
                        border: `1px solid ${isChipActive ? s.accentBorder : 'var(--color-border)'}`,
                        cursor: canProcess ? 'pointer' : 'not-allowed',
                        opacity: canProcess ? 1 : 0.5,
                        transition: 'all 0.2s ease',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{s.icon}</span>
                      <span
                        style={{
                          flex: 1,
                          fontFamily: 'var(--font-sans)',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: isChipActive ? s.accent : 'var(--color-text)',
                          transition: 'color 0.2s',
                        }}
                      >
                        {s.label}
                      </span>
                      {/* Arrow or spinner */}
                      {isRunning && instruction === s.prompt ? (
                        <div
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            border: `2px solid ${s.accent}40`,
                            borderTopColor: s.accent,
                            animation: 'spin 0.7s linear infinite',
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          style={{ width: '14px', height: '14px', color: 'var(--color-muted)', flexShrink: 0 }}>
                          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </motion.button>

                    {/* Mini input for chips that need extra info (e.g., Replace Text) */}
                    <AnimatePresence>
                      {isChipActive && s.hasInput && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div
                            style={{
                              marginTop: '6px',
                              padding: '12px',
                              borderRadius: 'var(--radius-md)',
                              background: s.accentBg,
                              border: `1px solid ${s.accentBorder}`,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                            }}
                          >
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                              Type your instruction (e.g. "Replace John with Nishank"):
                            </p>
                            <textarea
                              className="input-field"
                              rows={3}
                              placeholder='e.g. Replace "John" with "Nishank"'
                              value={customText}
                              onChange={(e) => setCustomText(e.target.value)}
                              style={{ fontFamily: 'var(--font-sans)', resize: 'none', fontSize: '0.8125rem' }}
                            />
                            <motion.button
                              whileTap={{ scale: 0.97 }}
                              onClick={() => customText.trim() && fireEdit(customText)}
                              disabled={!customText.trim()}
                              className="btn btn-primary btn-sm"
                            >
                              Apply
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        )}

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
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: 'var(--color-muted)',
                marginBottom: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              History
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Processing overlay message */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0,245,255,0.05)',
                border: '1px solid rgba(0,245,255,0.15)',
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  border: '2px solid rgba(0,245,255,0.2)',
                  borderTopColor: '#00f5ff',
                  animation: 'spin 0.75s linear infinite',
                  flexShrink: 0,
                }}
              />
              <p style={{ color: '#00f5ff', fontSize: '0.8125rem', fontWeight: 500 }}>
                AI is processing your PDF…
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
