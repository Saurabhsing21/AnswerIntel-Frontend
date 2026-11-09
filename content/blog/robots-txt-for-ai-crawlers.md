---
title: "robots.txt for AI Crawlers: Which Bots to Allow"
description: The AI crawlers from OpenAI, Anthropic, Perplexity, Google and others, what each one does, and a robots.txt you can copy if you want AI assistants to recommend your brand.
category: Technical
date: 2026-11-09
author: Saurabh Singh
---

**If you want AI assistants to recommend your brand, allow their crawlers in robots.txt.** Most AI companies run separate bots for training, for search and for fetching a page a user asked about. Blocking the search bots keeps your pages out of the answers, so check your robots.txt before anything else.

## The main AI crawlers in one table

| Company | User agent | What it does |
|---|---|---|
| OpenAI | `GPTBot` | Collects content for training models |
| OpenAI | `OAI-SearchBot` | Indexes pages for ChatGPT search results |
| OpenAI | `ChatGPT-User` | Fetches a page when a user's chat needs it |
| Anthropic | `ClaudeBot` | Collects content for training models |
| Anthropic | `Claude-SearchBot` | Indexes pages for Claude's search results |
| Anthropic | `Claude-User` | Fetches a page when a user asks Claude about it |
| Perplexity | `PerplexityBot` | Indexes pages for Perplexity answers |
| Perplexity | `Perplexity-User` | Fetches a page during a user's search |
| Google | `Google-Extended` | Not a separate crawler: a token that controls whether Googlebot-crawled content is used for Gemini |
| Apple | `Applebot-Extended` | Controls whether Applebot-crawled content is used for Apple's AI models |
| Common Crawl | `CCBot` | Builds an open web archive that many AI models train on |

Classic search crawlers matter too: `Googlebot` feeds Google search and AI Overviews, and `Bingbot` feeds Bing, which ChatGPT search has used as a source.

## A robots.txt that welcomes AI assistants

If your goal is to be recommended, the simplest file allows everyone and only blocks private areas:

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /account/

Sitemap: https://example.com/sitemap.xml
```

`User-agent: *` covers every crawler that does not have its own group. You do not need to list each AI bot unless you want to treat some differently.

## Allowing search but blocking training

Some companies want to appear in AI answers without giving content for training. Because training and search use different bots, you can split them:

```
User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: *
Allow: /
```

The trade-off: what a model knows without searching comes from training. Blocking training bots can make assistants less likely to know your brand when they answer from memory.

## Common mistakes

- **A leftover `Disallow: /`** from a staging site that went live.
- **A CDN or firewall bot rule** that blocks AI crawlers even though robots.txt allows them. Check your Cloudflare or hosting bot settings.
- **A `noindex` tag on pages** you want found. robots.txt allows crawling, but `noindex` still keeps a page out of search indexes.
- **Content only rendered in the browser.** Many AI crawlers do not run JavaScript, so text that appears only after scripts run may never be read.

## How to check what you allow

1. Open `yourdomain.com/robots.txt` and read it top to bottom.
2. Check that your sitemap is listed and loads.
3. Look at your server or CDN logs for the user agents above to confirm they actually reach you.
4. Ask the assistants about your brand and see whether they cite your pages.

## FAQ

### Does robots.txt actually stop AI crawlers?

The major AI companies say their crawlers respect robots.txt. It is a convention, not enforcement, so a firewall rule is the only hard block.

### Should I add an llms.txt file?

llms.txt is a proposed plain-text summary of your site for AI assistants. It is cheap to add and does no harm, but there is little evidence yet that major assistants rely on it. Treat it as a bonus, not a fix.

### Will blocking GPTBot remove my brand from ChatGPT?

No. GPTBot only affects training data. ChatGPT search uses OAI-SearchBot, so you can still appear in search answers. What the model knows from earlier training also stays.
