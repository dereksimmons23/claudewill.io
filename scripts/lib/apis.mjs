/**
 * Multi-Provider AI API Client — claudewill.io
 *
 * Shared library for calling Gemini, Perplexity, Mistral, Cohere,
 * HuggingFace Inference, and Google News RSS.
 *
 * No dependencies — uses native fetch (Node 22).
 * Each function handles its own errors and returns null on failure.
 */

// ─── Gemini (Google) ───────────────────────────────────────────────

/**
 * Call Gemini with optional Google Search grounding.
 * Free tier: 250 req/day on Flash, 1500 search/day.
 */
export async function callGemini(prompt, {
  apiKey = process.env.GEMINI_API_KEY,
  model = 'gemini-2.5-flash',
  maxTokens = 2000,
  temperature = 0.3,
  searchGrounding = true,
  timeoutMs = 45000,
} = {}) {
  if (!apiKey) return { error: 'GEMINI_API_KEY not set', content: null, sources: [] }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const tools = searchGrounding ? [{ google_search: {} }] : []

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools,
        generationConfig: { maxOutputTokens: maxTokens, temperature },
      }),
      signal: AbortSignal.timeout(timeoutMs),
    })

    if (!res.ok) {
      const err = await res.text()
      return { error: `Gemini ${res.status}: ${err.slice(0, 200)}`, content: null, sources: [] }
    }

    const data = await res.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || null
    const sources = (data.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
      .filter(c => c.web)
      .map(c => ({ title: c.web.title || 'Source', url: c.web.uri }))

    return { error: null, content, sources }
  } catch (err) {
    return { error: `Gemini: ${err.message}`, content: null, sources: [] }
  }
}

// ─── Perplexity ────────────────────────────────────────────────────

/**
 * Call Perplexity for search-grounded AI responses.
 * No free tier — requires payment method. ~$1/1M tokens.
 */
export async function callPerplexity(prompt, {
  apiKey = process.env.PERPLEXITY_API_KEY,
  model = 'sonar',
  maxTokens = 2000,
  systemPrompt = 'You are a research assistant. Provide concise, sourced responses. No filler.',
  timeoutMs = 30000,
} = {}) {
  if (!apiKey) return { error: 'PERPLEXITY_API_KEY not set', content: null, citations: [] }

  try {
    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: maxTokens,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    })

    if (!res.ok) {
      const err = await res.text()
      return { error: `Perplexity ${res.status}: ${err.slice(0, 200)}`, content: null, citations: [] }
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || null
    const citations = data.citations || []

    return { error: null, content, citations, usage: data.usage }
  } catch (err) {
    return { error: `Perplexity: ${err.message}`, content: null, citations: [] }
  }
}

// ─── Mistral ───────────────────────────────────────────────────────

/**
 * Call Mistral for analysis/synthesis.
 * Free "Experiment" tier: 2 RPM, 500K TPM, 1B tokens/month.
 */
export async function callMistral(prompt, {
  apiKey = process.env.MISTRAL_API_KEY,
  model = 'mistral-small-latest',
  maxTokens = 2000,
  temperature = 0.3,
  systemPrompt = 'You are a strategic analyst. Be direct and specific.',
  timeoutMs = 30000,
} = {}) {
  if (!apiKey) return { error: 'MISTRAL_API_KEY not set', content: null }

  try {
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: maxTokens,
        temperature,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    })

    if (!res.ok) {
      const err = await res.text()
      return { error: `Mistral ${res.status}: ${err.slice(0, 200)}`, content: null }
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || null

    return { error: null, content, usage: data.usage }
  } catch (err) {
    return { error: `Mistral: ${err.message}`, content: null }
  }
}

// ─── Cohere ────────────────────────────────────────────────────────

/**
 * Call Cohere for reranking documents by relevance.
 * Trial: 1000 calls/month free. $2/1K searches paid.
 */
export async function cohereRerank(query, documents, {
  apiKey = process.env.COHERE_API_KEY,
  model = 'rerank-v3.5',
  topN = 10,
  timeoutMs = 15000,
} = {}) {
  if (!apiKey) return { error: 'COHERE_API_KEY not set', results: null }

  try {
    const res = await fetch('https://api.cohere.com/v2/rerank', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        query,
        documents,
        top_n: topN,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    })

    if (!res.ok) {
      const err = await res.text()
      return { error: `Cohere ${res.status}: ${err.slice(0, 200)}`, results: null }
    }

    const data = await res.json()
    return { error: null, results: data.results }
  } catch (err) {
    return { error: `Cohere: ${err.message}`, results: null }
  }
}

