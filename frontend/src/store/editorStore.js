import { create } from 'zustand'
import { getDownloadUrl } from '../services/api'

const useEditorStore = create((set) => ({
  // Upload state
  fileId: null,
  fileName: null,
  pageCount: 0,
  textPreview: '',
  uploadedFile: null,  // raw File object for PDF.js viewer
  pages: [],           // array of {page, width, height, data} thumbnails

  // Edit state
  instruction: '',
  isProcessing: false,
  downloadUrl: null,
  lastAction: null,
  actionDescription: '',

  // Edit history
  editHistory: [],

  // UI state
  currentPage: 1,
  zoom: 1.0,

  // ── Actions ──────────────────────────────────────────────────────────────
  setUpload: (data) => set({
    fileId: data.file_id,
    fileName: data.filename,
    pageCount: data.page_count,
    textPreview: data.text_preview,
  }),

  setUploadedFile: (file) => set({ uploadedFile: file }),

  setPages: (pages) => set({ pages }),

  setInstruction: (instruction) => set({ instruction }),

  setProcessing: (isProcessing) => set({ isProcessing }),

  setEditResult: (result) => set((state) => {
    const outputId = result.output_id || result.download_url?.split('/').pop()
    return {
      downloadUrl: getDownloadUrl(outputId),
      lastAction: result.action_taken,
      actionDescription: result.description,
      editHistory: [
        {
          id: Date.now(),
          instruction: state.instruction,
          action: result.action_taken,
          description: result.description,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...state.editHistory,
      ],
      instruction: '',
      isProcessing: false,
    }
  }),

  setCurrentPage: (currentPage) => set({ currentPage }),
  setZoom: (zoom) => set({ zoom }),

  reset: () => set({
    fileId: null,
    fileName: null,
    pageCount: 0,
    textPreview: '',
    uploadedFile: null,
    pages: [],
    instruction: '',
    isProcessing: false,
    downloadUrl: null,
    lastAction: null,
    actionDescription: '',
    editHistory: [],
    currentPage: 1,
    zoom: 1.0,
  }),
}))

export default useEditorStore
