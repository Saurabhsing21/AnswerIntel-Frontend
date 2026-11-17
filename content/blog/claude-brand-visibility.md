---
title: "How to Get Your Brand Recommended by Claude"
description: Claude answers from training data unless web search is on, and Anthropic runs separate crawlers for training, search and user requests. Here is what that means for brands.
category: Guide
date: 2026-11-14
author: Saurabh Singh
cover: "Get recommended by Claude"
---

**Claude recommends brands from what it learned in training, or, when web search is on, from the pages it finds and cites.** Anthropic runs three crawlers: ClaudeBot (training), Claude-SearchBot (indexing for search results) and Claude-User (fetching pages when a user asks). To be recommended, let the search and user crawlers in, and build the same third-party mentions that help with every AI assistant.

Crawler descriptions are from Anthropic's help center, checked November 14, 2026.

## Anthropic's crawlers

| User agent | What it does | If you block it |
|---|---|---|
| ClaudeBot | Collects content that may be used for training | Future content excluded from training |
| Claude-SearchBot | Indexes content to improve search results | Pages not indexed for Claude's search |
| Claude-User | Fetches pages when a user asks Claude something | Claude cannot read your page for that user |

If you want Claude to recommend you, allow at least Claude-SearchBot and Claude-User. See [robots.txt for AI crawlers](/blog/robots-txt-for-ai-crawlers).

## Memory vs search

- **Without web search**, Claude reflects how often and how consistently the web described your brand before its training cutoff. New brands rarely appear here until a newer model ships.
- **With web search**, Claude reads current pages and cites them, so the same work as for ChatGPT and Perplexity applies: rank for the question and appear on the pages that are cited.

## What to work on

1. Allow Claude-SearchBot and Claude-User.
2. Publish clear answer pages for your buyers' questions.
3. Get mentioned on review sites, roundups and communities.
4. Keep your one-sentence brand description consistent everywhere.

## How to check

Ask Claude your buyer questions with web search on and off, a few times each. Seenlense tracks Claude from the Growth plan (Seenlense is our product).

## FAQ

### Does Claude search the web?

Yes, when web search is enabled; it then cites the pages it used.

### Should I block ClaudeBot?

That is a training decision. Blocking ClaudeBot does not block Claude-SearchBot or Claude-User, which affect search visibility.
