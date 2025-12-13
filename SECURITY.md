# Security Policy

## Reporting a Vulnerability

If you find a security issue, **do not open a public issue**.

- Email: `security@dcs.bio` (or if that alias isn’t set up, use `derek@dcs.bio`)
- Include: what you found, steps to reproduce, and any proof-of-concept

## Scope

This repo is a static site (`index.html`, `js/`, `css/`) with a Netlify Function (`netlify/functions/cw.js`) that talks to third-party APIs.

Key risk areas:
- **Secrets** (Anthropic API key, Supabase service keys)
- **Abuse** (rate limiting, CORS/origin restrictions)
- **Data access** (Supabase RLS policies)

## Secret Handling

- **Never commit API keys** or credentials.
- Use **Netlify environment variables** for runtime secrets.
- Rotate credentials immediately if you suspect exposure.
