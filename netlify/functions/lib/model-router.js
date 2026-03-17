/**
 * Model Router — Fallback routing across AI providers
 *
 * Cycles through models in priority order. If one fails, tries the next.
 * Logs which model served the request. Returns to primary when it recovers.
 *
 * Priority: Claude Opus → Sonnet → Haiku → Gemini → Mistral → Ollama
 *
 * Built by Derek*Claude. Model-agnostic by design.
 * The seven files don't care which model reads them.
 */

const Anthropic = require('@anthropic-ai/sdk');

// ── Model Registry ──────────────────────────────────────
const MODELS = [
  {
    id: 'claude-opus',
    provider: 'anthropic',
    model: 'claude-opus-4-20250514',
    label: 'Claude Opus',
    maxTokens: 4096,
    tier: 1
  },
  {
    id: 'claude-sonnet',
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    label: 'Claude Sonnet',
    maxTokens: 4096,
    tier: 1
  },
  {
    id: 'claude-haiku',
    provider: 'anthropic',
    model: 'claude-haiku-4-5-20251001',
    label: 'Claude Haiku',
    maxTokens: 2048,
    tier: 1
  },
  {
    id: 'gemini-flash',
    provider: 'google',
    model: 'gemini-2.0-flash',
    label: 'Gemini Flash',
    maxTokens: 4096,
    tier: 2
  },
  {
    id: 'gemini-pro',
    provider: 'google',
    model: 'gemini-2.0-pro',
    label: 'Gemini Pro',
    maxTokens: 4096,
    tier: 2
  },
  {
    id: 'mistral-small',
    provider: 'mistral',
    model: 'mistral-small-latest',
    label: 'Mistral Small',
    maxTokens: 2048,
    tier: 2
  },
  {
    id: 'mistral-large',
    provider: 'mistral',
    model: 'mistral-large-latest',
    label: 'Mistral Large',
    maxTokens: 4096,
    tier: 2
  },
  {
    id: 'ollama-llama',
    provider: 'ollama',
    model: 'llama3.1:8b',
    label: 'Ollama Llama 3.1',
    maxTokens: 2048,
    tier: 3
  }
];

// ── Provider Clients ────────────────────────────────────

function getAnthropicClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

async function callAnthropic(model, system, messages, maxTokens) {
  const client = getAnthropicClient();
  if (!client) throw new Error('ANTHROPIC_API_KEY not set');

  const response = await client.messages.create({
    model: model.model,
    max_tokens: maxTokens || model.maxTokens,
    system,
    messages
  });

  return {
    content: response.content[0].text,
    usage: {
      input: response.usage?.input_tokens || 0,
      output: response.usage?.output_tokens || 0
    }
  };
}

async function callGoogle(model, system, messages, maxTokens) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  // Convert Anthropic message format to Gemini format
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model.model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents,
        generationConfig: {
          maxOutputTokens: maxTokens || model.maxTokens
        }
      })
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  return {
    content: text,
    usage: {
      input: data.usageMetadata?.promptTokenCount || 0,
      output: data.usageMetadata?.candidatesTokenCount || 0
    }
  };
}

