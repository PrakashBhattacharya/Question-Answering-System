/**
 * ContextIQ — Storage Service
 * Handles user-scoped local persistence for queries, saved answers, documents, feedback, and preferences.
 * Each authenticated user has their own completely isolated workspace and desktop.
 */

// Helper to get active authenticated user from localStorage
export function getActiveUser() {
  try {
    const raw = localStorage.getItem('contextiq_user')
    if (raw) return JSON.parse(raw)
  } catch (err) {
    console.warn('[ContextIQ Storage] Failed to read active user:', err)
  }
  return null
}

// Generates a sanitized unique scope identifier for the user
export function getUserScopeId(userOverride = undefined) {
  // If userOverride is explicitly undefined (not passed), read the active user from localStorage.
  // If userOverride is null, treat as no user (guest).
  const u = userOverride !== undefined ? userOverride : getActiveUser()
  if (!u) return 'guest'
  const identifier = u.email || u.id || 'guest'
  return String(identifier).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_')
}

// Generates the scoped localStorage key for a specific resource
export function getUserKey(category, userOverride = undefined) {
  const scope = getUserScopeId(userOverride)
  return `contextiq_usr_${scope}_${category}`
}

// Legacy global keys for backward-compatible migration of demo account
const LEGACY_KEYS = {
  HISTORY: 'contextiq_history_v1',
  SAVED: 'contextiq_saved_v1',
  DOCUMENTS: 'contextiq_documents_v1',
  PREFERENCES: 'contextiq_preferences_v1',
  ACTIVE_QUERY: 'contextiq_active_query_v1',
  AUDIT_LOGS: 'contextiq_audit_logs_v1',
  FEEDBACK: 'contextiq_feedback_v1',
  THEME: 'contextiq_theme_v2',
}

// Initial pre-loaded audit logs for demo account
const DEFAULT_AUDIT_LOGS = [
  {
    id: 'log-101',
    category: 'model',
    iconType: 'cpu-indigo',
    title: 'Model Fine-Tuning Batch Queued',
    detail: '4 user feedback corrections queued for BERT checkpoint fine-tuning',
    time: '08:45 • Today',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: 'In Queue',
    meta: { checkpoint: 'bert-base-cased-squad2', count: 4 },
  },
  {
    id: 'log-102',
    category: 'qa',
    iconType: 'sparkles-cyan',
    title: 'BERT Inference Executed',
    detail: 'Extracted "July 20, 1969" for question "When was the first moon landing?" • 240ms latency',
    time: '08:42 • Today',
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    status: 'Score: 99.4%',
    meta: { question: 'When was the first moon landing?', score: 0.994 },
  },
  {
    id: 'log-103',
    category: 'context',
    iconType: 'file-emerald',
    title: 'Context Passage Ingested',
    detail: 'Document "apollo_11_mission.txt" loaded (777 chars, 194 WordPiece tokens)',
    time: '08:41 • Today',
    timestamp: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
    status: 'Tokenized',
    meta: { file: 'apollo_11_mission.txt', tokens: 194 },
  },
  {
    id: 'log-104',
    category: 'model',
    iconType: 'shield-purple',
    title: 'SQuAD 2.0 Weights Verified',
    detail: 'PyTorch runtime initialized deepset/bert-base-cased-squad2 in GPU memory',
    time: '08:40 • Today',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    status: 'Operational',
    meta: { framework: 'PyTorch 2.2', architecture: 'BertForQuestionAnswering' },
  },
  {
    id: 'log-105',
    category: 'qa',
    iconType: 'bookmark-amber',
    title: 'Answer Span Bookmarked',
    detail: 'User verified and bookmarked extracted span [start: 172, end: 185]',
    time: '10:31 • Yesterday',
    timestamp: new Date(Date.now() - 86400 * 1000).toISOString(),
    status: 'Saved',
    meta: { span: '[172:185]' },
  },
  {
    id: 'log-106',
    category: 'model',
    iconType: 'cpu-indigo',
    title: 'Multi-Head Attention Evaluated',
    detail: 'Self-attention layers computed 12 heads across 12 transformer layers in BERT encoder',
    time: '10:30 • Yesterday',
    timestamp: new Date(Date.now() - 86400 * 1000 - 60000).toISOString(),
    status: 'Completed',
    meta: { layers: 12, heads: 12 },
  },
  {
    id: 'log-107',
    category: 'security',
    iconType: 'lock-slate',
    title: 'User Session Authenticated',
    detail: 'Demo User authenticated via JWT Bearer token with ML Lead permissions',
    time: '10:30 • Yesterday',
    timestamp: new Date(Date.now() - 86400 * 1000 - 60000).toISOString(),
    status: 'Verified',
    meta: { user: 'demo@contextiq.ai', role: 'admin' },
  },
  {
    id: 'log-108',
    category: 'context',
    iconType: 'file-emerald',
    title: 'Context Passage Ingested',
    detail: 'Document "spacex_starship_spec.md" loaded into extraction buffer',
    time: '10:29 • Yesterday',
    timestamp: new Date(Date.now() - 86400 * 1000 - 120000).toISOString(),
    status: 'Ready',
    meta: { file: 'spacex_starship_spec.md' },
  },
  {
    id: 'log-109',
    category: 'qa',
    iconType: 'sparkles-cyan',
    title: 'Zero-Answer Threshold Triggered',
    detail: 'SQuAD 2.0 unanswerable check passed (null span logits above confidence threshold)',
    time: '10:29 • Yesterday',
    timestamp: new Date(Date.now() - 86400 * 1000 - 120000).toISOString(),
    status: 'No Answer',
    meta: { threshold: 0.35 },
  },
]

