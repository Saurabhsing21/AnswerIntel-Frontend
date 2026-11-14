---
title: "How to Track AI Traffic in GA4"
description: A step-by-step way to see visits from ChatGPT, Perplexity, Gemini, Copilot and Claude in Google Analytics 4, with a copyable referrer regex and its limits.
category: Technical
date: 2026-11-14
author: Saurabh Singh
cover: "Track AI traffic in GA4"
---

**To track AI traffic in GA4, filter sessions by source with a regular expression that matches AI assistant domains such as chatgpt.com, perplexity.ai, gemini.google.com, copilot.microsoft.com and claude.ai, then save it as a custom channel group.** This only counts people who click a link in an AI answer; it does not show how often AI mentions you without a click.

## The regex

```
.*(chatgpt\.com|chat\.openai\.com|openai\.com|perplexity\.ai|gemini\.google\.com|bard\.google\.com|copilot\.microsoft\.com|claude\.ai|deepseek\.com|meta\.ai|grok\.com|you\.com|mistral\.ai).*
```

## Quick check in Reports

1. Reports → Acquisition → Traffic acquisition.
2. Change the primary dimension to **Session source**.
3. Add a filter: Session source **matches regex** the pattern above.

## Make it permanent: a custom channel group

1. Admin → Data display → Channel groups → Create new channel group.
2. Add a channel named **AI assistants** with the condition Source matches regex (pattern above).
3. **Move it above Referral**, or GA4 will classify these visits as Referral first.
4. Save, then pick this channel group in your acquisition reports.

## Limits to know

- **No click, no data.** Most AI answers are read without a click. Track mentions separately with an AI visibility tracker.
- **Missing referrers.** Some apps and in-app browsers strip the referrer; those visits show as Direct.
- **Google AI Overviews and AI Mode** count as Google organic traffic. Google reports them inside Search Console's Web performance, not separately.
- **UTM tags.** ChatGPT sometimes adds utm_source=chatgpt.com to links; the source regex already covers it.

Vercel Analytics, Plausible and similar tools show the same referrer domains, so the regex works there too.

## FAQ

### Can GA4 show ChatGPT traffic?

Yes, as sessions with source chatgpt.com (or chat.openai.com). Use the regex above.

### Why is my AI traffic so low when AI mentions me?

Many people read the answer and never click. Measure mentions with a tracker and treat clicks as a lower bound. See [what AI search visibility is](/blog/what-is-ai-search-visibility).
