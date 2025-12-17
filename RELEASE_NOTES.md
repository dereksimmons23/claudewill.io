# CW Release Notes

## v1.1.0 — December 14, 2024

**Jan 6 Launch Prep**

Safety, UX, and SEO/GEO improvements ahead of the Jan 6, 2025 launch.

---

### Safety & Verification

- **Age gate**: Visitors confirm 18+ (or 13+ with parental consent) before first message
- **Honeypot field**: Hidden input catches bots
- **Minnesota Nice protection**: CW is helpful but not naive — detects probing, protects Derek's personal info
- **Story guarding**: CW earns stories through conversation, doesn't give them to strangers

### UX Improvements

- **Contextual prompt chips**: Prompts stay visible and change by conversation stage (Start → Early → Mid → Late → Derek mentioned)
- **Inline contact form**: "Contact Derek" renders a form in the chat instead of navigating away
- **Natural conversation arc**: CW wraps up naturally at 6-8 exchanges, closes at 10-12
- **Message limit**: Lowered from 20 to 12 per conversation

### New Content

- **/about page**: CW Strategies + The CW Standard (5 principles) + About CW
- **About modal**: Now links to /about for deeper context
- **/derek page**: Links to /about from "The CW Standard" mention

### System Prompt Updates

- Stories earned, not given freely ("I'll swap stories once I know what brought you here")
- Graceful hallucination handling ("Vernie kept all that in her head, not me")
- Smarter contact routing (offer Derek after 5+ meaningful exchanges)
- Conversation rhythm guidance for natural close

### SEO/GEO

- **Schema.org**: Structured data on all pages (WebApplication, Organization, Person, DefinedTermSet)
- **Meta tags**: Enhanced titles, descriptions, canonical URLs
- **sitemap.xml**: Updated for minimal site structure
- **robots.txt**: Explicit AI crawler permissions (GPTBot, Perplexity, anthropic-ai, etc.)

### Known Issues

- **Desktop scroll**: Chat area doesn't scroll on desktop browsers (works on mobile). Under investigation.

---

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

*Releasing January 6, 2026 — CW's 123rd birthday*
