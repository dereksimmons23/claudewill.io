# CW Release Notes

## v1.0.0 — January 6, 2026

**CW's 123rd Birthday Launch**

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

*Released January 6, 2026 — CW's 123rd birthday*
