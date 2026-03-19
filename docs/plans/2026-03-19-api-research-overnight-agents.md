# API Research: Overnight Agent System
**Date:** March 19, 2026
**Purpose:** Practical reference for building Node.js overnight agents (cron/GitHub Actions)

---

## 1. Perplexity API (Web Search + AI Synthesis)

**Best for:** Real-time web search with AI-synthesized answers. Citations included. The "search engine that answers."

| Detail | Value |
|--------|-------|
| **Base URL** | `https://api.perplexity.ai` |
| **Auth** | Bearer token in `Authorization` header |
| **Node.js SDK** | OpenAI-compatible — use `openai` npm package with custom baseURL |
| **Free tier** | None. No free credits for new accounts. Must add payment method. |
| **Pro subscriber perk** | $5/month API credit with Pro ($20/mo) subscription |

**Models & Pricing (per 1M tokens):**

| Model | Input | Output | Best For |
|-------|-------|--------|----------|
| **sonar** | $1 | $1 | Quick web search + synthesis |
| **sonar-pro** | $3 | $15 | Deep multi-source research |
| **sonar-reasoning-pro** | $2 | $8 | Complex reasoning with search |
| **sonar-deep-research** | $2 input, $2 citation | $8 output, $3 reasoning | Deep research reports |

**Additional costs:** Web search $0.005/invocation, URL fetch $0.0005/invocation.

**Node.js example:**
```js
import OpenAI from 'openai';

const pplx = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: 'https://api.perplexity.ai'
});

const response = await pplx.chat.completions.create({
  model: 'sonar',
  messages: [{ role: 'user', content: 'Latest AI news today' }]
});

console.log(response.choices[0].message.content);
// Citations in response.citations
```

**Overnight agent cost estimate:** ~10 queries/day with sonar = ~$0.03-0.10/day ($1-3/month).

---

## 2. Google Gemini API (with Google Search Grounding)

**Best for:** Cheapest capable LLM with built-in Google Search. Massive free tier. The overnight agent workhorse.

| Detail | Value |
|--------|-------|
| **Base URL** | `https://generativelanguage.googleapis.com/v1beta/` |
| **Auth** | API key (get from aistudio.google.com/apikey) |
| **Node.js SDK** | `@google/genai` (npm) — current version 1.45.0 |
| **Free tier** | YES — generous, model-dependent (see below) |

**Free Tier Rate Limits (per project, resets midnight PT):**

| Model | RPM | RPD | TPM |
|-------|-----|-----|-----|
| **Gemini 2.5 Flash-Lite** | 15 | 1,000 | 250,000 |
| **Gemini 2.5 Flash** | 10 | 250 | 250,000 |
| **Gemini 2.5 Pro** | 5 | 100 | 250,000 |

**Google Search Grounding (free quota):**

| Model | Free Grounding Quota |
|-------|---------------------|
| Gemini 3 models | 5,000 prompts/month |
| Gemini 2.5 Flash / Flash-Lite | 1,500 RPD (shared) |
| Gemini 2.5 Pro | 1,500 RPD |

After free quota: $14-35 per 1,000 grounding queries.

**Paid Tier Pricing (per 1M tokens):**

| Model | Input | Output |
|-------|-------|--------|
| **Gemini 2.5 Flash-Lite** | $0.10 | $0.40 |
| **Gemini 2.5 Flash** | $0.30 | $2.50 |
| **Gemini 2.5 Pro** | $1.25 | $10.00 |
| **Gemini 3.1 Pro** | $2.00 | $12.00 |

**Node.js example (with Google Search grounding):**
```js
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: 'What are the latest developments in AI news today?',
  config: {
    tools: [{ googleSearch: {} }]
  }
});

console.log(response.text);
// Grounding metadata in response.candidates[0].groundingMetadata
```

**Overnight agent cost estimate:** FREE. 9 agents x 1 call each = 9 calls/day. Flash-Lite free tier allows 1,000 RPD. Even with grounding, 1,500 free searches/day covers everything.

**THIS IS THE PRIMARY ENGINE FOR OVERNIGHT AGENTS.**

---

## 3. Mistral API (Open-Weight Models)

**Best for:** Cheap/free inference on open models. Good code generation (Codestral). Free experiment tier with no credit card.

