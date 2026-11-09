---
title: How ChatGPT Decides Which Brands to Recommend
description: ChatGPT recommends brands from two places, what the model learned in training and what it finds in a live web search. Here is how each works and what you can change.
date: 2026-11-09
author: Saurabh Singh
---

**ChatGPT recommends brands based on two sources: what the model learned during training, and what it finds when it searches the web for the question.** Training knowledge changes slowly, with each new model. Search results change every week. For most founders, the fastest way into ChatGPT's answers is to show up in the pages its search step reads.

## The two paths into an answer

| | From training | From live search |
|---|---|---|
| When it is used | Questions answered from memory | Questions where ChatGPT searches the web (shown with sources) |
| What it reflects | How often and how consistently the web described your brand before the training cutoff | Pages that rank for the query right now |
| How fast it changes | Months, with new model versions | Days to weeks, once pages are indexed |
| What you can influence | Long-term: mentions across many independent sites | Short-term: being in the pages that rank and get cited |

## Path 1: what the model already knows

A language model learns which brands belong to which category from the text it was trained on. If hundreds of articles, threads and reviews mention "Brand X" next to "project management for agencies", the model learns that association. If your brand appears on two pages, it barely registers.

What helps here:

- **Being mentioned on many independent sites**, not just your own.
- **A consistent name and description.** If one site says you are a CRM and another says a marketing tool, the association is weak.
- **Time.** New models only learn about you after you have been written about for a while.

## Path 2: what ChatGPT finds when it searches

For questions about products, prices and "best" lists, ChatGPT often searches the web and writes its answer from the pages it reads. You can see this when it shows sources. OpenAI's search crawler is called OAI-SearchBot, and ChatGPT's search draws on a search index (it has partnered with Bing).

This path rewards:

- **Roundups and comparisons.** "Best X tools" listicles are among the most cited pages for buyer questions. If you are not in them, you are rarely in the answer.
- **Your own clear pages.** Pricing, comparison and "who it's for" pages that state facts plainly are easy to quote.
- **Forums and reviews.** Reddit threads and review sites are frequently cited for "what do people actually use" questions.
- **Being crawlable.** If your robots.txt blocks OAI-SearchBot, ChatGPT search cannot read your pages.

## What makes a brand the recommendation, not just a mention

Getting named is step one. Being the one ChatGPT tells the buyer to pick usually depends on fit with the question:

- **Specific positioning.** "For agencies under 20 people" beats "for everyone". When the question names a segment, the answer favours brands that clearly serve it.
- **Evidence.** Concrete numbers, reviews and comparisons give the model something to repeat.
- **Agreement across sources.** When several independent pages say the same thing about you, the answer is more confident.

## A practical checklist

1. Make sure robots.txt allows OAI-SearchBot and GPTBot, and that your key pages are in Bing and Google.
2. Write a plain "what we do, who it's for, what it costs" section on your homepage and pricing page.
3. Publish honest comparison pages: "You vs Competitor" and "Competitor alternatives".
4. Find the "best X tools" articles ChatGPT cites for your questions and ask the authors to consider adding you.
5. Answer real questions on Reddit and forums where your buyers ask for recommendations.
6. Get your first reviews on G2, Capterra or your category's review site.
7. Measure weekly so you know which of these moved the numbers.

## FAQ

### How long does it take for ChatGPT to start recommending my brand?

Answers that use web search can change within weeks of your pages being indexed and cited. What the model knows without searching only changes with new model versions, which takes months.

### Does ChatGPT use Google or Bing?

ChatGPT search has relied on Bing as one of its sources alongside OpenAI's own crawler, OAI-SearchBot. Being indexed in Bing is worth checking with Bing Webmaster Tools.

### Why does ChatGPT give different answers to the same question?

Answers are generated, not looked up, so wording and the brands named can vary between runs. That is why one test proves little and visibility should be measured across many runs.

### Does blocking GPTBot hurt my visibility?

GPTBot collects training data, while OAI-SearchBot powers search results. Blocking GPTBot keeps your content out of future training, and blocking OAI-SearchBot keeps your pages out of ChatGPT search answers.