async function callMistral(model, system, messages, maxTokens) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error('MISTRAL_API_KEY not set');

  // Convert to Mistral format (OpenAI-compatible)
  const mistralMessages = [
    { role: 'system', content: system },
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model.model,
      messages: mistralMessages,
      max_tokens: maxTokens || model.maxTokens
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Mistral ${response.status}: ${err}`);
  }

  const data = await response.json();

  return {
    content: data.choices[0].message.content,
    usage: {
      input: data.usage?.prompt_tokens || 0,
      output: data.usage?.completion_tokens || 0
    }
  };
}

async function callOllama(model, system, messages, maxTokens) {
  const host = process.env.OLLAMA_HOST || 'http://localhost:11434';

  // Convert to Ollama format
  const ollamaMessages = [
    { role: 'system', content: system },
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  const response = await fetch(`${host}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model.model,
      messages: ollamaMessages,
      stream: false,
      options: { num_predict: maxTokens || model.maxTokens }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Ollama ${response.status}: ${err}`);
  }

  const data = await response.json();

  return {
    content: data.message.content,
    usage: {
      input: data.prompt_eval_count || 0,
      output: data.eval_count || 0
    }
  };
}

// ── Provider Dispatch ───────────────────────────────────

const PROVIDERS = {
  anthropic: callAnthropic,
  google: callGoogle,
  mistral: callMistral,
  ollama: callOllama
};

// ── Circuit Breaker ─────────────────────────────────────
// Track which models are down so we don't waste time retrying

const circuitBreaker = {
  failures: new Map(),
  cooldownMs: 5 * 60 * 1000, // 5 minutes before retrying a failed model

  recordFailure(modelId) {
    this.failures.set(modelId, Date.now());
  },

  isAvailable(modelId) {
    const lastFailure = this.failures.get(modelId);
    if (!lastFailure) return true;
    if (Date.now() - lastFailure > this.cooldownMs) {
      this.failures.delete(modelId);
      return true;
    }
    return false;
  },

  reset(modelId) {
    this.failures.delete(modelId);
  }
};

// ── Router ──────────────────────────────────────────────

/**
 * Route a request through the model chain with fallback.
 *
 * @param {object} options
 * @param {string} options.system — system prompt
 * @param {array} options.messages — [{role, content}] conversation
 * @param {number} [options.maxTokens] — override max tokens
 * @param {string} [options.prefer] — preferred model id (e.g., 'claude-haiku')
 * @param {string[]} [options.only] — restrict to these model ids
 * @param {string[]} [options.skip] — skip these model ids
 * @param {number} [options.timeoutMs] — per-model timeout (default 30s)
 * @returns {Promise<{content: string, model: object, usage: object, fallback: boolean, attempts: array}>}
 */
async function route(options) {
  const {
    system,
    messages,
    maxTokens,
    prefer,
    only,
    skip = [],
    timeoutMs = 30000
  } = options;

  // Build the model chain
  let chain = [...MODELS];

  // If prefer is set, move that model to front
  if (prefer) {
    const preferred = chain.find(m => m.id === prefer);
    if (preferred) {
      chain = [preferred, ...chain.filter(m => m.id !== prefer)];
    }
  }

  // Filter by only/skip
  if (only && only.length > 0) {
    chain = chain.filter(m => only.includes(m.id));
  }
  chain = chain.filter(m => !skip.includes(m.id));

  // Filter by circuit breaker
  chain = chain.filter(m => circuitBreaker.isAvailable(m.id));

  if (chain.length === 0) {
    throw new Error('No models available — all in circuit breaker cooldown');
  }

  const attempts = [];

  for (const model of chain) {
    const provider = PROVIDERS[model.provider];
    if (!provider) {
      attempts.push({ model: model.id, error: 'No provider handler' });
      continue;
    }

    try {
      // Race between the API call and a timeout
      const result = await Promise.race([
        provider(model, system, messages, maxTokens),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), timeoutMs)
        )
      ]);

      // Success — reset circuit breaker for this model
      circuitBreaker.reset(model.id);

      attempts.push({ model: model.id, status: 'success' });

      return {
        content: result.content,
        model,
        usage: result.usage,
        fallback: model.id !== chain[0].id,
        attempts
      };
    } catch (err) {
      // Record failure
      circuitBreaker.recordFailure(model.id);
      attempts.push({
        model: model.id,
        status: 'failed',
        error: err.message?.substring(0, 100)
      });

      // Continue to next model in chain
      continue;
    }
  }

  // All models failed
  throw new Error(
    `All models failed. Attempts: ${attempts.map(a => `${a.model}:${a.error}`).join(', ')}`
  );
}

// ── Convenience Methods ─────────────────────────────────

/** Quick chat — Claude-preferred with full fallback chain */
async function chat(system, messages, maxTokens) {
  return route({ system, messages, maxTokens, prefer: 'claude-haiku' });
}

/** Premium chat — start with Opus */
async function premiumChat(system, messages, maxTokens) {
  return route({ system, messages, maxTokens, prefer: 'claude-opus' });
}

/** Fast chat — start with Haiku, skip Opus */
async function fastChat(system, messages, maxTokens) {
  return route({ system, messages, maxTokens, prefer: 'claude-haiku', skip: ['claude-opus'] });
}

/** Cheap chat — skip all Claude models */
async function cheapChat(system, messages, maxTokens) {
  return route({ system, messages, maxTokens, skip: ['claude-opus', 'claude-sonnet', 'claude-haiku'] });
}

/** Local only — Ollama */
async function localChat(system, messages, maxTokens) {
  return route({ system, messages, maxTokens, only: ['ollama-llama'] });
}

// ── Exports ─────────────────────────────────────────────

module.exports = {
  route,
  chat,
  premiumChat,
  fastChat,
  cheapChat,
  localChat,
  MODELS,
  circuitBreaker
};
