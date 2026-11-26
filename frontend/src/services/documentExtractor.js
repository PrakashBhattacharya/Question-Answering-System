/**
 * ContextIQ — Universal Document & Image Text Extractor
 * Supports:
 *   - PDF (.pdf) via Mozilla PDF.js (pdfjs-dist) with layout preservation and OCR fallback
 *   - Images (.png, .jpg, .jpeg, .webp, .bmp) via client-side Tesseract.js OCR
 *   - Word (.docx, .doc) via native ZIP/XML DecompressionStream parser
 *   - Text (.txt, .md, .csv, .json, .text) via FileReader
 */

import * as pdfjsLib from 'pdfjs-dist'
import Tesseract from 'tesseract.js'
import { documentApi } from './api'

// Initialize PDF.js worker
if (typeof window !== 'undefined' && pdfjsLib?.GlobalWorkerOptions) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
  } catch (e) {
    console.warn('Could not set workerSrc:', e)
  }
}

export const SUPPORTED_EXTENSIONS = [
  '.txt', '.md', '.json', '.csv', '.text',
  '.pdf', '.docx', '.doc',
  '.png', '.jpg', '.jpeg', '.webp', '.bmp'
]

export const SUPPORTED_ACCEPT_STRING =
  '.txt,.md,.json,.csv,.text,.pdf,.docx,.doc,.png,.jpg,.jpeg,.webp,.bmp,image/*,application/pdf'

/**
 * High-fidelity client-side PDF text extractor using Mozilla PDF.js.
 * Handles font CMaps, multi-page layouts, and scanned image PDFs with OCR fallback.
 */
async function extractPdfText(file, onProgress) {
  const arrayBuffer = await file.arrayBuffer()
  const data = new Uint8Array(arrayBuffer)

  // Ensure worker is available
  if (pdfjsLib?.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
  }

  const loadingTask = pdfjsLib.getDocument({
    data,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/',
    useSystemFonts: true,
    isEvalSupported: false,
  })

  const pdf = await loadingTask.promise
  const numPages = pdf.numPages
  const pagesText = []

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (onProgress) {
      const pct = Math.round((pageNum / numPages) * 100)
      onProgress({
        status: 'extracting',
        progress: pct,
        message: `Extracting PDF page ${pageNum} of ${numPages} (${pct}%)…`,
      })
    }

    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()
    const items = textContent.items || []

    if (items.length === 0) continue

    // Group text items by line based on vertical Y position
    let lastY = null
    let lineItems = []
    const lines = []

    for (const item of items) {
      if (!item || typeof item.str !== 'string') continue
      const y = item.transform ? Math.round(item.transform[5]) : null

      if (lastY !== null && y !== null && Math.abs(y - lastY) > 5) {
        if (lineItems.length > 0) {
          lines.push(lineItems.join(' ').replace(/\s+/g, ' ').trim())
          lineItems = []
        }
      }

      if (item.str.trim().length > 0) {
        lineItems.push(item.str.trim())
      }
      if (y !== null) lastY = y
    }

    if (lineItems.length > 0) {
      lines.push(lineItems.join(' ').replace(/\s+/g, ' ').trim())
    }

    const pageString = lines.filter(Boolean).join('\n')
    if (pageString.trim().length > 0) {
      pagesText.push(pageString.trim())
    }
  }

  let fullText = pagesText.join('\n\n').trim()

  // ── Scanned PDF Fallback (OCR) ──
  // If the PDF has pages but 0 or negligible digital text (e.g. scanned image PDF)
  if (fullText.length < 25 && numPages > 0) {
    if (onProgress) {
      onProgress({
        status: 'ocr',
        progress: 10,
        message: `Scanned image PDF detected (${numPages} pages). Launching OCR engine…`,
      })
    }

    try {
      const ocrPages = []
      const maxPages = Math.min(numPages, 5)
      for (let p = 1; p <= maxPages; p++) {
        if (onProgress) {
          const pct = Math.round((p / maxPages) * 100)
          onProgress({
            status: 'ocr',
            progress: pct,
            message: `Running OCR on page ${p} of ${maxPages}…`,
          })
        }
        const page = await pdf.getPage(p)
        const viewport = page.getViewport({ scale: 1.5 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const context = canvas.getContext('2d')

        await page.render({ canvasContext: context, viewport }).promise

        const ocrRes = await Tesseract.recognize(canvas, 'eng')
        const pageOcr = (ocrRes.data?.text || '').trim()
        if (pageOcr) {
          ocrPages.push(pageOcr)
        }
      }
      if (ocrPages.length > 0) {
        fullText = ocrPages.join('\n\n').trim()
      }
    } catch (ocrErr) {
      console.warn('PDF OCR fallback warning:', ocrErr)
    }
  }

  return {
    text: fullText,
    pages: numPages,
  }
}

/**
 * Client-side Word (.docx) extractor using native DecompressionStream.
 * Parses word/document.xml directly from the ZIP archive.
 */
async function extractDocxText(file) {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)

  // Search for PK\x03\x04 zip header
  for (let i = 0; i < bytes.length - 30; i++) {
    if (bytes[i] === 0x50 && bytes[i + 1] === 0x4B && bytes[i + 2] === 0x03 && bytes[i + 3] === 0x04) {
      const compMethod = bytes[i + 8] | (bytes[i + 9] << 8)
      const compSize = bytes[i + 18] | (bytes[i + 19] << 8) | (bytes[i + 20] << 16) | (bytes[i + 21] << 24)
      const fileNameLen = bytes[i + 26] | (bytes[i + 27] << 8)
      const extraLen = bytes[i + 28] | (bytes[i + 29] << 8)

      const fileNameStart = i + 30
      const fileNameBytes = bytes.slice(fileNameStart, fileNameStart + fileNameLen)
      const fileName = new TextDecoder('utf-8').decode(fileNameBytes)

      if (fileName === 'word/document.xml') {
        const dataStart = fileNameStart + fileNameLen + extraLen
        const compData = bytes.slice(dataStart, dataStart + compSize)

        let xmlText = ''
        if (compMethod === 0) {
          // Stored uncompressed
          xmlText = new TextDecoder('utf-8').decode(compData)
        } else if (compMethod === 8 && typeof DecompressionStream !== 'undefined') {
          // Deflate compressed
          try {
            const ds = new DecompressionStream('deflate-raw')
            const writer = ds.writable.getWriter()
            writer.write(compData)
            writer.close()
            const decompressedBuffer = await new Response(ds.readable).arrayBuffer()
            xmlText = new TextDecoder('utf-8').decode(decompressedBuffer)
          } catch (e) {
            console.warn('DecompressionStream error:', e)
          }
        }

        if (xmlText) {
          const pMatches = xmlText.match(/<w:p[\s>][\s\S]*?<\/w:p>/gi) || [xmlText]
          const paragraphs = []
          for (const p of pMatches) {
            const tMatches = p.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/gi) || []
            if (tMatches.length > 0) {
              const text = tMatches.map((t) => t.replace(/<[^>]+>/g, '')).join('').trim()
              if (text) paragraphs.push(text)
            }
          }
          if (paragraphs.length > 0) {
            return paragraphs.join('\n\n')
          }
        }
      }
    }
  }
  return ''
}

