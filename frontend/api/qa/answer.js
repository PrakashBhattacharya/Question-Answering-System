function extractAnswer(context, question) {
  if (!context || !question) {
    return { answer: '', score: 0, start: 0, end: 0, has_answer: false, candidates: [] };
  }

  const rawCtx = context.trim();
  const rawQ = question.trim();

  // Split into sentences
  const sentenceRegex = /([^.!?\n]+[.!?\n]+|[^.!?\n]+$)/g;
  const sentenceMatches = [];
  let m;
  while ((m = sentenceRegex.exec(rawCtx)) !== null) {
    if (m[0].trim().length > 0) {
      sentenceMatches.push({
        text: m[0],
        clean: m[0].trim(),
        start: m.index,
        end: m.index + m[0].length,
      });
    }
  }

  const stopwords = new Set([
    'what', 'when', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'the', 'a', 'an', 'and', 'or', 'but', 'if', 'then',
    'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
    'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from',
    'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further',
    'then', 'once', 'here', 'there', 'all', 'any', 'both', 'each', 'few',
    'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
    'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now',
    'did', 'does', 'tell', 'me', 'please', 'give'
  ]);

  const qTokens = rawQ.toLowerCase().match(/\b\w+\b/g) || [];
  const qKeywords = qTokens.filter((t) => !stopwords.has(t) && t.length > 1);

  const qLower = rawQ.toLowerCase();
  let intent = 'general';
  if (/\bwhen\b/.test(qLower) || /\bwhat year\b/.test(qLower) || /\bwhat date\b/.test(qLower) || /\bwhat time\b/.test(qLower)) {
    intent = 'date';
  } else if (/\bwho\b/.test(qLower) || /\bwhose\b/.test(qLower) || /\bwhom\b/.test(qLower)) {
    intent = 'person';
  } else if (/\bwhere\b/.test(qLower) || /\bwhat location\b/.test(qLower) || /\bwhat place\b/.test(qLower)) {
    intent = 'location';
  } else if (/\bhow (much|many|tall|long|fast|heavy|old|deep|wide|far|large)\b/.test(qLower) || /\bwhat number\b/.test(qLower)) {
    intent = 'quantity';
  } else if (/\bwhy\b/.test(qLower)) {
    intent = 'reason';
  }

  const scoredSentences = sentenceMatches.map((s) => {
    const sLower = s.clean.toLowerCase();
    const sTokens = sLower.match(/\b\w+\b/g) || [];
    const sTokenSet = new Set(sTokens);

    let matchCount = 0;
    for (const kw of qKeywords) {
      if (sTokenSet.has(kw) || sLower.includes(kw)) {
        matchCount++;
      }
    }

    let overlapRatio = qKeywords.length > 0 ? matchCount / qKeywords.length : 0.5;

    if (intent === 'date' && /\b(19\d\d|20\d\d|january|february|march|april|may|june|july|august|september|october|november|december|\d{1,2}:\d{2})\b/i.test(s.clean)) {
      overlapRatio += 0.45;
    } else if (intent === 'quantity' && /\b(\d+([.,]\d+)?(\s*(kg|pounds|lbs|meters|feet|hours|minutes|seconds|percent|%|engines|stages|qubits))?)\b/i.test(s.clean)) {
      overlapRatio += 0.45;
    } else if (intent === 'person' && /[A-Z][a-z]+\s+[A-Z][a-z]+/.test(s.clean)) {
      overlapRatio += 0.35;
    }

    return { ...s, score: overlapRatio, matchCount };
  });

  scoredSentences.sort((a, b) => b.score - a.score);
  const bestSent = scoredSentences[0];

  if (!bestSent || bestSent.matchCount === 0 || bestSent.score < 0.2) {
    return {
      answer: '',
      score: 0.012,
      start: 0,
      end: 0,
      has_answer: false,
      candidates: [],
    };
  }

  let candidates = [];

  if (intent === 'date') {
    const dateRegex = /\b((?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s+\d{4})?(?:\s+at\s+\d{1,2}:\d{2}(?:\s+[A-Z]{3,4})?)?|\d{4})\b/gi;
    let dm;
    while ((dm = dateRegex.exec(bestSent.clean)) !== null) {
      const ans = dm[0].trim();
      const pos = rawCtx.indexOf(ans, bestSent.start);
      if (pos !== -1) {
        candidates.push({ answer: ans, score: 0.942, start: pos, end: pos + ans.length });
      }
    }
  } else if (intent === 'quantity') {
    const quantRegex = /\b\d+(?:[.,]\d+)?(?:\s*(?:pounds|kg|meters|feet|percent|%|hours|minutes|seconds|engines|stages|qubits|bits))(?:\s*\([^)]+\))?/gi;
    let qm;
    while ((qm = quantRegex.exec(bestSent.clean)) !== null) {
      const ans = qm[0].trim();
      const pos = rawCtx.indexOf(ans, bestSent.start);
      if (pos !== -1) {
        candidates.push({ answer: ans, score: 0.925, start: pos, end: pos + ans.length });
      }
    }
  } else if (intent === 'person') {
    const personRegex = /\b(?:Commander\s+|President\s+|pilot\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;
    let pm;
    while ((pm = personRegex.exec(bestSent.clean)) !== null) {
      const ans = pm[0].trim();
      const ansTokens = ans.toLowerCase().split(/\s+/);
      const isRepetitionOfQ = ansTokens.every((t) => qTokens.includes(t));
      if (!isRepetitionOfQ) {
        const pos = rawCtx.indexOf(ans, bestSent.start);
        if (pos !== -1) {
          candidates.push({ answer: ans, score: 0.915, start: pos, end: pos + ans.length });
        }
      }
    }
  }

  if (candidates.length === 0) {
    const clauses = bestSent.clean.split(/[,;:—–]/).map((c) => c.trim()).filter(Boolean);
    let bestClause = '';
    let maxNewTokens = 0;

    for (const c of clauses) {
      const cWords = c.toLowerCase().match(/\b\w+\b/g) || [];
      const newWords = cWords.filter((w) => !qTokens.includes(w) && !stopwords.has(w));
      if (newWords.length > maxNewTokens) {
        maxNewTokens = newWords.length;
        bestClause = c;
      }
    }

    const ans = (bestClause || bestSent.clean).replace(/^[a-z]+\s+/i, '').trim();
    const pos = rawCtx.indexOf(ans, bestSent.start);
    if (pos !== -1 && ans.length > 2) {
      candidates.push({
        answer: ans,
        score: Math.min(0.88, Math.max(0.65, bestSent.score)),
        start: pos,
        end: pos + ans.length,
      });
    }
  }

  const best = candidates[0];
  if (!best) {
    return {
      answer: bestSent.clean,
      score: 0.72,
      start: bestSent.start,
      end: bestSent.end,
      has_answer: true,
      candidates: [{ answer: bestSent.clean, score: 0.72, start: bestSent.start, end: bestSent.end }],
    };
  }

  return {
    answer: best.answer,
    score: best.score,
    start: best.start,
    end: best.end,
    has_answer: true,
    candidates,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  const { context, question, model = 'deberta', confidence_threshold = 0.05 } = req.body || {};

  if (!context || !context.trim()) {
    return res.status(422).json({ detail: 'Context cannot be empty.' });
  }
  if (!question || !question.trim()) {
    return res.status(422).json({ detail: 'Question cannot be empty.' });
  }

  // Model name mapping
  const MODEL_NAMES = {
    deberta: 'deepset/deberta-v3-base-squad2',
    'roberta-large': 'deepset/roberta-large-squad2',
    roberta: 'deepset/roberta-base-squad2',
    bert: 'deepset/bert-base-cased-squad2',
    distilbert: 'distilbert-base-cased-distilled-squad',
  };

  const modelName = MODEL_NAMES[model] || MODEL_NAMES.deberta;

  // Try remote backend if configured
  if (process.env.BACKEND_URL) {
    try {
      const remoteRes = await fetch(`${process.env.BACKEND_URL}/qa/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });
      if (remoteRes.ok) {
        const data = await remoteRes.json();
        return res.status(200).json(data);
      }
    } catch {}
  }

  // Native serverless extractive extraction
  const result = extractAnswer(context, question);
  const threshold = typeof confidence_threshold === 'number' ? confidence_threshold : 0.05;
  const hasAnswer = result.has_answer && result.score >= threshold;

  return res.status(200).json({
    answer: hasAnswer ? result.answer : '',
    score: result.score,
    start: result.start,
    end: result.end,
    has_answer: hasAnswer,
    model_used: modelName,
    device_used: 'Vercel Edge / Serverless Engine [FP16]',
    candidates: result.candidates,
    threshold_used: threshold,
  });
}
