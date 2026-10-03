# AnswerIntel Website — Build Plan

**Goal:** A marketing site for AnswerIntel with the same structure, polish, and micro-interactions as peec.ai, scoped to what the PRD actually covers.

**Reference:** peec.ai (analyzed 2026-10-03 with `skillui --mode ultra` + `playwright-cli`).

---

## 1. Ground rules

1. **Match the craft, not the brand.** We reproduce Peec's layout system, component types, and interaction patterns. We do NOT copy their copy, logo, illustrations, customer logos, or testimonials. All text comes from our PRD.
2. **No fabricated social proof.** No fake testimonials, customer logos, or ratings. Those sections are skipped until we have real ones.
3. **Fictional demo brands.** Product mocks use made-up brands (Acme, Northwind, Globex, Initech, Umbrella), never real companies. AI platform logos (ChatGPT, Perplexity, Gemini, Google AI) are fine, since they show which platforms we support.
4. **Mocks are real components.** The dashboard, chart, table, and chat in the hero become the actual app components later (`/dashboard` in the PRD). We build them once.
5. **Motion respects `prefers-reduced-motion`.** Every animation has a static fallback.

---

## 2. What Peec actually is (extracted facts)

| Property | Value |
|---|---|
| Built with | Framer (JS-driven motion, Web Animations API) |
| Theme | Light, warm off-white page `#f7f7f7`, pure-white cards, black primary buttons |
| Type | Geist (headings, tight tracking), Geist/Inter (body), Geist Mono / Fragment Mono (code) |
| Grid | 4px base, max content width ~1200px, framed by **vertical page rails + horizontal section dividers** (their signature look) |
| Radius | 6–8px small controls, 12–16px cards, full-pill badges |
| Borders | Hairline `#0000000a`–`#0000001a`, `#e5e5e5` |
| Headline style | Two-tone: line 1 black, line 2 gray (`#737373`-ish) |
| Accent | Mostly monochrome; color only from data (chart lines, deltas, brand tiles) |
| Motion | Subtle: 150–300ms transitions, scroll reveals, auto-cycling tabs, marquee |

Raw extraction lives in the scratchpad (`peec-design/`, DESIGN.md, tokens, 7 scroll frames, hover/focus states) and is installed as the `peec-design` skill for reference.

---

## 3. Section map (Peec → AnswerIntel)

| # | Peec section | AnswerIntel version | PRD source | Decision |
|---|---|---|---|---|
| 1 | Nav + **Product mega-menu** | Product (Visibility, Competitors, Sources, Opportunities, Experiments), How it works, FAQ, Log in, Sign up | §15 dashboard areas | **Build** |
| 2 | Hero: pill badge, two-tone H1, inline metric chips, 2 CTAs, dotted-matrix band, **live dashboard mock** | "AI visibility intelligence for founders" + chips: Mention · Recommendation · Share of Voice · Citations | Product §19, Tech §76 | **Build** (highest priority) |
| 3 | "Understand how AI sees your brand": **auto-cycling tab cards + animated AI-chat demo** | Tabs: Mentioned vs Recommended / Position / Sentiment. Chat shows "Best CRM for a 10-person startup?" streaming in, fake cursor hovers a brand, dark tooltip shows metrics | Tech §26–27 (mention ≠ recommendation) | **Build** (signature interaction) |
| 4 | Key features **bento (6 cards)** with tilted mini-UIs | Discover prompts · Pick high-value prompts (importance score) · Add competitors · Choose AI engines · Find key sources · Act on opportunities | Product §4–11 | **Build** |
| 5 | — (not on Peec) | **"Why am I losing?"**: 6 gap-type cards (Content, Citation, Authority, Positioning, Comparison, Technical) | Product §10, our differentiator | **Add** |
| 6 | Reports: exports / Looker / API + **quadrant scatter (Leaders/Laggers/Controversial)** | Competitor quadrant (visibility × sentiment) + Weekly founder report + Shareable report | Product §8, §13 | **Build** (drop Looker/API) |
| 7 | MCP is live (split section) | Same split layout reused for **Experiments**: before/after chart animating +13pp | Product §12 | **Replace** |
| 8 | **Prompt marquee** (3 rows, opposite directions, edge fade, model icons) | Same, with our prompt categories | Tech §12 | **Build** (cheap, high impact) |
| 9 | Single testimonial + testimonial masonry | — | — | **Skip** until real customers |
| 10 | Dark CTA band with perspective-tilted table | "Find out what AI says about your brand" + Start free / Talk to us | — | **Build** |
| 11 | FAQ accordion | 6–8 questions from PRD | — | **Build** |
| 12 | Black footer, link columns | Slim: Product, Company, Legal, social | — | **Build** (slim) |
| — | Cookie banner, Pricing, Careers, Partnerships, "Peec vs X" comparison pages | — | Not in PRD | **Skip** (comparison pages = later SEO work) |

---

## 4. Micro-component inventory

