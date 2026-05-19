import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024 // 100 MB

const api = axios.create({
  baseURL: API_BASE,
  timeout: 300000, // 5 minutes (large file uploads + AI calls)
  maxBodyLength: MAX_UPLOAD_BYTES,
  maxContentLength: MAX_UPLOAD_BYTES,
})

/**
 * Upload a PDF file.
 * @param {File} file
 * @returns {{ file_id, filename, page_count, text_preview }}
 */
export async function uploadPDF(file) {
  const form = new FormData()
  form.append('file', file)
  // DO NOT set Content-Type manually — axios + FormData will
  // auto-generate the correct multipart boundary.
  const { data } = await api.post('/upload', form)
  return data
}

/**
 * Fetch per-page thumbnail images for an uploaded PDF.
 * Returns an array of { page, width, height, data } where data is a base64 JPEG data URI.
 * @param {string} fileId
 */
export async function getPageThumbnails(fileId) {
  const { data } = await api.get(`/pages/${fileId}`)
  return data.pages  // array of { page, width, height, data }
}

/**
 * Send an edit instruction to the AI.
 * @param {string} fileId
 * @param {string} instruction
 * @returns {{ output_id, action_taken, description, download_url }}
 */
export async function editPDF(fileId, instruction) {
  const { data } = await api.post('/edit', {
    file_id: fileId,
    instruction,
  })
  return data
}

/**
 * Get the full download URL for an edited PDF.
 * @param {string} outputId  — the path segment after /download/
 */
export function getDownloadUrl(outputId) {
  return `${API_BASE}/download/${outputId}`
}
