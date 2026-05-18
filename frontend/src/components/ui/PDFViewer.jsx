import { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import useEditorStore from '../../store/editorStore'

// Set worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

export default function PDFViewer() {
  const { uploadedFile, currentPage, setCurrentPage, zoom, setZoom, pageCount } = useEditorStore()
  const canvasRef = useRef()
  const [pdfDoc, setPdfDoc] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [numPages, setNumPages] = useState(0)
  const renderTaskRef = useRef(null)

  // Load PDF when file changes
  useEffect(() => {
    if (!uploadedFile) return
    setIsLoading(true)
    const url = URL.createObjectURL(uploadedFile)

    pdfjsLib.getDocument(url).promise.then((doc) => {
      setPdfDoc(doc)
      setNumPages(doc.numPages)
      setCurrentPage(1)
      setIsLoading(false)
    }).catch((err) => {
      console.error('PDF load error:', err)
      setIsLoading(false)
    })

    return () => URL.revokeObjectURL(url)
  }, [uploadedFile])

  // Render page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return

    const renderPage = async () => {
      if (renderTaskRef.current) {
        try { await renderTaskRef.current.cancel() } catch (_) {}
      }

      const page = await pdfDoc.getPage(currentPage)
      const viewport = page.getViewport({ scale: zoom * 1.5 })
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      canvas.height = viewport.height
      canvas.width = viewport.width

      const task = page.render({ canvasContext: ctx, viewport })
      renderTaskRef.current = task
      try {
        await task.promise
      } catch (err) {
        if (err?.name !== 'RenderingCancelledException') console.error(err)
      }
    }

    renderPage()
  }, [pdfDoc, currentPage, zoom])

  const totalPages = numPages || pageCount || 0

  const iconBtn = {
    width: '32px',
    height: '32px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    outline: 'none',
    flexShrink: 0,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-surface)' }}>

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          height: '48px',
          flexShrink: 0,
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface-2)',
          gap: '12px',
        }}
      >
        {/* Page navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            style={{
              ...iconBtn,
              opacity: currentPage <= 1 ? 0.3 : 1,
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            }}
            data-tooltip="Previous page"
            onMouseEnter={e => { if (currentPage > 1) e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              minWidth: '80px',
              justifyContent: 'center',
            }}
          >
            <span style={{ color: 'var(--color-text)', fontSize: '0.8125rem', fontWeight: 500 }}>{currentPage}</span>
            <span style={{ color: 'var(--color-muted)', fontSize: '0.8125rem' }}>/ {totalPages}</span>
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            style={{
              ...iconBtn,
              opacity: currentPage >= totalPages ? 0.3 : 1,
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            }}
            data-tooltip="Next page"
            onMouseEnter={e => { if (currentPage < totalPages) e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Zoom controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            style={iconBtn}
            data-tooltip="Zoom out"
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div
            style={{
              padding: '4px 10px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              minWidth: '56px',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--color-muted)', fontWeight: 500 }}>
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <button
            onClick={() => setZoom(Math.min(3, zoom + 0.25))}
            style={iconBtn}
            data-tooltip="Zoom in"
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Reset zoom */}
          <button
            onClick={() => setZoom(1)}
            style={{
              ...iconBtn,
              padding: '4px 10px',
              width: 'auto',
              fontSize: '0.75rem',
              color: 'var(--color-muted)',
            }}
            data-tooltip="Reset zoom"
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--color-text)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--color-muted)' }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* ── Canvas Area ──────────────────────────────────────────────────── */}
      <div
        className="scrollable"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'auto',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '24px',
          background: '#111827',
        }}
      >
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '2.5px solid rgba(0,245,255,0.2)',
                borderTopColor: '#00f5ff',
                animation: 'spin 0.75s linear infinite',
              }}
            />
            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Loading PDF…</p>
          </div>
        ) : uploadedFile ? (
          <canvas
            ref={canvasRef}
            style={{
              maxWidth: '100%',
              borderRadius: '6px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
            }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px', textAlign: 'center' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(0,245,255,0.08)',
                color: '#00f5ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '24px', height: '24px' }}>
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>No PDF loaded</p>
          </div>
        )}
      </div>
    </div>
  )
}