Each item gets built once in `components/` and shown on a `/lab` page for review.

**Primitives (`components/ui`)**
- `Button`: primary (black), secondary (white + hairline + small square glyph), ghost. Hover: bg shift, 150ms.
- `Badge`: pill with **pulsing dot** ("Now tracking 4 AI engines").
- `MetricChip`: inline icon + label inside body text (hero subtitle).
- `Eyebrow`: small bordered pill with icon ("Key features").
- `NavItem`: hover = soft gray pill background; active state.
- `MegaMenu`: two-column dropdown, scale 0.98→1 + fade, 180ms; featured card on the right; footer strip "What's new → Changelog".
- `Accordion`: chevron rotate, height auto-animate.
- `Tag`: colored soft tags ("Problem-aware", "High value").
- `Checkbox row`: model list with provider icon on the right.
- `SegmentedControl`: Visibility / Sentiment / Position.
- `FilterChip`: "Last 7 days", "All engines".

**Data micro-components (`components/product`)**, reused in the real app later
- `Delta`: ↗ 0.3 green / ↘ 0.2 red.
- `SentimentBar`: `| 86` with colored bar.
- `PositionBadge`: `# 2.7`.
- `BrandTile`: square logo tile with fallback initial.
- `LineChart`: multi-series, smooth curves, **crosshair + dark tooltip** on hover, line draw-in on first view.
- `BarChart`: current vs previous period.
- `QuadrantScatter`: logo dots on visibility × sentiment axes with quadrant labels.
- `CompetitorTable`: ranked rows, sortable header, delta cells.
- `AppFrame`: sidebar (General / Sources / Optimize groups) + top filter bar, which is the hero mock shell.
- `ChatAnswer`: prompt bubble → streamed answer → brand mentions highlighted.
- `FakeCursor`: scripted cursor path for demos.
- `MetricTooltip`: dark card with Visibility / Sentiment / Position.

**Layout & effects (`components/marketing`)**
- `PageRails`: vertical rails + horizontal section dividers (the Peec frame).
- `DotMatrix`: dotted pixel band with slow shimmer (canvas or SVG, GPU-cheap).
- `BentoCard`: card with tilted 3D inner mock; hover = slight lift + tilt.
- `TabCycler`: vertical tab cards with **left progress line**, auto-advance ~5s, pause on hover, click to jump.
- `Marquee`: infinite rows, opposite directions, mask-gradient edges, pause on hover.
- `Reveal`: fade + 8px rise on scroll, staggered children.
- `CountUp`: numbers animate when in view.
- `PerspectiveShowcase`: tilted table inside the dark CTA.

---

## 5. Interaction spec (the parts that make it feel like Peec)

| Interaction | Behavior | Timing |
|---|---|---|
| Scroll reveal | opacity 0→1, y 8→0, children stagger | 400ms ease-out, 60ms stagger, once |
| Hero chart | lines draw in (pathLength 0→1), then hover crosshair + tooltip | 1.2s draw, tooltip follows pointer |
| Tab cycler | active card white + full text, inactive gray; progress line fills; chat panel swaps scene | 5s per tab, 250ms crossfade |
| Chat demo | prompt bubble slides in → answer streams word-by-word → cursor moves to brand → tooltip opens | ~3.5s scene, loops per tab |
| Mega-menu | open on hover (desktop) / tap (mobile), 120ms hover intent delay | 180ms scale+fade |
| Bento hover | card lift 2px, inner mock tilt ±2°, shadow deepens | 200ms |
| Track toggle | "+ Start tracking" → "✓ Actively tracking" morph | 250ms layout animation |
| Marquee | rows scroll at 30–40s per loop, pause on hover | linear, infinite |
| Count-up | 0 → value when visible | 800ms ease-out |
| Accordion | height auto + chevron 180° | 220ms |
| Focus | visible 2px ring on every interactive element | — |
| Reduced motion | all of the above become instant/static | — |

---

## 6. Tech stack

Matches the Technical PRD (§4, §92: Next.js frontend).

- **Next.js (App Router) + TypeScript**, marketing at `app/(marketing)/page.tsx`
- **Tailwind CSS v4** with design tokens as CSS variables
- **shadcn/ui (Radix)** for accessible primitives (accordion, navigation-menu, tooltip)
- **Motion** (`motion/react`) for all animation: reveals, layout morphs, pathLength
- **Geist / Geist Mono** via `next/font` (free, same family Peec uses)
- **Charts:** hand-rolled SVG (lighter and more controllable than a chart lib for marketing mocks); revisit Recharts for the real app
- **Icons:** lucide-react; AI-platform logos via simple-icons
- **Static mock data** in `lib/mock-data.ts`, with no backend calls on the marketing site