| Detail | Value |
|--------|-------|
| **Base URL** | `https://api.mistral.ai/v1/` |
| **Auth** | Bearer token — `Authorization: Bearer YOUR_API_KEY` |
| **Node.js SDK** | `@mistralai/mistralai` (npm) — ESM only |
| **Free tier** | YES — "Experiment" plan, no credit card required |

**Free Experiment Tier Limits:**
- 2 requests per minute
- 500,000 tokens per minute
- 1 billion tokens per month
- Access to ALL models including Mistral Large, Codestral, Pixtral

**Model Pricing (per 1M tokens, key models):**

| Model | Input | Output | Best For |
|-------|-------|--------|----------|
| **Devstral Small 2505** | FREE | FREE | Code tasks (free!) |
| **Mistral Nemo** | $0.02 | $0.04 | Cheapest general use |
| **Mistral Small 3.1** | $0.10 | $0.30 | Best value general |
| **Mistral Medium 3.1** | $0.40 | $2.00 | Balanced capability |
| **Mistral Large 3** | $0.50 | $1.50 | Most capable |
| **Magistral Medium** | $2.00 | $5.00 | Premium reasoning |
| **Codestral 2508** | $0.30 | $0.90 | Code generation |

**Node.js example:**
```js
import { Mistral } from '@mistralai/mistralai';

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const result = await mistral.chat.complete({
  model: 'mistral-small-latest',
  messages: [{ role: 'user', content: 'Summarize this article...' }]
});

console.log(result.choices[0].message.content);
```

**Overnight agent cost estimate:** FREE on experiment tier. 9 agents at 2 RPM = easily within 1B tokens/month. Devstral Small is literally $0.

---

## 4. Cohere API (Search, Rerank, RAG)

**Best for:** Reranking search results, embeddings for RAG, document search. Specialized — not a general chat API.

| Detail | Value |
|--------|-------|
| **Base URL** | `https://api.cohere.com/v2/` |
| **Auth** | Bearer token — `Authorization: BEARER YOUR_API_KEY` |
| **Node.js SDK** | `cohere-ai` (npm) |
| **Free tier** | YES — Trial key: 1,000 API calls/month (non-commercial) |

**Trial Key Rate Limits:**

| Endpoint | Trial Limit |
|----------|-------------|
| Chat (Command R+, R, etc.) | 20 req/min |
| Embed | 2,000 inputs/min |
| Rerank | 10 req/min |

**Production Pricing:**

| Service | Price |
|---------|-------|
| **Command R** (generation) | $0.15 / $0.60 per 1M tokens |
| **Command R+** (generation) | $2.50 / $10 per 1M tokens |
| **Command A** (latest) | Contact sales |
| **Rerank 3.5** | $2.00 per 1,000 searches |
| **Embed v3** | $0.10 per 1M tokens |

**Node.js example:**
```js
import { CohereClientV2 } from 'cohere-ai';

const cohere = new CohereClientV2({ token: process.env.COHERE_API_KEY });

// Rerank documents by relevance
const reranked = await cohere.rerank({
  model: 'rerank-v3.5',
  query: 'AI developments in journalism',
  documents: ['doc1 text...', 'doc2 text...', 'doc3 text...']
});

// Embed text for vector search
const embeddings = await cohere.embed({
  model: 'embed-english-v3.0',
  texts: ['text to embed'],
  inputType: 'search_document'
});
```

**Overnight agent use case:** Rerank news articles by relevance before summarizing with Gemini/Mistral. Trial key gives 1,000 calls/month = ~33/day. Sufficient for a daily research brief.

---

## 5. Hugging Face Inference API (Running Open Models)

**Best for:** Running any open model (Llama, Mistral, BERT, etc.) via API. Huge model selection. Pay-per-compute.

| Detail | Value |
|--------|-------|
| **Base URL** | `https://router.huggingface.co/v1/` (OpenAI-compatible) |
| **Auth** | Bearer token — HF access token from huggingface.co/settings/tokens |
| **Node.js SDK** | `@huggingface/inference` (npm) — also OpenAI SDK compatible |
| **Free tier** | YES — $0.10/month credits (free account), $2.00/month (PRO $9/mo) |

**Free tier limits:** ~few hundred requests per hour. Credits cover small workloads.

**How billing works:** Compute time x hardware cost. Example: 10-second GPU request = ~$0.0012.

