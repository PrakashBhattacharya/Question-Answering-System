/**
 * ContextIQ — API Service Layer v2.0
 * All requests are proxied through Vite → FastAPI on :8000
 * Falls back gracefully to a demo profile if backend is offline.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Demo fallback profile used when backend is unreachable
const DEMO_PROFILE = {
  access_token: 'demo_token_offline',
  token_type: 'bearer',
  user: {
    id: 'demo_user',
    email: 'demo@contextiq.ai',
    full_name: 'Demo User',
    is_active: true,
  },
}

async function request(path, options = {}) {
  const token = localStorage.getItem('contextiq_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, { ...options, headers })
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const message = data.detail || data.message || `Request failed (${response.status})`
      throw new Error(message)
    }

    return data
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new Error('Cannot reach backend. Please ensure the FastAPI server is running on port 8000.')
    }
    throw err
  }
}

// ── Auth Endpoints ──────────────────────────────────────────────────────────

export const authApi = {
  /**
   * Sign in with email + password.
   * Falls back to demo profile if backend offline and demo credentials used.
   */
  signIn: async (email, password) => {
    if (email === 'demo@contextiq.ai' && password === 'Demo123!') {
      try {
        return await request('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })
      } catch {
        return DEMO_PROFILE
      }
    }
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  /** Create a new account. */
  signUp: (fullName, email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ full_name: fullName, email, password }),
    }),

  /** Fetch current user profile (requires token). */
  me: () => request('/auth/me'),

  /** Sign out — clears token on client. */
  signOut: () => {
    localStorage.removeItem('contextiq_token')
    localStorage.removeItem('contextiq_user')
  },

  signInWithGoogle: () => {
    window.location.href = '/api/auth/oauth/google/redirect'
  },

  signInWithGithub: () => {
    window.location.href = '/api/auth/oauth/github/redirect'
  },

  getOAuthStatus: () => request('/auth/oauth/status'),

  saveOAuthCredentials: (creds) =>
    request('/auth/oauth/credentials', {
      method: 'POST',
      body: JSON.stringify(creds),
    }),

  processOAuthCallback: () => {
    const params   = new URLSearchParams(window.location.search)
    const error    = params.get('error')
    if (error) throw new Error(decodeURIComponent(error))

    const token    = params.get('token')
    const userJson = params.get('user')
    if (!token || !userJson) throw new Error('Invalid OAuth callback parameters.')

    let user
    try {
      user = JSON.parse(userJson)
    } catch {
      try {
        user = JSON.parse(decodeURIComponent(userJson))
      } catch {
        throw new Error('Failed to parse user session from OAuth provider.')
      }
    }

    localStorage.setItem('contextiq_token', token)
    localStorage.setItem('contextiq_user', JSON.stringify(user))
    return { token, user }
  },
}

// ── System & Model Endpoints ────────────────────────────────────────────────

