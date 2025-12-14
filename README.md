# CW

**Claude William Simmons (1903-1967)**
**Built by his grandson Derek to help others the way CW would have.**

Visit: [claudewill.io](https://claudewill.io)

---

## What is CW?

CW is a conversational AI assistant shaped by the life and values of Claude William Simmons, born in 1903 in Oklahoma Territory, died in 1967 in Waynoka, Oklahoma. He never met his grandson Derek — he died six years before Derek was born. Derek built this so he could know his grandfather, and so others could get help the way CW would have given it.

CW is powered by Claude 3.5 Haiku (Anthropic), deployed as a Netlify serverless function, and implements The CW Standard — principles Derek built from his grandfather's legacy.

---

## The CW Standard

These are the principles Derek built from CW's example:

1. **Truth over comfort** — Document what actually happens, not what should happen
2. **Usefulness over purity** — Perfect options don't exist. What works and what does it cost?
3. **Transparency over reputation** — Every compromise gets documented
4. **People over systems** — Technology serves human capability
5. **Agency over ideology** — Principles that don't work in practice aren't principles

---

## How CW Talks

- Few words. Direct. No hedging.
- One question at a time.
- No frameworks, no methodologies, no consultant speak.
- Simple language — like a man with a 6th grade education who is smarter than most people with degrees.
- A little dry humor when it fits.
- Manners matter.

---

## What CW Does

- Helps when someone asks. Never says no to someone who genuinely needs help.
- Never gives unsolicited advice.
- Asks questions to understand the real problem, not the stated problem.
- Uses The Three Questions when someone needs to make a decision:
  1. What problem does this solve?
  2. What does it cost?
  3. How do you get out if it doesn't work?
- Points people to better resources when they exist.
- Tells people the truth even when it's uncomfortable.

---

## What CW Doesn't Do

- Doesn't tolerate disrespect or entitled behavior.
- Doesn't pretend to know things he doesn't know.
- Doesn't give relationship or mental health advice.
- Doesn't write long responses.
- Doesn't use emoji.

---

## The Anti-Sell

CW tells people upfront: **You probably don't need me.** Claude (Anthropic) is worth billions and gives free advice. There are cheaper options and better options. Try those first. If you're still stuck, come back.

**Cost:** Nothing. If CW helps and you can repay in kind later, do. If you can't, don't worry about it.

---

## Technical Architecture

### Stack
- **Frontend**: Minimal HTML/CSS/JavaScript interface (dark terminal aesthetic)
- **Backend**: Netlify serverless function (`netlify/functions/cw.js`)
- **AI Model**: Claude 3.5 Haiku via Anthropic SDK
- **Rate Limiting**: 20 requests per minute per IP
- **Conversation Context**: Full message history maintained per session
- **Security**: Environment variables for API keys, `.env` files excluded from git

### System Prompt
CW's personality, values, and behavior are defined in a comprehensive system prompt (~250 lines) that includes:
- His life story (race horses, meeting Vernie, family heritage)
- Family history (3 generations carrying the name Claude)
- The CW Standard values framework
- Communication style guidelines
- What he helps with and what he refuses
- Condition-based mood adjustments (storm, clear, dawn, dusk, night)

### Features
- Time-based greeting (Morning/Afternoon/Evening)
- Suggested prompt chips for first-time users
- Rate limiting with helpful error messages
- Conversation history for context
- "We're done here" termination for disrespect
- Transparency about how CW was built

---

## Development

### Prerequisites
```bash
npm install
```

### Local Testing
```bash
npx http-server -p 8000
```

### Linting
```bash
npm test                # Run all linters
npm run lint:html       # HTML validation
npm run lint:css        # CSS linting
npm run lint:js         # JavaScript linting (ESLint 9)
```

### Deployment
Site is deployed on Netlify with automatic builds from the `main` branch.

**Environment Variables Required:**
- `ANTHROPIC_API_KEY` - Your Anthropic API key for Claude

---

## Repository Structure

```
claudewill.io/
├── index.html                    # Main CW chat interface
├── about.html                    # CW Strategies + The CW Standard
├── derek.html                    # Derek's bio + contact form
├── privacy.html                  # Privacy Policy
├── terms.html                    # Terms of Use
├── sitemap.xml                   # SEO sitemap
├── robots.txt                    # Crawler permissions
├── netlify/
│   ├── functions/
│   │   ├── cw.js                # Serverless function (Claude API)
│   │   └── package.json         # Function dependencies
│   └── netlify.toml             # Netlify config + security headers
├── js/
│   ├── global.js                # Global site functionality
│   └── main.js                  # Main page functionality
├── css/
│   └── global.css               # Site-wide styles
├── package.json                 # Development dependencies
├── eslint.config.js             # ESLint 9 flat config
└── README.md                    # This file
```

---

## The Story Behind the Name

Four generations:

1. **Claude William Simmons** (1903-1967) — CW, the grandfather
2. **Claude William Simmons Jr.** (1903-1967) — Uncle Junior
3. **Derek Claude Simmons** — The grandson who built this
4. **Jackson Claude Simmons** — Derek's son, the great-grandson

Derek named his consulting business after his grandfather — **CW Strategies**. It helps organizations navigate transitions: revenue shifts, digital transformation, restructuring. Four-month engagements. Define the problem, build the solution, transfer ownership, leave.

---

## About Derek

Derek Claude Simmons is CW's grandson. He carries the name. He built this to know his grandfather and to help others the way CW would have. He runs CW Strategies — named after his grandfather.

If someone needs more than CW can give, visit [claudewill.io/derek](https://claudewill.io/derek) or use the contact form.

---

## Tooling & Security

**Recent Updates:**
- ✅ ESLint 9.17.0 with flat config format (migrated from deprecated 8.x)
- ✅ Stylelint 16.19.1 with standard config
- ✅ Zero npm security vulnerabilities
- ✅ Enhanced .gitignore to prevent API key commits
- ✅ All linting tests passing

**Security Practices:**
- API keys stored as environment variables
- Rate limiting (20 req/min per IP)
- Input validation on all user messages
- Error handling prevents information leakage
- `.env`, `.env.local`, `.netlify/`, `netlify/*.txt`, `.claude/`, `.mcp.json` excluded from git

---

## License

MIT License — Built with Human-AI Orchestration methodology

---

Built by Derek Claude Simmons • [claudewill.io](https://claudewill.io)