**Supported providers (routed through HF):** Together, Replicate, Fireworks, and others. No separate accounts needed.

**Node.js example:**
```js
import { InferenceClient } from '@huggingface/inference';

const hf = new InferenceClient(process.env.HF_TOKEN);

// Chat completions (OpenAI-compatible)
const result = await hf.chatCompletion({
  model: 'mistralai/Mistral-7B-Instruct-v0.3',
  messages: [{ role: 'user', content: 'Hello!' }]
});

// Or use OpenAI SDK directly
import OpenAI from 'openai';
const client = new OpenAI({
  baseURL: 'https://router.huggingface.co/v1',
  apiKey: process.env.HF_TOKEN
});
```

**Overnight agent cost estimate:** $0.10 free credits/month covers light usage. For heavier loads, PRO at $9/month gives $2 in credits + higher rate limits.

---

## 6. Hugging Face Hub API (Dataset/Model Management)

**Best for:** Managing training data, uploading adapters, listing models. The "GitHub for ML."

| Detail | Value |
|--------|-------|
| **Base URL** | `https://huggingface.co/api/` |
| **Auth** | Bearer token — HF access token |
| **Node.js SDK** | `@huggingface/hub` (npm) |
| **Free tier** | YES — free for public repos, private repos on free plan |
| **Rate limits** | Standard HF rate limits (generous for normal use) |

**Key operations available:**

| Operation | Method |
|-----------|--------|
| List models/datasets | `listModels()`, `listDatasets()` |
| Get model info | `modelInfo({ name })` |
| Create repo | `createRepo({ repo, accessToken })` |
| Upload files | `uploadFiles({ repo, files, accessToken })` |
| Download files | `downloadFile({ repo, path })` |
| Delete files | `deleteFile({ repo, path, accessToken })` |
| Delete repo | `deleteRepo({ repo, accessToken })` |

**Node.js example:**
```js
import { uploadFiles, listModels, createRepo } from '@huggingface/hub';

// List your models
for await (const model of listModels({
  search: { owner: 'derek-claude' },
  accessToken: process.env.HF_TOKEN
})) {
  console.log(model.name);
}

// Upload training data
await uploadFiles({
  repo: { type: 'dataset', name: 'derek-claude/training-data' },
  accessToken: process.env.HF_TOKEN,
  files: [{
    path: 'data.jsonl',
    content: new Blob([jsonlContent])
  }]
});
```

**Cost:** Free. This is metadata/file management, not inference.

---

## 7. News APIs (Aggregation for Overnight Agents)

### Recommended Stack (all free tier):

#### Primary: Google News RSS (FREE, unlimited)
```js
// No API key needed. Parse RSS with a library.
// npm install rss-parser
import Parser from 'rss-parser';
const parser = new Parser();

// Topic feeds
const aiNews = await parser.parseURL(
  'https://news.google.com/rss/search?q=artificial+intelligence&hl=en-US'
);
const techNews = await parser.parseURL(
  'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB'
);

aiNews.items.forEach(item => {
  console.log(item.title, item.link, item.pubDate);
});
```

#### Secondary: Currents API (600 req/day free)

| Detail | Value |
|--------|-------|
| **Base URL** | `https://api.currentsapi.services/v1/` |
| **Auth** | API key via `apiKey` query parameter |
| **Free tier** | 600 requests/day, all features included |
| **Coverage** | 14,000+ sources, 78 languages |

```js
const res = await fetch(
  `https://api.currentsapi.services/v1/latest-news?apiKey=${process.env.CURRENTS_API_KEY}&category=technology`
);
const data = await res.json();
```

#### Tertiary: GNews API (100 req/day free)

| Detail | Value |
|--------|-------|
| **Base URL** | `https://gnews.io/api/v4/` |
| **Auth** | API key via `apikey` query parameter |
| **Free tier** | 100 requests/day, 10/minute rate limit |
| **Coverage** | 60,000+ sources, 40+ languages |

