/**
 * ContextIQ — Universal Document & Image Text Extractor
 * Supports:
 *   - PDF (.pdf) via backend pypdf extractor
 *   - Images (.png, .jpg, .jpeg, .webp, .bmp) via client-side Tesseract.js OCR
 *   - Word (.docx, .doc) via backend python-docx extractor
 *   - Text (.txt, .md, .csv, .json, .text) via FileReader
 */

import Tesseract from 'tesseract.js'
import { documentApi } from './api'

export const SUPPORTED_EXTENSIONS = [
  '.txt', '.md', '.json', '.csv', '.text',
  '.pdf', '.docx', '.doc',
  '.png', '.jpg', '.jpeg', '.webp', '.bmp'
]

export const SUPPORTED_ACCEPT_STRING =
  '.txt,.md,.json,.csv,.text,.pdf,.docx,.doc,.png,.jpg,.jpeg,.webp,.bmp,image/*,application/pdf'

/**
 * Universal extractor function.
 * @param {File} file
 * @param {(progress: { status: string, message: string, progress?: number }) => void} [onProgress]
 * @returns {Promise<{ text: string, filename: string, type: string, pages?: number, characterCount: number, wordCount: number }>}
 */
export async function extractTextFromFile(file, onProgress) {
  if (!file) throw new Error('No file provided')

  const name = file.name.toLowerCase()
  const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp|bmp|gif|tiff?)$/i.test(name)
  const isPdf = file.type === 'application/pdf' || name.endsWith('.pdf')
  const isDocx = name.endsWith('.docx') || name.endsWith('.doc') || file.type.includes('word')

  // ── 1. Image OCR (PNG, JPG, etc.) ──────────────────────────────────────────
  if (isImage) {
    if (onProgress) {
      onProgress({ status: 'ocr', message: `Initializing OCR for "${file.name}"…`, progress: 10 })
    }

    try {
      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (onProgress && m.status === 'recognizing text') {
            const pct = Math.round(m.progress * 100)
            onProgress({
              status: 'ocr',
              progress: pct,
              message: `Scanning image text: ${pct}%`,
            })
          }
        },
      })

      const text = (result.data?.text || '').trim()
      if (!text) {
        throw new Error('No readable text detected in this image. Please ensure the image has clear, legible text.')
      }

      return {
        text,
        filename: file.name,
        type: 'image',
        characterCount: text.length,
        wordCount: text.split(/\s+/).filter(Boolean).length,
      }
    } catch (err) {
      throw new Error(`Image OCR Failed: ${err.message}`)
    }
  }

  // ── 2. PDF & Word Documents ────────────────────────────────────────────────
  if (isPdf || isDocx) {
    const docTypeLabel = isPdf ? 'PDF' : 'Word Document'
    if (onProgress) {
      onProgress({ status: 'extracting', message: `Extracting ${docTypeLabel} text…`, progress: 50 })
    }

    try {
      const res = await documentApi.extract(file)
      return {
        text: res.text,
        filename: res.filename || file.name,
        type: isPdf ? 'pdf' : 'docx',
        pages: res.pages || 1,
        characterCount: res.character_count || res.text.length,
        wordCount: res.word_count || res.text.split(/\s+/).filter(Boolean).length,
      }
    } catch (err) {
      throw new Error(`Failed to extract ${docTypeLabel}: ${err.message}`)
    }
  }

  // ── 3. Plain Text / Markdown / CSV / JSON ──────────────────────────────────
  return new Promise((resolve, reject) => {
    if (onProgress) {
      onProgress({ status: 'reading', message: 'Reading document content…', progress: 50 })
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result
      if (typeof text === 'string') {
        const cleanText = text.trim()
        resolve({
          text: cleanText,
          filename: file.name,
          type: 'text',
          characterCount: cleanText.length,
          wordCount: cleanText.split(/\s+/).filter(Boolean).length,
        })
      } else {
        reject(new Error('Could not read document contents as text.'))
      }
    }
    reader.onerror = () => reject(new Error('Failed reading file from disk.'))
    reader.readAsText(file)
  })
}
