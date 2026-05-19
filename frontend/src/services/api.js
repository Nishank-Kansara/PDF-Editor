import axios from 'axios'

const API_BASE = 'https://pdf-editor-0ls5.onrender.com'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000, // 2 minutes (AI calls can be slow)
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
