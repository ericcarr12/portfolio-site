# Eric Carr — Portfolio Site

Personal portfolio and case study site — hand-coded, no framework, no
build step. Live at [eric-carr.com](https://eric-carr.com).

## What's here

- **Homepage** with an AI-powered "ask me about Eric" chat widget, backed
  by a Cloudflare Worker that answers recruiter/hiring-manager questions
  using an actual, current summary of my experience — not a static FAQ
- **Three full UX case studies** (Profit Prophet, Risk Manager, RyderGyde),
  each documenting the real process: personas, user journeys, sketches,
  wireframes, and high-fidelity mockups
- A client logo strip (Korn Ferry, Cognizant/PwC, Ryder, BMW, Norwegian
  Cruise Line, DISH, Breville)

## The chat feature

The homepage chat isn't a wrapper around a generic assistant — it's scoped
to a system prompt containing my actual background, case studies, and
skills, and instructed to be honest about gaps rather than oversell fit.
Architecture:

```
Browser (js/chat.js)
   │  POST { messages: [...] }
   ▼
Cloudflare Worker (eric-carr-chat.erccrr.workers.dev)
   │  — holds the Anthropic API key privately (never in client code)
   │  — CORS-locked to eric-carr.com specifically
   │  — caps conversation length/size so a single visitor can't run up cost
   │  — system prompt is cache-marked, so repeat questions in the same
   │    session hit a ~90%-cheaper cached read instead of full price
   ▼
Claude (Anthropic API)
```

`cloudflare-worker-NOT-for-webserver/` contains the Worker source as a
reference/backup copy of what's actually deployed — the folder name is a
reminder for deployment (this code runs on Cloudflare, not the web host),
not a statement about whether it belongs in the repo.

## A few details worth noticing

- **Every case study image ships as WebP with a JPEG fallback, at 1x/2x**,
  via `srcset` — real responsive-image discipline, not just dropped-in
  screenshots.
- **The contact email is base64-obfuscated** and decoded client-side at
  runtime, so it's not sitting in plaintext for scrapers while staying a
  normal clickable `mailto:` link for real visitors.
- **No build tooling at all** — every page is hand-written HTML/CSS/JS.

## Stack

Vanilla HTML/CSS/JS. Cloudflare Workers for the chat backend proxy.
Anthropic Claude API for the chat responses themselves.

## Structure

```
index.html, profit-prophet.html, risk-manager.html, rydergyde.html
css/            — shared styles
js/             — chat widget, nav/interaction scripts
images/         — shared assets (logo, icons, client logos)
prophet/ risk/ rydergyde/   — per-case-study images
cloudflare-worker-NOT-for-webserver/   — chat backend source (deploy
                                          separately, not part of the
                                          static site)
```