export const systemApi = {
  health: async () => {
    try {
      return await request('/health')
    } catch (err) {
      return { status: 'offline', error: err.message }
    }
  },

  /** List available QA models from the backend */
  getAvailableModels: async () => {
    try {
      return await request('/qa/models')
    } catch {
      return {
        hardware: {
          device: -1,
          device_name: 'CPU [FP32]',
          precision: 'FP32',
          accelerated: false,
        },
        models: [
          { key: 'deberta', name: 'DeBERTa-v3 Base (SQuAD 2.0)', loaded: false, description: 'SQuAD 2.0 F1: 88.4% · SOTA', f1_score: '88.4%', is_sota: true },
          { key: 'roberta-large', name: 'RoBERTa Large (SQuAD 2.0)', loaded: false, description: 'SQuAD 2.0 F1: 88.1% · 355M params', f1_score: '88.1%', is_large: true },
          { key: 'roberta', name: 'RoBERTa Base (SQuAD 2.0)', loaded: false, description: 'SQuAD 2.0 F1: 80.1%', f1_score: '80.1%' },
          { key: 'bert', name: 'BERT Base (SQuAD 2.0)', loaded: false, description: 'SQuAD 2.0 F1: 74.8%', f1_score: '74.8%' },
          { key: 'distilbert', name: 'DistilBERT (SQuAD v1.1)', loaded: false, description: 'F1: 77.0% · Fast', f1_score: '77.0%', is_fast: true },
        ]
      }
    }
  },

  getModelDetails: () => ({
    modelName: 'deepset/deberta-v3-base-squad2',
    baseArchitecture: 'DeBERTa-v3 (Disentangled Attention with Enhanced Masked Decoder)',
    checkpoint: 'deberta-v3-base',
    dataset: 'SQuAD 2.0 (Stanford Question Answering Dataset)',
    framework: 'PyTorch 2.x • Hugging Face Transformers',
    inferenceRuntime: 'FastAPI (Python 3.11/3.12)',
    taskType: 'Extractive Question Answering',
    tokenizer: 'DebertaV2TokenizerFast',
    maxSeqLength: 7680,
    docStride: 256,
    maxAnswerLength: 450,
    topK: 3,
    confidenceThreshold: 0.25,
    handleImpossibleAnswer: true,
    benchmarkExactMatch: '82.5%',
    benchmarkF1: '88.4%',
  }),
}

// ── QA Endpoints ─────────────────────────────────────────────────────────────

export const qaApi = {
  /**
   * Ask a question given a context passage.
   * model: 'deberta' | 'roberta-large' | 'roberta' | 'bert' | 'distilbert'
   * topK: number of candidate spans to extract (1-5)
   * confidenceThreshold: minimum score to prevent hallucination (0.0 - 1.0)
   */
  answer: async (context, question, maxAnswerLen = 64, model = 'deberta', topK = 3, confidenceThreshold = 0.05) => {
    const startTime = performance.now()
    const data = await request('/qa/answer', {
      method: 'POST',
      body: JSON.stringify({
        context,
        question,
        max_answer_len: maxAnswerLen,
        model,
        top_k: topK,
        confidence_threshold: confidenceThreshold,
      }),
    })
    const latencyMs = Math.round(performance.now() - startTime)
    return { ...data, latencyMs }
  },

  /**
   * Bulk Q&A — run multiple questions against one context.
   * questions: [{ question: string }]
   */
  bulk: async (context, questions, model = 'deberta', confidenceThreshold = 0.05) => {
    const startTime = performance.now()
    const data = await request('/bulk/qa', {
      method: 'POST',
      body: JSON.stringify({ context, questions, model, confidence_threshold: confidenceThreshold }),
    })
    const latencyMs = Math.round(performance.now() - startTime)
    return { ...data, latencyMs }
  },
}

// ── Document Endpoints ───────────────────────────────────────────────────────

export const documentApi = {
  /** Extract text from PDF, DOCX, or text files using backend parser. */
  extract: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const token = localStorage.getItem('contextiq_token')
    const response = await fetch(`${BASE_URL}/documents/extract`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(data.detail || `Extraction failed (${response.status})`)
    }
    return data
  },
}

// ── Summarization Endpoint ───────────────────────────────────────────────────

export const summarizeApi = {
  /** Summarize a text passage using BART. */
  summarize: async (text, maxLength = 150, minLength = 40) => {
    return request('/summarize/text', {
      method: 'POST',
      body: JSON.stringify({ text, max_length: maxLength, min_length: minLength }),
    })
  },
}

// ── URL Fetcher Endpoint ─────────────────────────────────────────────────────

export const urlApi = {
  /** Fetch a public URL and extract clean text for QA context. */
  fetch: async (url, maxChars = 10000) => {
    return request('/url/fetch', {
      method: 'POST',
      body: JSON.stringify({ url, max_chars: maxChars }),
    })
  },
}
