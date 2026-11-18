import React, { useState, useRef, useMemo, useEffect } from 'react'
import {
  FileText, UploadCloud, Search, Trash2, ArrowUpRight,
  Clock, FileCode, CheckCircle2, AlertCircle, Plus,
  Image as ImageIcon, FileCheck, Loader2, Sparkles, Cpu,
  Layers, ShieldCheck, Binary, BookOpen, Filter, Download,
  Flame, Crown, Terminal, Zap, FileSpreadsheet, Copy, X
} from 'lucide-react'
import { storageService } from '../../../services/storage'
import { soundService } from '../../../services/soundService'
import { extractTextFromFile, SUPPORTED_ACCEPT_STRING } from '../../../services/documentExtractor'
import { useTheme } from '../../../context/ThemeContext'
import styles from './DocumentsView.module.css'

const SAMPLE_DOCS = [
  {
    title: 'European Geography & Capitals Overview',
    filename: 'european_capitals_2024.pdf',
    size: 245760,
    type: 'pdf',
    content: 'France is a sovereign country situated in Western Europe. Its capital and largest metropolitan city is Paris, renowned globally for the Eiffel Tower, the Louvre Museum, and Notre-Dame Cathedral. France borders Belgium, Luxembourg, Germany, Switzerland, Italy, and Spain. The official language is French and the currency is the Euro.',
  },
  {
    title: 'Cellular Respiration & Photosynthesis',
    filename: 'plant_biology_lecture_notes.docx',
    size: 184320,
    type: 'docx',
    content: 'Photosynthesis is a biological biochemical process employed by plants, algae, and certain cyanobacteria to transform light energy into chemical energy stored within glucose molecules. Through oxygenic photosynthesis, water and carbon dioxide are converted into oxygen and carbohydrates.',
  },
  {
    title: 'Apollo 11 Lunar Landing Mission Log',
    filename: 'apollo11_mission_transcript.txt',
    size: 98304,
    type: 'text',
    content: 'Apollo 11 was the American spaceflight that first landed humans on the Moon. Commander Neil Armstrong and lunar module pilot Buzz Aldrin landed the Apollo Lunar Module Eagle on July 20, 1969, at 20:17 UTC. Six hours later, Armstrong became the first person to step onto the lunar surface.',
  },
]