// Default starter documents cloned for each new individual workspace
const DEFAULT_DOCUMENTS = [
  {
    id: 'doc-apollo-11',
    title: 'Apollo 11 Moon Landing Mission',
    filename: 'apollo_11_mission.txt',
    size: 2420,
    uploadedAt: '2026-03-15T10:30:00Z',
    type: 'text/plain',
    status: 'Ready',
    content: `Apollo 11 was the American spaceflight that first landed humans on the Moon. Commander Neil Armstrong and lunar module pilot Buzz Aldrin landed the Apollo Lunar Module Eagle on July 20, 1969, at 20:17 UTC, and Armstrong became the first person to step onto the Moon's surface six hours and 39 minutes later, on July 21 at 02:56 UTC. Aldrin joined him 19 minutes later, and they spent about two and a quarter hours together exploring the site they had named Tranquility Base upon landing. Armstrong and Aldrin collected 47.5 pounds (21.5 kg) of lunar material to bring back to Earth as pilot Michael Collins flew the Command Module Columbia in lunar orbit. The mission effectively ended the Space Race and fulfilled a national goal proposed in 1961 by President John F. Kennedy.`
  },
  {
    id: 'doc-spacex-starship',
    title: 'SpaceX Starship Architecture',
    filename: 'spacex_starship_spec.md',
    size: 1980,
    uploadedAt: '2026-03-18T14:15:00Z',
    type: 'text/markdown',
    status: 'Ready',
    content: `Starship is a fully reusable, super heavy-lift launch vehicle developed by SpaceX. Standing at 121 meters (397 feet) tall with both stages combined, it is the tallest and most powerful launch vehicle ever flown. The vehicle consists of the Super Heavy first-stage booster powered by 33 Raptor engines, and the Starship second-stage spacecraft powered by 6 Raptor engines (3 sea-level and 3 vacuum-optimized). Fueled by liquid methane and liquid oxygen (methalox), Starship is engineered to transport crew and cargo to Earth orbit, the Moon, Mars, and beyond.`
  },
  {
    id: 'doc-quantum-computing',
    title: 'Fundamentals of Quantum Computing',
    filename: 'quantum_computing_overview.txt',
    size: 1840,
    uploadedAt: '2026-03-20T09:00:00Z',
    type: 'text/plain',
    status: 'Ready',
    content: `Quantum computing is a rapidly-emerging technology that harnesses the laws of quantum mechanics to solve problems too complex for classical computers. While classical computers encode information into binary bits that can either be 0 or 1, quantum computers use quantum bits or qubits. Qubits exploit quantum superposition and entanglement, enabling them to evaluate multidimensional computational spaces simultaneously. Key applications include Shor's algorithm for prime factorization, Grover's algorithm for unstructured database search, and quantum molecular simulations for pharmaceutical drug discovery.`
  }
]

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (err) {
    console.warn(`[ContextIQ Storage] Failed to parse ${key}:`, err)
    return fallback
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.warn(`[ContextIQ Storage] Failed to persist ${key}:`, err)
  }
}