```text
frontend/
├── app/
│   ├── (marketing)/page.tsx      # landing
│   ├── lab/page.tsx              # component gallery for review
│   └── layout.tsx
├── components/
│   ├── ui/                       # primitives
│   ├── product/                  # data micro-components (reused by app)
│   └── marketing/
│       ├── sections/             # Hero, MetricsTabs, Bento, WhyLosing, Quadrant, Experiments, Marquee, Cta, Faq, Footer, Nav
│       └── effects/              # PageRails, DotMatrix, Marquee, Reveal, CountUp, TabCycler
├── lib/
│   ├── mock-data.ts
│   └── motion.ts                 # shared durations/easings
└── styles/tokens.css
```

---

## 7. Skill usage plan

| Phase | Skill | What it does for us |
|---|---|---|
| 0 Direction | `peec-design` (from `skillui`) | Reference tokens, spacing, radii, screenshots of Peec |
| 0 Direction | `/impeccable init` | Writes `PRODUCT.md` (audience, voice, constraints) from our PRD so every later design command has context |
| 0 Direction | `ui-ux-pro-max` | Pick palette + font pairing + chart types for "B2B analytics SaaS"; UX guideline checks |
| 0 Direction | `design-taste-frontend` + `minimalist-ui` | Anti-template guardrails; Peec's style is editorial-minimal, so these set the bar |
| 1 Tokens | `design-system` | Primitive → semantic → component token layers in `tokens.css` |
| 2 Primitives | `ui-styling` (shadcn + Tailwind) | Accessible primitives, theming |
| 2–4 Code | `ecc:nextjs-turbopack`, `ecc:react-patterns`, `ecc:frontend-patterns` | App Router structure, component patterns |
| 3 Charts | `dataviz` | Chart color system, tooltip/axis rules, accessible series colors |
| 5 Motion | `ecc:motion-foundations` → `ecc:motion-patterns` → `ecc:motion-advanced` | Reveal, stagger, layout morphs, pathLength draws, marquee, scripted cursor |
| 5 Motion | `ecc:make-interfaces-feel-better` | Micro-detail polish (hover intent, easing, timing) |
| 6 Quality | `ecc:frontend-a11y`, `ecc:accessibility` | Focus, keyboard nav for tabs/menu/accordion, reduced motion |
| 6 Quality | `/impeccable audit`, `/impeccable critique`, `/impeccable polish` | Design QA and anti-pattern sweep (its hooks also run on every UI edit) |
| 7 Verify | `playwright-cli` | Screenshot each section at 1440 / 768 / 390, side-by-side against Peec frames; script hover/tab/marquee checks |
| 7 Verify | `ecc:react-reviewer`, `/code-review` | Code review before merge |
| — | `ecc:taste` | **Not used.** It's a music-video/editing skill, not web design. The web "taste" skill is `design-taste-frontend` (from taste-skill) |
| — | `gpt-taste`, `industrial-brutalist-ui`, `imagegen-*` | **Not used.** Wrong style or image-generation focused |

---

## 8. Build phases & verification

Each phase ends with a check that must pass before the next starts.

| Phase | Deliverable | Verify |
|---|---|---|
| **0. Direction** | `PRODUCT.md`, chosen palette/type, accent color decision | User approves direction |
| **1. Scaffold** | Next.js + Tailwind v4 + shadcn + Motion + Geist; tokens; `PageRails` | `npm run build` passes; `/lab` renders tokens |
| **2. Primitives** | All `ui/` components on `/lab` | playwright-cli screenshots of default/hover/focus states |
| **3. Product mocks** | `AppFrame`, `LineChart`, `CompetitorTable`, `ChatAnswer`, `QuadrantScatter`, `Delta`, badges | Visual match vs Peec hero frame; tooltip works on hover |
| **4. Sections** | In order: Hero → MetricsTabs → Bento → WhyLosing → Quadrant/Reports → Experiments → Marquee → CTA → FAQ → Footer → Nav mega-menu | Each section screenshotted at 3 widths, compared to the matching Peec frame |
| **5. Motion pass** | All interactions in §5 | Scripted playwright run: tab auto-advance, menu open, marquee pause, reduced-motion = static |
| **6. Responsive + a11y + perf** | Mobile layouts (bento stacks, tabs → accordion, marquee 2 rows) | Keyboard-only walkthrough; Lighthouse ≥ 90 perf / 100 a11y |
| **7. Review** | `/impeccable audit` + `/code-review` fixes | No high-severity findings |

Suggested order of value: **Hero + MetricsTabs** first, since together they sell the product. If time is short, cut Experiments and Quadrant, then Bento card illustrations (use static mocks).

---

## 9. Open decisions (need your call)

1. **Accent color & logo.** Peec is monochrome plus data colors. Do we keep that, or add one brand accent? Do we have a logo yet?
2. **CTAs.** "Start free trial" vs "Join waitlist": is signup live at launch?
3. **Pricing page.** Skipped, since the PRD defers billing. Confirm.
4. **Competitor pages** ("AnswerIntel vs Peec/Profound"). Skipped for v1, since they're SEO work for later. Confirm.
