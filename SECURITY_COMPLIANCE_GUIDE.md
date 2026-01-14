# Security, Compliance & Legal Guide

## 🔒 Security Considerations

### GitHub Security

**✅ Already Implemented:**
- Environment variables not committed (`.gitignore` protects `.env` files)
- API keys stored in Netlify environment variables only
- Using designated `claude/` branches for assistant work

**⚠️ Should Add:**

1. **Dependabot Alerts** (GitHub)
   - Go to: Settings → Security → Code security and analysis
   - Enable: "Dependabot alerts" and "Dependabot security updates"
   - **Why**: Auto-detect vulnerable dependencies and create PRs to fix them

2. **Branch Protection Rules** (GitHub)
   - Go to: Settings → Branches → Add branch protection rule
   - Branch name pattern: `main`
   - Enable:
     - ☑️ Require pull request reviews before merging
     - ☑️ Require status checks to pass before merging
   - **Why**: Prevents accidental direct pushes to production

3. **Secret Scanning** (GitHub - free for public repos)
   - Go to: Settings → Security → Code security and analysis
   - Enable: "Secret scanning"
   - **Why**: Detects accidentally committed API keys

### Netlify Security

**✅ Already Implemented:**
- HTTPS enforcement (automatic with Netlify)
- Environment variables properly scoped
- Rate limiting (20 requests/min per IP)
- Basic security headers (X-Frame-Options, X-Content-Type-Options)

**⚠️ Should Add:**

1. **Enhanced Security Headers**

Add to `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=(), payment=(), usb=()"
    Content-Security-Policy = """
      default-src 'self';
      script-src 'self' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      connect-src 'self' https://*.netlify.app https://*.netlify.com https://*.supabase.co;
      img-src 'self' data:;
      font-src 'self';
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
    """
```

**Why**: Protects against XSS, clickjacking, data injection

2. **Function Timeout Limits**

Already have rate limiting, but consider adding to `netlify.toml`:

```toml
[functions]
  node_bundler = "esbuild"
  included_files = []
  # Max execution time
  [functions."cw"]
    timeout = 10
```

**Why**: Prevents runaway costs if function hangs

3. **Enable Asset Optimization** (optional but recommended)

```toml
[build.processing]
  skip_processing = false
[build.processing.css]
  bundle = true
  minify = true
[build.processing.js]
  bundle = true
  minify = true
```

### Domain Security

**⚠️ Check These:**

1. **DNSSEC** (Domain Name Security)
   - Check at Name.com: Domain Settings → DNSSEC
   - **Why**: Prevents DNS spoofing/hijacking
   - **Action**: Enable if not already on

2. **WHOIS Privacy Protection**
   - Check at Name.com: Domain Settings → Privacy Protection
   - **Why**: Hides personal contact info from public WHOIS
   - **Should be**: Enabled

3. **Domain Auto-Renewal**
   - Check at Name.com: Domain Settings → Auto-Renewal
   - **Should be**: Enabled (prevents accidental expiration)

4. **Transfer Lock**
   - Check at Name.com: Domain Settings → Transfer Lock
   - **Should be**: Enabled (prevents unauthorized transfers)

---

## 🛡️ Ethical & Safety Guardrails

### AI-Specific Safety

**✅ Already Implemented:**
- Conversation termination for abuse ("We're done here")
- Hallucination prevention (explicit boundaries)
- Mental health disclaimer ("Not a substitute for professional advice")
- Rate limiting (prevents spam/abuse)

**⚠️ Should Add:**

1. **Content Moderation**

Add to system prompt in `netlify/functions/cw.js`:

```
CONTENT YOU WON'T ENGAGE WITH:
- Requests for illegal activity
- Self-harm or suicide ideation → Respond: "I'm not equipped for this. Please reach out to the 988 Suicide & Crisis Lifeline (call or text 988) or talk to a mental health professional."
- Violence, abuse, or harm to others
- Explicit sexual content
- Hate speech or harassment

If someone asks you to help with any of these, decline clearly and terminate the conversation if they persist.
```