export default function DocumentsView({ onOpenInWorkspace, onAddToast }) {
  const { theme } = useTheme()
  const [docs, setDocs] = useState(() => storageService.getDocuments())
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all') // 'all' | 'pdf' | 'image' | 'docx' | 'text'
  const [isDragging, setIsDragging] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractStatus, setExtractStatus] = useState('')
  const [readingDoc, setReadingDoc] = useState(null)
  const [fontSize, setFontSize] = useState('md') // 'sm' | 'md' | 'lg'
  const fileInputRef = useRef(null)

  // Close reader on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && readingDoc) {
        setReadingDoc(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [readingDoc])

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return

    const fileList = Array.from(files)
    setIsExtracting(true)
    if (soundService?.playClick) soundService.playClick()

    for (const file of fileList) {
      setExtractStatus(`Extracting text from "${file.name}"…`)
      try {
        const result = await extractTextFromFile(file, (p) => {
          setExtractStatus(p.message || `Processing ${file.name}…`)
        })

        const typeLabel =
          result.type === 'image'
            ? 'image'
            : result.type === 'pdf'
            ? 'pdf'
            : result.type === 'docx'
            ? 'docx'
            : 'text'

        storageService.addDocument({
          title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          filename: file.name,
          size: file.size,
          type: typeLabel,
          content: result.text,
        })

        if (soundService?.playAnswerSuccess) soundService.playAnswerSuccess()
        if (onAddToast) {
          onAddToast({
            type: 'success',
            title: 'Document Ingested',
            message: `"${file.name}" indexed (${result.characterCount.toLocaleString()} chars) and ready for QA.`,
          })
        }
      } catch (err) {
        if (onAddToast) {
          onAddToast({
            type: 'error',
            title: `Error: ${file.name}`,
            message: err.message || 'Could not extract text from document.',
          })
        }
      }
    }

    setDocs(storageService.getDocuments())
    setIsExtracting(false)
    setExtractStatus('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAddSample = () => {
    const sample = SAMPLE_DOCS[Math.floor(Math.random() * SAMPLE_DOCS.length)]
    storageService.addDocument({
      title: `${sample.title} (#${docs.length + 1})`,
      filename: sample.filename,
      size: sample.size,
      type: sample.type,
      content: sample.content,
    })
    setDocs(storageService.getDocuments())
    if (soundService?.playAnswerSuccess) soundService.playAnswerSuccess()
    if (onAddToast) {
      onAddToast({
        type: 'success',
        title: 'Sample Document Ingested',
        message: `Loaded "${sample.title}" into reference vault.`,
      })
    }
  }

  const handleDelete = (id, title) => {
    const updated = storageService.deleteDocument(id)
    setDocs(updated)
    if (soundService?.playClick) soundService.playClick()
    if (onAddToast) {
      onAddToast({
        type: 'info',
        title: 'Document Removed',
        message: `Deleted "${title}" from vault.`,
      })
    }
  }

  const filteredDocs = useMemo(() => {
    return docs.filter((d) => {
      const q = search.toLowerCase().trim()
      const matchSearch = !q || d.title.toLowerCase().includes(q) || d.filename.toLowerCase().includes(q)
      if (!matchSearch) return false

      if (typeFilter === 'all') return true
      const type = (d.type || '').toLowerCase()
      const name = (d.filename || '').toLowerCase()

      if (typeFilter === 'pdf') return type === 'pdf' || name.endsWith('.pdf')
      if (typeFilter === 'image') return type === 'image' || /\.(png|jpe?g|webp|bmp)$/i.test(name)
      if (typeFilter === 'docx') return type === 'docx' || /\.(docx?)$/i.test(name)
      if (typeFilter === 'text') return type === 'text' || /\.(txt|md|json)$/i.test(name)

      return true
    })
  }, [docs, search, typeFilter])

  // Aggregate telemetry
  const totalChars = docs.reduce((acc, d) => acc + (d.content?.length || 0), 0)
  const totalWords = Math.round(totalChars / 5.2)

  /* Theme styling details */
  const themeMeta = {
    imperium: {
      badge: '⚜ ROYAL DOCUMENT ARCHIVE & MANUSCRIPTS ⚜',
      titleHighlight: 'Imperial Knowledge Vault',
      sub: 'Repository of sovereign documents and illuminated texts indexed for question-answering precision.',
      icon: Crown,
    },
    pixelcraft: {
      badge: '▣ VOXEL DOCUMENT REPOSITORY ▣',
      titleHighlight: 'Block Storage Archive',
      sub: 'Multi-format documents decomposed block by block for fast BERT neural retrieval.',
      icon: Zap,
    },
    void: {
      badge: '[ SYSTEM :: DOCUMENT_INGESTION_VAULT ]',
      titleHighlight: 'Document Index',
      sub: 'Direct OCR and binary text extraction pipeline. Ingest PDF, images, Word, and text into attention memory.',
      icon: Terminal,
    },
    cloud: {
      badge: 'ENTERPRISE DOCUMENT REPOSITORY',
      titleHighlight: 'Context Documents',
      sub: 'High-clarity enterprise document vault with optical character recognition and multi-format parsing.',
      icon: ShieldCheck,
    },
    ember: {
      badge: 'WARM INTELLIGENCE DOCUMENT LIBRARY',
      titleHighlight: 'Reading Collection',
      sub: 'Curated library of reference articles and archival documents ready for deep contextual reading.',
      icon: Flame,
    },
    original: {
      badge: 'DOCUMENT INGESTION VAULT · MULTI-FORMAT OCR',
      titleHighlight: 'Context Documents',
      sub: 'Manage and inject reference documents into the BERT extractive QA workspace.',
      icon: BookOpen,
    },
  }[theme] || {
    badge: 'DOCUMENT INGESTION VAULT · MULTI-FORMAT OCR',
    titleHighlight: 'Context Documents',
    sub: 'Manage and inject reference documents into the BERT extractive QA workspace.',
    icon: BookOpen,
  }

  const ThemeIcon = themeMeta.icon

  return (
    <div className={styles.container}>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={SUPPORTED_ACCEPT_STRING}
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* ── Executive Header ────────────────────────────────────── */}
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <div className={styles.eyebrow}>
            <span className={styles.statusPulseDot} />
            <ThemeIcon size={13} className={styles.eyebrowIcon} />
            <span>{themeMeta.badge}</span>
          </div>
          <h1 className={styles.title}>
            Context <span className={styles.gradientText}>{themeMeta.titleHighlight}</span>
          </h1>
          <p className={styles.subTitle}>{themeMeta.sub}</p>
        </div>

        <div className={styles.headerBtnGroup}>
          <button
            type="button"
            className={styles.sampleBtn}
            onClick={handleAddSample}
          >
            <Plus size={14} />
            <span>Add Sample Doc</span>
          </button>

          <button
            type="button"
            className={styles.uploadBtn}
            disabled={isExtracting}
            onClick={() => fileInputRef.current?.click()}
          >
            {isExtracting ? (
              <>
                <Loader2 size={15} className={styles.spinIcon} />
                <span>Extracting…</span>
              </>
            ) : (
              <>
                <UploadCloud size={15} />
                <span>Ingest Document</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Telemetry Quickstrip (Always Visible) ────────────────── */}
      <div className={styles.vaultTelemetryStrip}>
        <div className={styles.telemetryItem}>
          <BookOpen size={14} className={styles.telemetryIcon} />
          <span className={styles.telemetryLabel}>Total Documents:</span>
          <span className={styles.telemetryValue}>{docs.length}</span>
        </div>
        <div className={styles.telemetryDivider}>•</div>
        <div className={styles.telemetryItem}>
          <Binary size={14} className={styles.telemetryIcon} />
          <span className={styles.telemetryLabel}>Total Extracted Words:</span>
          <span className={styles.telemetryValue}>~{totalWords.toLocaleString()} words</span>
        </div>
        <div className={styles.telemetryDivider}>•</div>
        <div className={styles.telemetryItem}>
          <Cpu size={14} className={styles.telemetryIcon} />
          <span className={styles.telemetryLabel}>OCR &amp; PDF Engine:</span>
          <span className={styles.telemetryValue}>Tesseract + PDF.js Active</span>
        </div>
        <div className={styles.telemetryDivider}>•</div>
        <div className={styles.telemetryItem}>
          <ShieldCheck size={14} className={styles.telemetryIconGreen} />
          <span className={styles.telemetryLabel}>BERT Readiness:</span>
          <span className={styles.telemetryValueGreen}>Ready to Answer Questions</span>
        </div>
      </div>

      {/* Live Extraction Progress Banner */}
      {isExtracting && (
        <div className={styles.extractProgress}>
          <Loader2 size={16} className={styles.spinIcon} />
          <span>{extractStatus || 'Scanning and extracting document content…'}</span>
        </div>
      )}

      {/* Drag & drop dropzone */}
      <div
        className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className={styles.dropzoneIcon}>
          <UploadCloud size={28} />
        </div>
        <div className={styles.dropzoneText}>
          <span className={styles.dropzoneTitle}>Click to upload or drag &amp; drop document files</span>
          <span className={styles.dropzoneSub}>
            Supports PDF (<code>.pdf</code>), Images with OCR (<code>.png</code>, <code>.jpg</code>, <code>.webp</code>), Word (<code>.docx</code>), &amp; Plain Text (<code>.txt</code>, <code>.md</code>)
          </span>
        </div>
      </div>

      {/* Search & format filter pills */}
      <div className={styles.searchBar}>
        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search documents by title or filename…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Format Filter Pills */}
        <div className={styles.filterPills}>
          <button
            type="button"
            className={`${styles.filterPill} ${typeFilter === 'all' ? styles.filterPillActive : ''}`}
            onClick={() => setTypeFilter('all')}
          >
            All Formats ({docs.length})
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${typeFilter === 'pdf' ? styles.filterPillActive : ''}`}
            onClick={() => setTypeFilter('pdf')}
          >
            PDFs
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${typeFilter === 'image' ? styles.filterPillActive : ''}`}
            onClick={() => setTypeFilter('image')}
          >
            OCR Images
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${typeFilter === 'docx' ? styles.filterPillActive : ''}`}
            onClick={() => setTypeFilter('docx')}
          >
            Word DOCX
          </button>
          <button
            type="button"
            className={`${styles.filterPill} ${typeFilter === 'text' ? styles.filterPillActive : ''}`}
            onClick={() => setTypeFilter('text')}
          >
            Text / MD
          </button>
        </div>

        <span className={styles.docCount}>
          {filteredDocs.length} {filteredDocs.length === 1 ? 'document' : 'documents'}
        </span>
      </div>

      {/* ── Document Cards Grid ─────────────────────────────────── */}
      {filteredDocs.length === 0 ? (
        <div className={styles.emptyWrap}>
          <div className={styles.emptyIconPulse}>
            <FileText size={34} strokeWidth={1.5} className={styles.emptyIcon} />
          </div>
          <h3 className={styles.emptyTitle}>No Documents in Vault</h3>
          <p className={styles.emptyDesc}>
            {search || typeFilter !== 'all'
              ? 'No documents match your active search or format filter.'
              : 'Upload your first PDF, image, Word, or text document to start extracting answers with BERT.'}
          </p>
          <div className={styles.emptyActionRow}>
            <button
              type="button"
              className={styles.uploadSampleBtn}
              onClick={handleAddSample}
            >
              <Plus size={14} />
              <span>Load Sample Document</span>
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredDocs.map((doc) => {
            const sizeKb = Math.max(1, Math.round(doc.size / 1024))
            const uploadDate = new Date(doc.uploadedAt || Date.now()).toLocaleDateString()
            const name = (doc.filename || '').toLowerCase()
            const type = doc.type || ''

            const isPdf = type === 'pdf' || name.endsWith('.pdf')
            const isImg = type === 'image' || /\.(png|jpe?g|webp|bmp)$/i.test(name)
            const isDocx = type === 'docx' || /\.(docx?)$/i.test(name)

            const wordCount = doc.content ? doc.content.trim().split(/\s+/).filter(Boolean).length : 0

            return (
              <div
                key={doc.id}
                className={`${styles.dossierCard} ${
                  isPdf ? styles.cardTheme_pdf :
                  isImg ? styles.cardTheme_img :
                  isDocx ? styles.cardTheme_docx :
                  styles.cardTheme_txt
                }`}
              >
                {/* Format Header */}
                <div className={styles.cardHeader}>
                  <div className={styles.formatBadge}>
                    <span className={styles.formatIcon}>
                      {isPdf ? <FileText size={13} /> : isImg ? <ImageIcon size={13} /> : isDocx ? <FileCode size={13} /> : <FileText size={13} />}
                    </span>
                    <span className={styles.formatText}>
                      {isPdf ? 'PDF' : isImg ? 'Image OCR' : isDocx ? 'Word DOCX' : 'Text'}
                    </span>
                  </div>

                  <span className={styles.readyBadge}>
                    <span className={styles.readyDot} />
                    <span>BERT Ready</span>
                  </span>
                </div>

                {/* Document Body */}
                <div className={styles.cardBody}>
                  <h3 className={styles.docTitle} title={doc.title}>
                    {doc.title}
                  </h3>
                  <div className={styles.docSubMeta}>
                    <span className={styles.filename}>{doc.filename}</span>
                    <span className={styles.dotSeparator}>•</span>
                    <span className={styles.wordCountMeta}>{wordCount.toLocaleString()} words</span>
                  </div>
                  <p className={styles.snippet}>
                    {doc.content?.slice(0, 160)}…
                  </p>
                </div>

                {/* Document Footer Meta */}
                <div className={styles.cardMeta}>
                  <span>{sizeKb} KB</span>
                  <span>•</span>
                  <span>{uploadDate}</span>
                </div>

                {/* Actions */}
                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={styles.readBtn}
                    onClick={() => {
                      if (soundService?.playClick) soundService.playClick()
                      setReadingDoc(doc)
                    }}
                    title={`Read and inspect full text of "${doc.title}"`}
                  >
                    <BookOpen size={13} />
                    <span>Read</span>
                  </button>

                  <button
                    type="button"
                    className={styles.openBtn}
                    onClick={() => {
                      if (soundService?.playClick) soundService.playClick()
                      onOpenInWorkspace(doc.content)
                    }}
                    title={`Open "${doc.title}" in workspace`}
                  >
                    <Sparkles size={13} />
                    <span>Ask Questions →</span>
                  </button>

                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(doc.id, doc.title)}
                    title="Delete document"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Document Reader Drawer / Modal ──────────────────────── */}
      {readingDoc && (
        <div className={styles.readerBackdrop} onClick={() => setReadingDoc(null)}>
          <div className={styles.readerDrawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.readerHeader}>
              <div className={styles.readerTitleGroup}>
                <div className={styles.readerBadgeRow}>
                  <span className={styles.readerFormatBadge}>
                    {readingDoc.type?.toUpperCase() || 'DOCUMENT'}
                  </span>
                  <span className={styles.readerWordCount}>
                    ~{readingDoc.content?.trim().split(/\s+/).filter(Boolean).length.toLocaleString()} words
                  </span>
                  <span className={styles.readerCharCount}>
                    {readingDoc.content?.length.toLocaleString()} chars
                  </span>
                </div>
                <h2 className={styles.readerTitle}>{readingDoc.title}</h2>
                <span className={styles.readerFilename}>{readingDoc.filename}</span>
              </div>

              <div className={styles.readerControls}>
                <div className={styles.fontSizeControls}>
                  <button
                    type="button"
                    className={`${styles.fontBtn} ${fontSize === 'sm' ? styles.fontBtnActive : ''}`}
                    onClick={() => setFontSize('sm')}
                    title="Small text size"
                  >
                    A-
                  </button>
                  <button
                    type="button"
                    className={`${styles.fontBtn} ${fontSize === 'md' ? styles.fontBtnActive : ''}`}
                    onClick={() => setFontSize('md')}
                    title="Normal text size"
                  >
                    A
                  </button>
                  <button
                    type="button"
                    className={`${styles.fontBtn} ${fontSize === 'lg' ? styles.fontBtnActive : ''}`}
                    onClick={() => setFontSize('lg')}
                    title="Large text size"
                  >
                    A+
                  </button>
                </div>

                <button
                  type="button"
                  className={styles.readerCloseBtn}
                  onClick={() => setReadingDoc(null)}
                  title="Close reader (Esc)"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className={`${styles.readerBody} ${styles['font_' + fontSize]}`}>
              <div className={styles.readerTextContainer}>
                {readingDoc.content?.split('\n\n').map((para, i) => (
                  <p key={i} className={styles.readerPara}>
                    {para}
                  </p>
                )) || <p className={styles.readerPara}>{readingDoc.content}</p>}
              </div>
            </div>

            <div className={styles.readerFooter}>
              <div className={styles.readerFooterLeft}>
                <button
                  type="button"
                  className={styles.readerCopyBtn}
                  onClick={() => {
                    navigator.clipboard.writeText(readingDoc.content)
                    if (onAddToast) {
                      onAddToast({
                        type: 'success',
                        title: 'Copied to Clipboard',
                        message: `Full content of "${readingDoc.title}" copied.`,
                      })
                    }
                  }}
                  title="Copy full text"
                >
                  <Copy size={13} />
                  <span>Copy Content</span>
                </button>
              </div>

              <div className={styles.readerFooterRight}>
                <button
                  type="button"
                  className={styles.readerAskBtn}
                  onClick={() => {
                    onOpenInWorkspace(readingDoc.content)
                    setReadingDoc(null)
                  }}
                  title="Load this document directly into Question Workspace"
                >
                  <Sparkles size={14} />
                  <span>Load into Workspace & Ask Questions →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
