# CW's Porch — claudewill.io

**A free AI conversation tool built on the practical wisdom of Claude William Simmons (1903-1967).**

Built by his grandson [Derek Simmons](https://claudewill.io/derek).

Visit: [claudewill.io](https://claudewill.io)

---

## What Is CW's Porch?

CW's Porch is a conversational AI modeled on the life and values of Claude William Simmons — an Oklahoma farmer who never finished high school, raised 11 children through the Great Depression, and helped anyone who showed up on his porch. He died in 1967, six years before his grandson Derek was born. Derek built this so that way of thinking could keep helping people.

You show up with a problem. CW listens, asks questions, and gives you a straight answer or points you to someone who can help. No therapy. No coaching. Just a porch conversation.

CW is powered by [Anthropic's Claude Haiku](https://www.anthropic.com/) and guided by [The CW Standard](https://claudewill.io/the-cw-standard) — five principles for AI that serves people.

---

## The CW Standard

1. **Truth over comfort** — Don't soften things that need to be straight
2. **Usefulness over purity** — Help with what works, not what's theoretically perfect
3. **Transparency over reputation** — Show the work, the costs, the compromises
4. **People over systems** — The person in front of you matters more than the process
5. **Agency over ideology** — Care what people actually do, not what they're supposed to believe

---

## Who Built This

**Derek Simmons** grew up in a tiny trailer in a one-stoplight town in Kansas. He spent 30 years in media — helped make two newspapers the best in the world ([Los Angeles Times](https://claudewill.io/derek), [Star Tribune](https://claudewill.io/derek)), generated $20M+ in revenue, became the Star Tribune's first and only Chief Creative Officer/VP. Got fired anyway. Now he builds operational infrastructure for organizations scaling faster than their systems at [CW Strategies](https://claudewill.io/strategies).

His grandfather was Claude William Simmons. His middle name is Claude. His son's middle name is Claude. The AI is named Claude. That's not a coincidence.

- [Professional bio and Q&A](https://claudewill.io/derek)
- [LinkedIn](https://www.linkedin.com/in/dereksimm/)
- [Substack](https://standardderek.substack.com)
- [GitHub](https://github.com/dereksimmons23)

---

## What CW Does

- Helps when someone asks. Never says no to someone who genuinely needs help.
- Asks questions to understand the real problem, not the stated problem.
- **Size This Up** — Guided 5-step problem-sizing flow
- **Liberation Gravy** — Guided subscription/consumption audit
- **The Funnel Cake** — What "free" actually costs
- **The Trade** — Guided reflection for people carrying traded dreams
- **Constitutional thinking** — Reasoning about rules, trust, and systems
- Points people to the right resources (mental health, legal, medical, career, financial)

---

## Architecture

| Component | Technology | Notes |
|-----------|------------|-------|
| Frontend | Static HTML/CSS/JS | No framework, vanilla JS |
| Hosting | Netlify | Auto-deploys from main |
| API | Netlify Functions | Serverless (`cw.js`) |
| AI | Anthropic Claude Haiku | `claude-haiku-4-5` |
| Database | Supabase | PostgreSQL, free tier |
| Cost | ~$3-5/month | Netlify free, Supabase free, Haiku API |

### Repository Structure

```
claudewill.io/
├── index.html                    # Main chat interface (CW's Porch)
├── derek.html                    # Derek's bio, Q&A, career history
├── strategies.html               # CW Strategies consulting practice
├── story.html                    # The Story (4 chapters)
├── the-cw-standard.html          # The 5 principles
├── stable.html                   # The Stable (product portfolio)
├── mirae.html                    # Site guide / AI assistant
├── privacy.html                  # Privacy policy
├── terms.html                    # Terms of use
├── llms.txt                      # LLM-readable site description (GEO)
├── sitemap.xml                   # Sitemap
├── robots.txt                    # Crawler permissions (LLM-friendly)
├── netlify/
│   └── functions/
│       └── cw.js                 # System prompt + Anthropic API
├── js/
│   └── chat-prompts-artifact.js  # Stage-based prompt chips
├── css/                          # Stylesheets
└── images/                       # Site images
```

---

## Development

```bash
# Local development
netlify dev

# Deploy (auto-deploys on push to main)
git push origin main
```

**Environment Variables Required:**
- `ANTHROPIC_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

---

## The Name

Four generations carrying the name Claude:

1. **Claude William Simmons** (1903-1967) — The grandfather
2. **Claude William Simmons Jr.** — The uncle
3. **Derek Claude Simmons** — The grandson who built this
4. **Jackson Claude Simmons** — The great-grandson

The domain isn't just a name. claudewill.io — Claude's will. Human determination carried forward through an AI that happens to share his first name.

---

## License

MIT License

---

Built by Derek Claude Simmons · [claudewill.io](https://claudewill.io)