2. **Crisis Resource Links**

Add to footer in `index.html` after disclaimer:

```html
<div class="crisis-resources" style="margin-top: 0.75rem; font-size: 0.7rem; color: var(--dim);">
    In crisis? <a href="https://988lifeline.org" target="_blank" rel="noopener">988 Lifeline</a> |
    <a href="https://www.crisistextline.org" target="_blank" rel="noopener">Crisis Text Line</a>
</div>
```

**Why**: Duty of care if someone in crisis lands on the site

---

## ♿ Accessibility Compliance (WCAG 2.1 AA)

### Current Issues Found

**❌ Color Contrast**
- Footer text (#666 on #0d0d0d) = **2.85:1** (needs 4.5:1 for AA)
- Disclaimer was 0.5 opacity (failed) - **FIXED** ✅

**❌ Keyboard Navigation**
- No visible focus indicators on buttons/inputs
- No skip navigation link
- Prompt chips need keyboard support

**❌ Screen Reader Support**
- No ARIA labels on interactive elements
- No announcements for dynamic content (typing, new messages)
- No semantic HTML landmarks

**❌ Motion/Animation**
- No respect for `prefers-reduced-motion`
- Typing animation always plays

### Fixes Required

I'll create a comprehensive accessibility update in a separate file with all the changes needed. This is significant work.

**Priority Issues to Fix Before Launch:**

1. **Color Contrast** - Make footer text lighter
2. **Focus Indicators** - Add visible focus states
3. **ARIA Labels** - Add to input, buttons, prompt chips
4. **Skip Link** - Add "Skip to chat" for keyboard users
5. **Screen Reader Announcements** - Announce new messages
6. **Respect prefers-reduced-motion** - Disable animations if requested

---

## 📜 Legal Requirements

### Privacy Policy (REQUIRED)

**Why Required:**
- You're collecting conversation data
- You're logging IP addresses (even if hashed)
- You're using session tracking

**What Must Be Disclosed:**

1. **What data you collect:**
   - Conversation messages (user input + CW responses)
   - Session IDs (client-generated)
   - IP address hashes (for abuse prevention)
   - Timestamps
   - Token usage metrics

2. **How you use it:**
   - To improve CW's responses
   - To analyze conversation patterns
   - To detect abuse/spam
   - Cost/usage monitoring

3. **How long you keep it:**
   - Need to define: 90 days? 1 year? Indefinitely?
   - Recommendation: 90 days for improvement, then delete

4. **User rights:**
   - Right to request their data
   - Right to request deletion
   - How to contact you: derek@claudewill.io

5. **Third parties:**
   - Anthropic (Claude API) - processes messages
   - Supabase - stores conversation logs
   - Netlify - hosts and routes traffic

6. **International users:**
   - GDPR (EU): Need consent banner if EU users
   - CCPA (California): Need "Do Not Sell My Info" link

**Location:** Create page at `/privacy.html` and link from footer

### Terms of Use (HIGHLY RECOMMENDED)

**Why Important:**
- Limits your liability
- Sets expectations
- Protects intellectual property

**What Should Include:**

1. **Acceptable Use Policy:**
   - No illegal activity
   - No abuse or harassment
   - No attempts to bypass rate limits
   - No scraping or automated access

2. **Disclaimers:**
   - CW is an AI assistant, not a professional advisor
   - Not liable for decisions made based on CW's advice
   - No warranty of accuracy or availability
   - May terminate service at any time

3. **Intellectual Property:**
   - CW system prompt is your intellectual property
   - User retains rights to their input
   - Output is generated by Claude (Anthropic)

4. **Limitation of Liability:**
   - Not liable for indirect/consequential damages
   - Liability limited to $0 (since it's free)

5. **Governing Law:**
   - Which state law applies (your state)
   - Dispute resolution process

**Location:** Create page at `/terms.html` and link from footer

### AI-Specific Disclosures

**Should Add to Disclaimer:**

Current:
> "CW is an AI assistant. Not a substitute for professional advice. Conversations may be reviewed to improve CW."

Recommended:
> "CW is an AI assistant powered by Claude (Anthropic). Not a substitute for legal, medical, financial, or mental health advice. Conversations may be reviewed to improve CW. By using this service, you agree to our [Terms](#) and [Privacy Policy](#)."

### Age Restrictions

**Recommendation:** Add age restriction

**Why:** Data collection from children under 13 requires COPPA compliance (burdensome)

**How:** Add to Terms of Use:
> "You must be at least 13 years old to use this service. If you are under 18, you must have parental consent."

---

## 🚨 Critical Pre-Launch Actions

### Must Do Before Public Launch:

- [ ] **Privacy Policy** - Create and link from footer
- [ ] **Terms of Use** - Create and link from footer
- [ ] **Update Disclaimer** - Add links to Privacy/Terms
- [ ] **Crisis Resources** - Add to footer
- [ ] **Content Moderation** - Add to system prompt
- [ ] **Enhanced Security Headers** - Update netlify.toml
- [ ] **Accessibility Fixes** - At minimum: contrast, focus, ARIA labels

### Should Do Soon (30 days):

- [ ] **Branch Protection** - Enable on GitHub
- [ ] **Dependabot** - Enable vulnerability scanning
- [ ] **DNSSEC** - Enable on domain
- [ ] **Data Retention Policy** - Define and implement
- [ ] **GDPR Consent** - If expecting EU users
- [ ] **Full Accessibility Audit** - Test with screen reader

### Nice to Have:

- [ ] **Bug Bounty/Responsible Disclosure** - Contact method for security issues
- [ ] **Rate Limit Dashboard** - Monitor abuse attempts
- [ ] **Backup Strategy** - Export Supabase data regularly
- [ ] **Incident Response Plan** - What to do if API key leaks

---

## 📋 Compliance Checklist

### GitHub
- [x] API keys not committed
- [ ] Dependabot enabled
- [ ] Branch protection on main
- [ ] Secret scanning enabled

### Netlify
- [x] HTTPS enforced
- [x] Environment variables secured
- [x] Basic security headers
- [ ] Enhanced CSP headers
- [ ] Function timeout limits

### Domain
- [ ] DNSSEC enabled
- [ ] WHOIS privacy enabled
- [ ] Auto-renewal enabled
- [ ] Transfer lock enabled

### Legal
- [ ] Privacy policy created
- [ ] Terms of use created
- [ ] Age restriction disclosed
- [ ] AI-specific disclaimers added
- [ ] Crisis resources linked

### Accessibility
- [ ] WCAG 2.1 AA color contrast
- [ ] Keyboard navigation support
- [ ] Screen reader support (ARIA)
- [ ] Focus indicators visible
- [ ] prefers-reduced-motion respected

### Safety
- [x] Rate limiting implemented
- [x] Conversation termination for abuse
- [x] Mental health disclaimer
- [ ] Content moderation in system prompt
- [ ] Crisis resources in footer

---

## 💰 Cost of Non-Compliance

**Privacy Policy/Terms Missing:**
- Risk: FTC complaints, user lawsuits
- If collecting EU data without GDPR compliance: Up to €20M or 4% revenue (whichever is higher)

**Accessibility Non-Compliance:**
- Risk: ADA lawsuits (US), AODA (Canada), EAA (EU)
- Settlement range: $10K-$100K+ plus legal fees

**Security Breach:**
- Risk: User data leaked, API key stolen
- Cost: Potential API abuse ($1000s), reputation damage, legal liability

**Recommendation:** Focus on Privacy Policy + Terms as highest priority, then accessibility basics.

---

## 📞 Next Steps

I can help you create:

1. **Privacy Policy** - Tailored to CW's specific data practices
2. **Terms of Use** - With appropriate disclaimers and limitations
3. **Accessibility Fixes** - Detailed implementation for WCAG 2.1 AA
4. **Enhanced Security Headers** - Updated netlify.toml

**Which would you like me to tackle first?**

Recommendation: Start with Privacy Policy + Terms (1 hour), then accessibility (1-2 hours).