function hasKey(key) {
  try {
    return localStorage.getItem(key) !== null
  } catch {
    return false
  }
}

export const storageService = {
  // ── History / Queries ──────────────────────────────────────────────
  getHistory: (userOverride) => {
    const key = getUserKey('history', userOverride)
    if (!hasKey(key)) {
      const scope = getUserScopeId(userOverride)
      // Check if demo user has legacy history to migrate
      if ((scope === 'demo_user' || scope === 'demo_contextiq_ai') && hasKey(LEGACY_KEYS.HISTORY)) {
        const legacy = readJson(LEGACY_KEYS.HISTORY, [])
        writeJson(key, legacy)
        return legacy
      }
      return []
    }
    return readJson(key, [])
  },

  addQuery: (queryItem, userOverride) => {
    const key = getUserKey('history', userOverride)
    const history = storageService.getHistory(userOverride)
    const newItem = {
      id: queryItem.id || `query-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...queryItem,
    }
    const updated = [newItem, ...history.slice(0, 99)] // keep up to 100 queries
    writeJson(key, updated)

    // Auto-record to user's private audit log
    storageService.addAuditLog({
      category: 'qa',
      iconType: 'sparkles-cyan',
      title: 'BERT Inference Executed',
      detail: `Query: "${queryItem.question?.slice(0, 50)}${queryItem.question?.length > 50 ? '...' : ''}" — score: ${(Math.round((queryItem.score || 0) * 100))}% • ${queryItem.latencyMs || 240}ms`,
      status: queryItem.has_answer ? 'Extracted' : 'No Answer',
      meta: { question: queryItem.question, score: queryItem.score },
    }, userOverride)

    return newItem
  },

  deleteQuery: (queryId, userOverride) => {
    const key = getUserKey('history', userOverride)
    const history = storageService.getHistory(userOverride)
    const updated = history.filter((item) => item.id !== queryId)
    writeJson(key, updated)
    return updated
  },

  clearHistory: (userOverride) => {
    const key = getUserKey('history', userOverride)
    writeJson(key, [])
    storageService.addAuditLog({
      category: 'qa',
      iconType: 'sparkles-cyan',
      title: 'Query History Cleared',
      detail: 'User cleared query history records from private workspace cache.',
      status: 'Cleaned',
    }, userOverride)
  },

  // ── Saved Answers ──────────────────────────────────────────────────
  getSaved: (userOverride) => {
    const key = getUserKey('saved', userOverride)
    if (!hasKey(key)) {
      const scope = getUserScopeId(userOverride)
      if ((scope === 'demo_user' || scope === 'demo_contextiq_ai') && hasKey(LEGACY_KEYS.SAVED)) {
        const legacy = readJson(LEGACY_KEYS.SAVED, [])
        writeJson(key, legacy)
        return legacy
      }
      return []
    }
    return readJson(key, [])
  },

  saveAnswer: (item, userOverride) => {
    const key = getUserKey('saved', userOverride)
    const saved = storageService.getSaved(userOverride)
    // Check if already saved in this user's collection
    if (saved.some((s) => s.question === item.question && s.answer === item.answer)) {
      return saved
    }
    const newItem = {
      id: `saved-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      savedAt: new Date().toISOString(),
      ...item,
    }
    const updated = [newItem, ...saved]
    writeJson(key, updated)

    // Auto-record to user's private audit log
    storageService.addAuditLog({
      category: 'qa',
      iconType: 'bookmark-amber',
      title: 'Answer Span Bookmarked',
      detail: `Bookmarked answer "${item.answer?.slice(0, 45)}" for question "${item.question?.slice(0, 40)}"`,
      status: 'Saved',
    }, userOverride)

    return updated
  },

  removeSaved: (id, userOverride) => {
    const key = getUserKey('saved', userOverride)
    const saved = storageService.getSaved(userOverride)
    const updated = saved.filter((item) => item.id !== id)
    writeJson(key, updated)
    return updated
  },

  isSaved: (question, answer, userOverride) => {
    const saved = storageService.getSaved(userOverride)
    return saved.some((s) => s.question === question && s.answer === answer)
  },

  // ── Documents ──────────────────────────────────────────────────────
  getDocuments: (userOverride) => {
    const key = getUserKey('documents', userOverride)
    if (!hasKey(key)) {
      const scope = getUserScopeId(userOverride)
      if ((scope === 'demo_user' || scope === 'demo_contextiq_ai') && hasKey(LEGACY_KEYS.DOCUMENTS)) {
        const legacy = readJson(LEGACY_KEYS.DOCUMENTS, DEFAULT_DOCUMENTS)
        writeJson(key, legacy)
        return legacy
      }
      // Each user gets their own fresh copy of starter documents
      const initialDocs = JSON.parse(JSON.stringify(DEFAULT_DOCUMENTS))
      writeJson(key, initialDocs)
      return initialDocs
    }
    return readJson(key, DEFAULT_DOCUMENTS)
  },

  addDocument: (doc, userOverride) => {
    const key = getUserKey('documents', userOverride)
    const docs = storageService.getDocuments(userOverride)
    const newDoc = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      uploadedAt: new Date().toISOString(),
      status: 'Ready',
      ...doc,
    }
    const updated = [newDoc, ...docs]
    writeJson(key, updated)

    storageService.addAuditLog({
      category: 'context',
      iconType: 'file-emerald',
      title: 'Context Passage Ingested',
      detail: `Document "${doc.title || doc.filename || 'Custom Context'}" (${doc.size || (doc.content?.length || 0)} bytes) added to workspace buffer`,
      status: 'Ingested',
      meta: { filename: doc.filename },
    }, userOverride)

    return newDoc
  },

  deleteDocument: (docId, userOverride) => {
    const key = getUserKey('documents', userOverride)
    const docs = storageService.getDocuments(userOverride)
    const updated = docs.filter((d) => d.id !== docId)
    writeJson(key, updated)
    return updated
  },

  // ── Audit Logs ──────────────────────────────────────────────────────
  getAuditLogs: (userOverride) => {
    const key = getUserKey('audit_logs', userOverride)
    if (!hasKey(key)) {
      const scope = getUserScopeId(userOverride)
      if ((scope === 'demo_user' || scope === 'demo_contextiq_ai') && hasKey(LEGACY_KEYS.AUDIT_LOGS)) {
        const legacy = readJson(LEGACY_KEYS.AUDIT_LOGS, DEFAULT_AUDIT_LOGS)
        writeJson(key, legacy)
        return legacy
      }
      // For any individual account, initialize with a personalized welcome audit trail
      const u = userOverride !== undefined ? userOverride : getActiveUser()
      const userName = u?.full_name || u?.email || 'User'
      const initialLogs = [
        {
          id: `log-init-${Date.now()}`,
          category: 'security',
          iconType: 'shield-emerald',
          title: 'Personal Workspace Initialized',
          detail: `Private, isolated workspace and document vault provisioned for ${userName}.`,
          time: 'Just now',
          timestamp: new Date().toISOString(),
          status: 'Active',
          meta: { user: u?.email || 'authenticated' }
        },
        {
          id: `log-model-${Date.now()}`,
          category: 'model',
          iconType: 'cpu-indigo',
          title: 'BERT QA Inference Ready',
          detail: 'SQuAD 2.0 extractive neural pipeline connected and ready for queries.',
          time: 'Just now',
          timestamp: new Date().toISOString(),
          status: 'Operational',
          meta: { framework: 'PyTorch', model: 'bert-base-cased-squad2' }
        }
      ]
      writeJson(key, initialLogs)
      return initialLogs
    }
    return readJson(key, [])
  },

  addAuditLog: (entry, userOverride) => {
    const key = getUserKey('audit_logs', userOverride)
    const logs = storageService.getAuditLogs(userOverride)
    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} • Today`
    const newLog = {
      id: entry.id || `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: now.toISOString(),
      time: entry.time || timeStr,
      category: entry.category || 'qa',
      iconType: entry.iconType || 'sparkles-cyan',
      title: entry.title || 'Inference Action Logged',
      detail: entry.detail || '',
      status: entry.status || 'Success',
      meta: entry.meta || {},
      ...entry,
    }
    const updated = [newLog, ...logs.slice(0, 99)] // keep up to 100 logs
    writeJson(key, updated)
    return newLog
  },

  clearAuditLogs: (userOverride) => {
    const key = getUserKey('audit_logs', userOverride)
    writeJson(key, [])
  },

  // ── Preferences ────────────────────────────────────────────────────
  getPreferences: (userOverride) => {
    const key = getUserKey('preferences', userOverride)
    const defaultPrefs = {
      autoScrollEvidence: true,
      soundFeedback: false,
      monospaceContext: true,
      showTokenEstimates: true,
      backendUrl: 'http://localhost:8000',
    }
    if (!hasKey(key)) {
      const scope = getUserScopeId(userOverride)
      if ((scope === 'demo_user' || scope === 'demo_contextiq_ai') && hasKey(LEGACY_KEYS.PREFERENCES)) {
        const legacy = readJson(LEGACY_KEYS.PREFERENCES, defaultPrefs)
        writeJson(key, legacy)
        return legacy
      }
      return defaultPrefs
    }
    return readJson(key, defaultPrefs)
  },

  updatePreferences: (newPrefs, userOverride) => {
    const key = getUserKey('preferences', userOverride)
    const current = storageService.getPreferences(userOverride)
    const updated = { ...current, ...newPrefs }
    writeJson(key, updated)
    return updated
  },

  // ── Active Workspace Draft ─────────────────────────────────────────
  getActiveDraft: (userOverride) => {
    const key = getUserKey('active_query', userOverride)
    return readJson(key, {
      context: '',
      question: '',
    })
  },

  saveActiveDraft: (draft, userOverride) => {
    const key = getUserKey('active_query', userOverride)
    writeJson(key, draft)
  },

  // ── Feedback (Model Evaluation) ────────────────────────────────────
  getFeedback: (userOverride) => {
    const key = getUserKey('feedback', userOverride)
    if (!hasKey(key)) {
      const scope = getUserScopeId(userOverride)
      if ((scope === 'demo_user' || scope === 'demo_contextiq_ai') && hasKey(LEGACY_KEYS.FEEDBACK)) {
        const legacy = readJson(LEGACY_KEYS.FEEDBACK, [])
        writeJson(key, legacy)
        return legacy
      }
      return []
    }
    return readJson(key, [])
  },

  saveFeedbacks: (list, userOverride) => {
    const key = getUserKey('feedback', userOverride)
    writeJson(key, list)
  },

  addFeedback: (fbItem, userOverride) => {
    const key = getUserKey('feedback', userOverride)
    const list = storageService.getFeedback(userOverride)
    const updated = [fbItem, ...list]
    writeJson(key, updated)
    return updated
  },

  deleteFeedback: (id, userOverride) => {
    const key = getUserKey('feedback', userOverride)
    const list = storageService.getFeedback(userOverride)
    const updated = list.filter((item) => item.id !== id)
    writeJson(key, updated)
    return updated
  },

  // ── User Theme ─────────────────────────────────────────────────────
  getUserTheme: (userOverride) => {
    const key = getUserKey('theme', userOverride)
    const saved = localStorage.getItem(key)
    if (saved) return saved
    // Fallback to legacy global theme or 'original'
    return localStorage.getItem(LEGACY_KEYS.THEME) || 'original'
  },

  setUserTheme: (themeName, userOverride) => {
    const key = getUserKey('theme', userOverride)
    try {
      localStorage.setItem(key, themeName)
      // Also update global legacy for pre-login pages
      localStorage.setItem(LEGACY_KEYS.THEME, themeName)
    } catch (_) {}
  },
}