/**
 * Universal extractor function for all document and image formats.
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

  // ── 1. Image OCR (PNG, JPG, WEBP, etc.) ────────────────────────────────────
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

  // ── 2. PDF Documents ───────────────────────────────────────────────────────
  if (isPdf) {
    if (onProgress) {
      onProgress({ status: 'extracting', message: `Parsing PDF "${file.name}" with PDF.js…`, progress: 20 })
    }

    // 1. Primary: High-fidelity client-side PDF.js extraction
    try {
      const pdfRes = await extractPdfText(file, onProgress)
      if (pdfRes && pdfRes.text && pdfRes.text.trim().length > 0) {
        const clean = pdfRes.text.trim()
        return {
          text: clean,
          filename: file.name,
          type: 'pdf',
          pages: pdfRes.pages || 1,
          characterCount: clean.length,
          wordCount: clean.split(/\s+/).filter(Boolean).length,
        }
      }
    } catch (pdfErr) {
      console.warn('PDF.js client extraction encountered error:', pdfErr)
    }

    // 2. Secondary: Backend API extraction (if running with FastAPI/pypdf)
    try {
      const res = await documentApi.extract(file)
      if (res && res.text && res.text.trim().length > 0) {
        const clean = res.text.trim()
        return {
          text: clean,
          filename: res.filename || file.name,
          type: 'pdf',
          pages: res.pages || 1,
          characterCount: res.character_count || clean.length,
          wordCount: res.word_count || clean.split(/\s+/).filter(Boolean).length,
        }
      }
    } catch {}

    throw new Error(`Could not extract readable text from "${file.name}". Please ensure it contains selectable text or clear pages.`)
  }

  // ── 3. Word Documents (.docx, .doc) ────────────────────────────────────────
  if (isDocx) {
    if (onProgress) {
      onProgress({ status: 'extracting', message: `Extracting Word document text…`, progress: 30 })
    }

    // 1. Client-side XML decompression
    try {
      const docxText = await extractDocxText(file)
      if (docxText && docxText.trim().length > 0) {
        const clean = docxText.trim()
        return {
          text: clean,
          filename: file.name,
          type: 'docx',
          pages: 1,
          characterCount: clean.length,
          wordCount: clean.split(/\s+/).filter(Boolean).length,
        }
      }
    } catch (docxErr) {
      console.warn('DOCX client extraction error:', docxErr)
    }

    // 2. Backend API fallback
    try {
      const res = await documentApi.extract(file)
      if (res && res.text && res.text.trim().length > 0) {
        const clean = res.text.trim()
        return {
          text: clean,
          filename: res.filename || file.name,
          type: 'docx',
          pages: res.pages || 1,
          characterCount: res.character_count || clean.length,
          wordCount: res.word_count || clean.split(/\s+/).filter(Boolean).length,
        }
      }
    } catch {}

    throw new Error(`Could not extract readable text from "${file.name}".`)
  }

  // ── 4. Plain Text / Markdown / CSV / JSON ──────────────────────────────────
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