```js
const res = await fetch(
  `https://gnews.io/api/v4/search?q=AI+journalism&token=${process.env.GNEWS_API_KEY}&lang=en&max=10`
);
```

### All News API Options Compared:

| API | Free Tier | Auth | Coverage | Production OK? |
|-----|-----------|------|----------|---------------|
| **Google News RSS** | Unlimited | None | Google News index | Yes |
| **Currents API** | 600/day | API key | 14,000 sources | Yes |
| **GNews** | 100/day | API key | 60,000 sources | No (dev only) |
| **NewsAPI.org** | 100/day | API key | 80,000 sources | No (dev only) |
| **TheNewsAPI** | 100/day | API token | 50,000 sources | Check terms |
| **Newscatcher** | 1,000/month | x-api-key header | 70,000 sources | Check terms |
| **Mediastack** | 500/month | Access key | 7,500 sources | Limited |
| **Bing News Search** | 1,000/month | Subscription key | Bing index | Yes (Azure) |
| **NewsData.io** | 200 credits/day | API key | 89 languages | Check terms |

---

## Cost Summary: The $0/Month Overnight Agent Stack

| Service | Monthly Cost | What It Does |
|---------|-------------|--------------|
| **Gemini Flash-Lite (free tier)** | $0 | Primary LLM for summarization, analysis |
| **Gemini Search Grounding (free tier)** | $0 | Web search via Gemini (1,500/day free) |
| **Mistral (experiment tier)** | $0 | Secondary LLM, code review agent |
| **Google News RSS** | $0 | Primary news feed (unlimited) |
| **Currents API** | $0 | Secondary news feed (600/day) |
| **Cohere Trial** | $0 | Reranking search results (1,000/month) |
| **HF Hub API** | $0 | Training data management |
| **HF Inference** | ~$0 | $0.10 free credits for open models |
| **TOTAL** | **$0/month** | |

### If you add Perplexity for deep research:
| Perplexity sonar | ~$3-5/month | 10 deep research queries/day |

---

## Recommended Architecture for Overnight Agents

```
GitHub Actions (5 AM CST cron)
  |
  ├── news-scan.mjs
  |     ├── Google News RSS (free, unlimited)
  |     ├── Currents API (free, 600/day)
  |     └── GNews API (free, 100/day)
  |
  ├── research-brief.mjs
  |     ├── Gemini 2.5 Flash + Google Search grounding (free)
  |     └── OR Perplexity sonar ($0.01/query)
  |
  ├── content-scan.mjs
  |     └── Mistral Small (free experiment tier)
  |
  ├── code-review.mjs
  |     └── Mistral Codestral or Devstral (free)
  |
  ├── analytics.mjs
  |     └── Gemini Flash-Lite (free, cheapest)
  |
  └── housekeeping.mjs
        └── Gemini Flash-Lite (free)
```

**Total API keys needed (store as GitHub Secrets):**
- `GEMINI_API_KEY` — from aistudio.google.com/apikey
- `MISTRAL_API_KEY` — from console.mistral.ai (experiment plan, no CC)
- `CURRENTS_API_KEY` — from currentsapi.services
- `GNEWS_API_KEY` — from gnews.io
- `COHERE_API_KEY` — from dashboard.cohere.com (trial key)
- `HF_TOKEN` — from huggingface.co/settings/tokens
- `PERPLEXITY_API_KEY` — optional, requires payment method

**npm packages needed:**
```json
{
  "@google/genai": "^1.45.0",
  "@mistralai/mistralai": "latest",
  "cohere-ai": "latest",
  "@huggingface/inference": "latest",
  "@huggingface/hub": "latest",
  "openai": "latest",
  "rss-parser": "latest"
}
```

---

## Key Decisions

1. **Gemini is the workhorse.** Free tier is unmatched. 1,000 RPD on Flash-Lite, built-in Google Search grounding with 1,500 free queries/day. No other provider comes close at $0.
2. **Mistral is the backup/specialist.** Free experiment tier with access to ALL models. Use Codestral/Devstral for code tasks. 1B tokens/month free.
3. **Perplexity is premium search.** Only use when Gemini grounding isn't deep enough. $1/1M tokens on sonar is cheap but not free.
4. **Cohere is for reranking.** Don't use it for chat. Use it to sort news articles by relevance before feeding to Gemini/Mistral. 1,000 calls/month free.
5. **Google News RSS is free news.** No API key, no rate limit, no terms restrictions. Start here.
6. **Currents API is the best free news API.** 600/day with full features. Better free tier than NewsAPI.org.
7. **HF is for the training pipeline.** Hub API for managing datasets/adapters. Inference API for testing models. Both free enough.
