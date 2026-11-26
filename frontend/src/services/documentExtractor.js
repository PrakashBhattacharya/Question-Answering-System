/**
 * ContextIQ — Universal Document & Image Text Extractor
 * Supports:
 *   - PDF (.pdf) via backend pypdf extractor + resilient client-side stream parser
 *   - Images (.png, .jpg, .jpeg, .webp, .bmp) via client-side Tesseract.js OCR
 *   - Word (.docx, .doc) via backend python-docx extractor + client-side XML parser
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
 * Resilient client-side binary text extraction for PDF and DOCX files.
 */
async function extractClientSideDoc(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    const name = file.name.toLowerCase()

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result
        if (!buffer) return resolve('')

        const uint8 = new Uint8Array(buffer)
        const latin1 = new TextDecoder('latin1').decode(uint8)

        // 1. DOCX: extract from Word XML <w:t> tags
        if (name.endsWith('.docx') || name.endsWith('.doc')) {
          const pBlocks = latin1.split(/<\/w:p>/gi)
          const extractedParagraphs = []
          for (const pb of pBlocks) {
            const tags = pb.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/gi) || []
            if (tags.length > 0) {
              const pText = tags.map((t) => t.replace(/<[^>]+>/g, '')).join('').trim()
              if (pText) extractedParagraphs.push(pText)
            }
          }
          if (extractedParagraphs.length > 0) {
            return resolve(extractedParagraphs.join('\n\n'))
          }
        }

        // 2. PDF: extract text streams
        if (name.endsWith('.pdf')) {
          const textTokens = []
          // Text in parentheses: (Sample text) Tj or ' or "
          const tjMatches = latin1.match(/\(([^)\r\n]{2,})\)\s*(?:Tj|'|")/gi) || []
          for (const m of tjMatches) {
            const inner = m.match(/\(([^)\r\n]+)\)/)
            if (inner && inner[1]) {
              const clean = inner[1]
                .replace(/\\([()\\])/g, '$1')
                .replace(/\\n/g, '\n')
                .replace(/\\t/g, ' ')
                .trim()
              if (clean.length > 1 && !clean.includes('obj') && !clean.includes('endobj')) {
                textTokens.push(clean)
              }
            }
          }

          // TJ array: [(part1) 10 (part2)] TJ
          const arrayMatches = latin1.match(/\[([^[\]]+)\]\s*TJ/gi) || []
          for (const m of arrayMatches) {
            const sub = m.match(/\(([^)\r\n]+)\)/g) || []
            const str = sub
              .map((s) => s.slice(1, -1).replace(/\\([()\\])/g, '$1').trim())
              .filter(Boolean)
              .join(' ')
            if (str.length > 1) {
              textTokens.push(str)
            }
          }

          if (textTokens.length > 0) {
            return resolve(textTokens.join(' '))
          }

          // Fallback: match readable ASCII blocks from the PDF
          const asciiRuns = latin1.match(/[A-Za-z0-9,.:;'"?!()\- ]{20,}/g) || []
          const filtered = asciiRuns.filter(
            (r) =>
              !r.includes('/Type') &&
              !r.includes('/Font') &&
              !r.includes('/Filter') &&
              !r.includes('stream') &&
              !r.includes('Catalog')
          )
          if (filtered.length > 0) {
            return resolve(filtered.join('\n\n'))
          }
        }

        // UTF-8 plain text attempt
        const utf8 = new TextDecoder('utf-8', { fatal: false }).decode(uint8)
        resolve(utf8.trim())
      } catch {
        resolve('')
      }
    }

    reader.onerror = () => resolve('')
    reader.readAsArrayBuffer(file)
  })
}

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
      throw new Error(`Image OCR: ${err.message}`)
    }
  }

  // ── 2. PDF & Word Documents ────────────────────────────────────────────────
  if (isPdf || isDocx) {
    const docTypeLabel = isPdf ? 'PDF' : 'Word Document'
    if (onProgress) {
      onProgress({ status: 'extracting', message: `Extracting ${docTypeLabel} text…`, progress: 50 })
    }

    // Try backend API first
    try {
      const res = await documentApi.extract(file)
      if (res && res.text && res.text.trim().length > 0) {
        return {
          text: res.text.trim(),
          filename: res.filename || file.name,
          type: isPdf ? 'pdf' : 'docx',
          pages: res.pages || 1,
          characterCount: res.character_count || res.text.length,
          wordCount: res.word_count || res.text.split(/\s+/).filter(Boolean).length,
        }
      }
    } catch {}

    // Resilient client-side fallback
    if (onProgress) {
      onProgress({ status: 'extracting', message: `Parsing ${docTypeLabel} content…`, progress: 75 })
    }
    const clientText = await extractClientSideDoc(file)
    if (clientText && clientText.trim().length > 0) {
      return {
        text: clientText.trim(),
        filename: file.name,
        type: isPdf ? 'pdf' : 'docx',
        pages: 1,
        characterCount: clientText.trim().length,
        wordCount: clientText.trim().split(/\s+/).filter(Boolean).length,
      }
    }

    throw new Error(`Could not extract readable text from "${file.name}". Please ensure it contains selectable text.`)
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