/**
 * Call Cohere chat for general text generation.
 */
export async function callCohere(prompt, {
  apiKey = process.env.COHERE_API_KEY,
  model = 'command-a',
  maxTokens = 2000,
  temperature = 0.3,
  systemPrompt = 'You are a helpful assistant.',
  timeoutMs = 30000,
} = {}) {
  if (!apiKey) return { error: 'COHERE_API_KEY not set', content: null }

  try {
    const res = await fetch('https://api.cohere.com/v2/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: maxTokens,
        temperature,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    })

    if (!res.ok) {
      const err = await res.text()
      return { error: `Cohere ${res.status}: ${err.slice(0, 200)}`, content: null }
    }

    const data = await res.json()
    const content = data.message?.content?.[0]?.text || null
    return { error: null, content, usage: data.usage }
  } catch (err) {
    return { error: `Cohere: ${err.message}`, content: null }
  }
}

// ─── HuggingFace Inference ─────────────────────────────────────────

/**
 * Call HuggingFace Inference API (OpenAI-compatible).
 * Free: $0.10/month credits. PRO ($9/mo): $2/month credits.
 */
export async function callHuggingFace(prompt, {
  apiKey = process.env.HF_TOKEN,
  model = 'mistralai/Mistral-7B-Instruct-v0.3',
  maxTokens = 1000,
  temperature = 0.3,
  systemPrompt = 'You are a helpful assistant.',
  timeoutMs = 30000,
} = {}) {
  if (!apiKey) return { error: 'HF_TOKEN not set', content: null }

  try {
    const res = await fetch('https://router.huggingface.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: maxTokens,
        temperature,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    })

    if (!res.ok) {
      const err = await res.text()
      return { error: `HuggingFace ${res.status}: ${err.slice(0, 200)}`, content: null }
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || null
    return { error: null, content, usage: data.usage }
  } catch (err) {
    return { error: `HuggingFace: ${err.message}`, content: null }
  }
}

// ─── Google News RSS ───────────────────────────────────────────────

/**
 * Fetch headlines from Google News RSS. Free, no key, unlimited.
 * Returns array of { title, source, link, pubDate, topic }.
 */
export async function fetchGoogleNews(topics = ['AI artificial intelligence', 'media industry', 'technology business'], {
  maxPerTopic = 8,
  timeoutMs = 10000,
} = {}) {
  const allItems = []

  for (const topic of topics) {
    try {
      const q = encodeURIComponent(topic)
      const url = `https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`
      const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })

      if (!res.ok) continue
      const xml = await res.text()

      // Parse RSS items with regex (simple, reliable for Google News format)
      const items = []
      const itemRegex = /<item>([\s\S]*?)<\/item>/g
      let match
      while ((match = itemRegex.exec(xml)) !== null && items.length < maxPerTopic) {
        const block = match[1]
        const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
          || block.match(/<title>(.*?)<\/title>/)?.[1] || ''
        const link = block.match(/<link\/>\s*(https?:\/\/[^\s<]+)/)?.[1]
          || block.match(/<link>(.*?)<\/link>/)?.[1] || ''
        const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
        const source = block.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || ''

        if (title) {
          // Google News appends " - Source Name" to titles
          const cleanTitle = title.replace(/\s*-\s*[^-]+$/, '').trim()
          const extractedSource = source || title.match(/-\s*([^-]+)$/)?.[1]?.trim() || ''
          items.push({ title: cleanTitle, source: extractedSource, link, pubDate, topic })
        }
      }

      allItems.push(...items)
    } catch {
      // Skip failed topics, continue with others
    }
  }

  return allItems
}

// ─── Utility ───────────────────────────────────────────────────────

/** Deduplicate headlines by fuzzy title matching. */
export function dedupeHeadlines(items) {
  const seen = new Set()
  return items.filter(item => {
    const key = item.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
    const words = key.split(' ').slice(0, 6).join(' ')
    if (seen.has(words)) return false
    seen.add(words)
    return true
  })
}
