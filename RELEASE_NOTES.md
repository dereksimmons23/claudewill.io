# CW Release Notes

## v1.0.1 — December 13, 2024

**Pre-launch Fixes**

Bug fixes and system prompt improvements discovered during testing.

---

### Fixes

**Hallucination Prevention**
- Added explicit family member names to system prompt (Albert David Simmons, Charlton Jackson Simmons)
- Added instruction to never claim "I don't hallucinate" — CW now says "I do my best. When I'm wrong, tell me."
- Strengthened guardrails to prevent mixing up family member details
- Corrected Derek's father Donald (divorced when Derek was 4, not deceased)

**UI Bug**
- Fixed chat scroll on laptop — messages were becoming unscrollable after a few exchanges
- Added `min-height: 0` to flex child for proper overflow behavior

---

## v1.0.0 — January 6, 2025

**CW's 122nd Birthday Launch**

The first public release of CW, a conversational AI shaped by Claude William Simmons (1903-1967).

---

### What's Included

**Core Experience**
- Chat interface with CW at claudewill.io
- Time-based greetings (Morning/Afternoon/Evening)
- Condition-aware responses (dawn, clear, dusk, night, storm)
- Prompt chips for new visitors: "Who are you?", "I'm stuck", "Help me decide", "What's the catch?"
- Multilingual support (CW responds in whatever language you write)

**Design**
- Midnight blue background (#000D1A)
- Noto Sans font for readability
- Mobile-optimized responsive layout
- About modal (no separate page)

**Safety & Compliance**
- Privacy Policy and Terms of Use
- Crisis resources (988 Lifeline, Crisis Text Line)
- Content moderation in system prompt
- WCAG 2.1 AA accessibility

**Security**
- CORS allowlist (not wildcard)
- Input validation (message length limits)
- Rate limiting (20 requests/min per IP)
- CSP and security headers
- Gitleaks secret scanning

**Infrastructure**
- Netlify serverless function
- Claude 3.5 Haiku (Anthropic)
- Supabase conversation logging
- GitHub Actions CI

---

### Known Limitations

- **Porch light glow**: CSS is deployed but not rendering on some browsers (investigating)
- **No session memory**: Each visit starts fresh
- **Family history**: CW redirects detailed genealogy questions to avoid hallucination

---

### What's Next

See [WISHLIST.md](WISHLIST.md) for the post-MVP roadmap:

1. Smarter hallucination prevention
2. Inline contact form
3. Session memory
4. Family mode
5. Analytics dashboard
6. Voice interface
7. Multi-agent family (Vernie)

---

### Technical Details

**Stack**
- Frontend: Vanilla HTML/CSS/JS
- Backend: Netlify Functions (Node.js)
- AI: Claude 3.5 Haiku via Anthropic SDK
- Database: Supabase (PostgreSQL)
- Hosting: Netlify
- Domain: Name.com

**Environment Variables**
- `ANTHROPIC_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---

### Credits

Built by Derek Claude Simmons in honor of his grandfather.

Powered by Claude (Anthropic).

---

*Releasing January 6, 2025 — CW's 122nd birthday*
