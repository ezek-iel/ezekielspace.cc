# SEO Audit — ezekielspace.cc

**Audit date:** 13 August 2026
**Audit type:** Full site audit (technical + on-page + content)
**Scope:** All 13 public pages (homepage, essays listing, 10 essays)
**Method:** Static analysis of source (`src/`), inspection of built output (`dist/`), and live HTTP checks against `https://www.ezekielspace.cc/`

---

## 1. Site Context

| Property | Value |
|---|---|
| Domain | `ezekielspace.cc` (apex) → `www.ezekielspace.cc` (canonical, per og:url + redirects) |
| Hosting | Vercel (edge CDN, HSTS enabled, HTTP→HTTPS 308) |
| Framework | Astro **5.17.2** (static SSG — note: `package.json` declares `^5.17.1`; there is no "Astro v7" — the latest stable major is v5) |
| Content | Personal portfolio + blog: 10 Markdown essays under `src/pages/essays/` |
| Build | Custom integration generates per-post OG images (`/og/<slug>.png`) via Satori + Sharp |
| Fonts | Self-hosted via `@fontsource` (no third-party font requests) ✅ |
| Analytics / Search Console | None detected (no GA/Plausible script, no SC verification meta) |
| Language | Single locale (`en`) — international/hreflang section N/A |
| Primary SEO goal | Establish personal brand ("Ezekiel, software engineer in Lagos"), rank essays for topic keywords (AI for developers, FLIP animations, C programming, SaaS 2026), promote Vale |

**Indexable pages (13):**
- `/` — homepage
- `/posts` — essays listing
- `/essays/5-books`, `/essays/ai-guide`, `/essays/experience-with-ai`, `/essays/farewell-uni`, `/essays/flipping-my-animations`, `/essays/introducing-vale`, `/essays/learning-c`, `/essays/left-behind`, `/essays/not-making-money`, `/essays/saas-in-2026`

---

## 2. Executive Summary

**Overall health: Poor → Fair.** The site is technically clean at the platform level (static HTML, fast, HTTPS, self-hosted fonts, mobile-responsive) but is **invisible to search engines at the foundation level**: there is no XML sitemap, no robots.txt, no canonical tags, no meta descriptions, and no structured data. The site will be indexed eventually, but with zero control over how Google discovers and represents it.

**Top 5 priority issues:**
1. **No XML sitemap + no robots.txt** — Google has no crawl roadmap; all discovery depends on internal links.
2. **No `<meta name="description">` on any page** — Google will auto-generate descriptions from page body text (often the wrong snippet).
3. **No canonical tags** — Google must guess the canonical URL for every page; `og:url` actively points essay pages at a **404 URL** (`/posts/<slug>`).
4. **No structured data** — no Person, WebSite, or BlogPosting schema, forfeiting rich-result eligibility (author info, article snippets, sitelinks).
5. **On-page structure gaps** — `/posts` has **no H1**; `/essays/5-books` has **six H1s**; several essays are thin content (198–275 words).

**Quick wins (hours, not days):**
- Fix the `og:url` bug in `postlayout.astro` (`posts` → `essays`).
- Add `site:` to `astro.config.mjs` + install `@astrojs/sitemap` (both small, high-leverage).
- Add a `<meta name="description">` to `base.astro` (one line, uses existing `description` prop).
- Add `<link rel="canonical">` in `base.astro` (one line).
- Compress `favicon.ico` (208 KB → ~15 KB) and `profile-pic.png` (200 KB → ~60 KB).
- Fix the 307 apex→www redirect to a permanent 308 (Vercel project setting).

---

## 3. Technical SEO Findings

### 3.1 Crawlability

#### 🔴 F-1 — No XML sitemap
- **Issue:** No `sitemap*.xml` is generated. `@astrojs/sitemap` is not installed, and `astro.config.mjs` has no `site` property (a hard prerequisite for sitemap generation).
- **Impact:** High — Google/Bing must rely solely on internal links for discovery; no signal that `/essays/*` pages exist; no control over crawl priority or update frequency.
- **Evidence:** `ls dist/` → no `sitemap*.xml`; `curl https://www.ezekielspace.cc/sitemap-index.xml` → `404`; `package.json` deps lack `@astrojs/sitemap`; `grep -n "site:" astro.config.mjs` → no match.
- **Fix:**
  1. `npx astro add sitemap` (installs `@astrojs/sitemap`).
  2. In `astro.config.mjs` add `site: 'https://www.ezekielspace.cc'`.
  3. Rebuild and submit `https://www.ezekielspace.cc/sitemap-index.xml` in Google Search Console and Bing Webmaster Tools.
- **Priority:** 1 (Critical)

#### 🔴 F-2 — No robots.txt
- **Issue:** No `robots.txt` in `public/`. Vercel returns its generic `NOT_FOUND` page for `/robots.txt`.
- **Impact:** Medium — doesn't block crawling (nothing is disallowed by default), but: (a) no sitemap reference, (b) crawlers must guess, (c) unprofessional signal in GSC.
- **Evidence:** `curl https://www.ezekielspace.cc/robots.txt` → `The page could not be found / NOT_FOUND`; `ls public/` → no `robots.txt`.
- **Fix:** Add `public/robots.txt`:
  ```
  User-agent: *
  Allow: /

  Sitemap: https://www.ezekielspace.cc/sitemap-index.xml
  ```
- **Priority:** 1 (Critical)

#### 🟠 F-3 — Apex→www redirect is temporary (307)
- **Issue:** `https://ezekielspace.cc/` returns `307` to `https://www.ezekielspace.cc/`. A 307 is "temporary"; link equity and canonical consolidation should use a permanent 301/308. (HTTP→HTTPS is correctly a `308`, Vercel default.)
- **Impact:** Medium — Google treats 307 as temporary; repeated 307s can delay consolidation of the apex domain's signals to www. Low risk at this scale, but it's a one-click fix.
- **Evidence:** `curl -sI https://ezekielspace.cc/` → `HTTP/2 307 ... location: https://www.ezekielspace.cc/`.
- **Fix:** In Vercel project → Settings → Domains → ensure "Redirect to" is configured with the permanent (308) redirect option; re-test with `curl -sI`.
- **Priority:** 3 (Quick win)

#### 🟢 F-4 — Site architecture
- **Issue:** Only 2 top-level nav links (`Home`, `Essays`); essays are 2 clicks from homepage (home → /posts → essay, or home → pinned post). No breadcrumbs, no tag pages, no related-posts.
- **Impact:** Low-Medium — all pages are reachable within 3 clicks (passes the click-depth test), but internal linking is the weakest link (see O-6).
- **Evidence:** `Navbar.astro` contains only `/` and `/posts` links; `src/types.ts` shows tags exist but no tag pages (`TODO.md`: "Filter by Tags" is an open todo).
- **Fix:** See O-6 (internal linking plan).
- **Priority:** 4 (Long-term)

### 3.2 Indexation

#### 🔴 F-5 — No canonical tags on any page
- **Issue:** No `<link rel="canonical">` in `base.astro` (the shared layout), so no page emits a canonical. Google must infer canonicals.
- **Impact:** High — with no duplicates today it's low-risk, but any future duplication (e.g., `?utm_*`, trailing-slash variants, `/posts` vs `/essays`) will be mishandled. Canonicals are also required for correct article schema attribution.
- **Evidence:** `grep -c canonical dist/index.html dist/essays/*/index.html` → 0 across all pages.
- **Fix:** In `base.astro` `<head>` add:
  ```astro
  <link rel="canonical" href={`https://www.ezekielspace.cc/${url}`} />
  ```
  and ensure `url` is passed correctly (see F-6). Use the same trailing-slash convention everywhere (`/` for homepage, no trailing slash elsewhere).
- **Priority:** 1 (Critical)

#### 🔴 F-6 — `og:url` on essays points to a 404
- **Issue:** `postlayout.astro` rewrites the page URL: `(frontmatter.url).replace("/essays", "posts")`. The real URL is `/essays/<slug>` (that's what `post.url` links to and what exists in `dist/`), but `og:url` becomes `https://www.ezekielspace.cc/posts/<slug>` — which returns **404**.
- **Impact:** High for social/AI scrapers (Facebook, X, Slack, LLM crawlers that read OG tags) — they see a URL that doesn't exist; Medium for Google (og:url is not a canonical signal, but it is a confusing signal).
- **Evidence:** Live HTML of `/essays/introducing-vale` contains `<meta property="og:url" content="https://www.ezekielspace.cc/posts/introducing-vale">`; `curl -o /dev/null -w "%{http_code}" https://www.ezekielspace.cc/posts/introducing-vale` → `404`; `dist/posts/` contains only `index.html`.
- **Fix:** In `postlayout.astro`, pass the real URL:
  ```astro
  url={frontmatter.url}
  ```
  (remove the `.replace("/essays", "posts")`). Note `frontmatter.url` is the Astro-injected page URL (`/essays/<slug>`).
- **Priority:** 1 (Critical — it's a one-line bug fix)

#### 🟠 F-7 — Trailing-slash inconsistency
- **Issue:** Homepage `og:url` = `https://www.ezekielspace.cc/` (trailing slash); `/posts` and essays have none. Mixed conventions across canonicals/og:url invite duplicate-URL confusion.
- **Impact:** Low (no live duplicates today).
- **Evidence:** `dist/index.html` → `content="https://www.ezekielspace.cc/"`; `dist/posts/index.html` → `content="https://www.ezekielspace.cc/posts"`.
- **Fix:** Standardize on no trailing slash for all non-root paths when fixing F-5/F-6.
- **Priority:** 3 (Quick win — do together with F-5)

### 3.3 Site Speed & Core Web Vitals

#### 🟢 F-8 — Platform performance is good
- **Findings (no Lighthouse available in this environment; static analysis):**
  - HTML pages are tiny: homepage 7.9 KB, essays 3.5–20.5 KB; one bundled CSS 8 KB. No client JS at all (pure static — excellent for LCP/INP/CLS).
  - Fonts self-hosted and subsetted (`space-grotesk`, `ubuntu-sans-mono`, `gloria-hallelujah` as woff2/woff, 12–32 KB each). ✅
  - In-content images are processed by Astro (`dist/_astro/vale-og.CmuSOoe0_1pCJq4.webp`, 40 KB, `loading="lazy" decoding="async"`). ✅
  - Vercel edge CDN + HSTS. ✅
- **Concerns:**
  - `cache-control: public, max-age=0, must-revalidate` on HTML — no browser caching of pages (CDN edge cache mitigates; minor).
  - **Favicon.ico is 208 KB** (should be < 15 KB) — it loads on every page.
  - **`profile-pic.png` is 200 KB** at 256×256 — a 256px avatar should be ~30–60 KB.
  - OG images are 52–104 KB PNGs at 1200×630 — acceptable, but WebP would halve them (minor; they're only loaded by scrapers).
- **Impact:** Low-Medium overall; the site should already pass Core Web Vitals; the favicon/avatar compression is a cheap polish.
- **Fix:** Re-export `favicon.ico` and `profile-pic.png` through an optimizer (e.g., `npx sharp-cli` or an online tool); convert OG PNGs to WebP/JPG in the build integration (`sharp(...).webp()` — one line in `astro.config.mjs`).
- **Priority:** 3 (Quick win)

#### 🟠 F-9 — No custom 404 page
- **Issue:** No `public/404.html`; Vercel's branded `NOT_FOUND` page is served (seen when fetching `/robots.txt`).
- **Impact:** Low-Medium — broken internal links (see O-7) and soft-404s hand users and crawlers to a dead end with no path back to the site.
- **Evidence:** `ls dist/` → no `404.html`; Vercel returned its `NOT_FOUND` body for a missing path.
- **Fix:** Add `src/pages/404.astro` (or `public/404.html`) with a link home + search suggestions.
- **Priority:** 4 (Long-term)

### 3.4 Mobile, Security, URLs — ✅ Passing
- Responsive single codebase, `<meta name="viewport">` present. ✅
- HTTPS everywhere, valid cert, HSTS (`max-age=63072000`), HTTP→HTTPS permanent 308. ✅
- Clean, readable, lowercase, hyphenated URLs: `/essays/flipping-my-animations`. ✅
- `<html lang="en">` present. ✅
- Favicon (SVG + ICO) present. ✅

---

## 4. On-Page SEO Findings

### 4.1 Title Tags

#### 🟠 O-1 — Titles are unique but under-optimized
- **Findings:**
  - Homepage: `Ezekiel | Home` (12 chars) — wastes the most valuable SERP real estate on this domain; no keyword, no value prop.
  - `/posts`: `Ezekiel | Essays` (15 chars).
  - Essays: raw post titles (e.g., `Building Vale`, `Learning C`, `SaaS in 2026`). All < 60 chars ✅ but **no brand suffix** and **no keyword targeting**.
- **Impact:** Medium — uniqueness is good (no duplicates), but homepage doesn't tell Google (or searchers) what the site is about, and essay titles don't target their natural queries.
- **Evidence:** Extracted from built `dist/*/index.html`.
- **Fix:**
  - Homepage: `Ezekiel — Software Engineer in Lagos, Nigeria` (or similar; ≤ 60 chars).
  - Essays: keep the strong title, consider brand suffix on key pages: `FLIP-ping my animations — Ezekiel` or leave as-is if > ~45 chars. Never keyword-stuff.
- **Priority:** 2 (High)

### 4.2 Meta Descriptions

#### 🔴 O-2 — No `<meta name="description">` on any page
- **Issue:** `base.astro` only emits `og:description`. Google will auto-generate descriptions from body copy — usually the wrong snippet, with no CTA.
- **Impact:** High — descriptions influence CTR; you already write good frontmatter descriptions (they're used for OG), so this is pure lost value.
- **Evidence:** `dist/index.html`, `dist/essays/*/index.html` — only `og:description` present, no `name="description"`.
- **Fix:** In `base.astro`:
  ```astro
  <meta name="description" content={description} />
  ```
- **Priority:** 1 (Critical — one line)

#### 🟠 O-3 — Missing/fallback description on one essay + typos in others
- **Issue:** `experience-with-ai.md` has **no** `description` frontmatter, so it falls back to the generic homepage bio ("Ezekiel is a software developer who lives in Lagos…") — the same description as the homepage, and on the `/posts` listing its excerpt renders **blank**.
- **Also:** description typos will appear in SERPs: "a **christain**" and "**getting is life together**" (`5-books.md`); "instead **on** focusing" (`not-making-money.md`).
- **Impact:** Medium — duplicate/fallback descriptions waste CTR; typos in snippets damage perceived trustworthiness.
- **Evidence:** `src/pages/essays/experience-with-ai.md` frontmatter has no `description`; listing HTML shows `<p class="description">  </p>` for that post.
- **Fix:** Add a description to `experience-with-ai.md` (e.g., "How AI has changed my workflow as a developer — a multiplier, not a crutch."); fix typos in the three descriptions above; keep each description 120–160 chars and unique.
- **Priority:** 2 (High)

### 4.3 Heading Structure

#### 🔴 O-4 — `/posts` has no H1; `/essays/5-books` has six H1s
- **Issue:**
  - `posts.astro` renders a bare `<ul>` — **zero H1** on the listing page (it uses `<h3>` for post titles).
  - `5-books.md` contains **five raw `<h1>` tags** inside the HTML content (book titles), plus the layout renders its own `<h1>` with the post title → **six H1s on one page**, and H1→H1 with no hierarchy.
- **Impact:** High — H1 is the strongest on-page relevance signal; missing H1 (listing) and multiple H1s (5-books) degrade topic clarity.
- **Evidence:** `dist/posts/index.html` — no `<h1>` in body; `grep -n "<h1" src/pages/essays/5-books.md` → lines 12, 15, 30, 50, 63, 79.
- **Fix:**
  - `posts.astro`: add `<h1>Essays by Ezekiel</h1>` before the list.
  - `5-books.md`: change the five in-content `<h1>` to `<h2>` (or `<h3>` if nested under the post title H1).
- **Priority:** 1 (Critical)

### 4.4 Content Optimization & Keywords

#### 🟠 O-5 — No keyword targeting anywhere
- **Findings:** No page targets a query deliberately. Natural opportunities exist and should be claimed without rewriting the voice:
  | Page | Natural target query |
  |---|---|
  | `/essays/ai-guide` | "AI guide for developers", "how developers should use AI" |
  | `/essays/flipping-my-animations` | "FLIP animation technique", "Web Animations API" |
  | `/essays/saas-in-2026` | "SaaS in 2026", "AI software products 2026" |
  | `/essays/learning-c` | "learning C programming", "how I learned C" |
  | `/essays/introducing-vale` | "email productivity tool", "Vale email app" |
  | `/essays/5-books` | "best books for programmers" |
  | `/` | "Ezekiel software engineer", "software engineer Lagos" |
- **Impact:** Medium — without targeting, Google infers intent; rankings become passive.
- **Fix:** Work the primary phrase naturally into: title (O-1), H1 (mostly already good), first 100 words, and 1–2 headings. Don't force it — personal voice is the differentiator. Add a keyword-mapping note per essay (see Action Plan).
- **Priority:** 2 (High)

#### 🟠 O-6 — Weak internal linking
- **Findings:** Only 2 nav links; no cross-links between essays; no related-posts block; tags rendered as plain text (not links); pinned section links only to 1 post. Post links on `/posts` and in `PinnedPosts` use **empty anchors** (`<a href="..." aria-label="link to post" />`) — no descriptive anchor text, generic aria-label.
- **Impact:** Medium-High — internal links are how you concentrate PageRank and tell Google what each page is about; "link to post" is a wasted anchor + poor a11y.
- **Evidence:** `posts.astro` `<a href={post.url} aria-label="link to post" />`; `PinnedPosts.astro` same pattern; `Navbar.astro` 2 links; `dist/*/index.html` confirms.
- **Fix:**
  1. Put the post title inside the anchor (e.g., `Ezekiel's Guide to Using AI` as link text) — the stretched-link pattern already makes the whole card clickable, so just make the title the real link.
  2. Add a "Related posts" block in `postlayout.astro` (same tag → 2–3 other posts).
  3. Make tags link to future tag-filter pages (or at least be consistent) — `TODO.md` already lists "Filter by Tags".
- **Priority:** 2 (High)

### 4.5 Images

#### 🟠 O-7 — Missing alt text + hotlinked images in `5-books.md`
- **Issue:** Four `<img>` tags in `5-books.md` have **no alt attribute**, and they hotlink third-party URLs (bing.com `th/id/OIP…`, `images-na.ssl-images-amazon.com`). Hotlinked URLs are unstable, can break (broken image = poor UX + crawl 404s for that asset), leak referrer, and may be blocked by hotlink protection.
- **Impact:** Medium — book covers are decorative-ish but should have alt (`alt="Growing up Spiritually cover"`); hotlinking is a reliability risk.
- **Evidence:** `grep -n "<img" src/pages/essays/5-books.md` → 4 `<img>` without `alt`.
- **Fix:** Download the covers into `src/assets/` (or `public/`), reference locally, add descriptive alt text; let Astro optimize them.
- **Priority:** 2 (High)

#### 🟢 O-8 — Everything else image-related is fine
- In-content images processed/lazy-loaded by Astro ✅; homepage avatar has alt ✅; OG images generated per post ✅ (see F-8 for size notes).

### 4.6 Keyword cannibalization
- **Low risk:** "AI" appears in 2 titles (`ai-guide`, `experience-with-ai`) but they serve different intents (guide vs personal experience). Fine.

---

## 5. Content & E-E-A-T Findings

### 🟠 C-1 — Thin essays
- **Findings (word counts from source):** `introducing-vale` (198), `not-making-money` (246), `learning-c` (272), `farewell-uni` (275), `experience-with-ai` (433). For informational queries, 300+ words with real substance generally competes; under ~250 is thin.
- **Impact:** Medium — thin pages rank poorly and can dilute site-wide quality perception (helpful-content systems).
- **Evidence:** `wc -w src/pages/essays/*.md`.
- **Fix (respect the voice — do not pad):**
  - `introducing-vale`: this is a product announcement; add the actual Vale workflow example, a demo screenshot, FAQ-style details ("when?", "who's it for?").
  - `learning-c`: expand with concrete C concepts you hit (UTF-8, parsing, memory) — already has a strong hook.
  - `farewell-uni`: personal, fine to stay short; consider merging/keeping as-is (pinned personal letter).
  - `not-making-money`: add the "why I build" section + examples of fun projects.
- **Priority:** 3 (High-impact over time)

### 🟠 C-2 — E-E-A-T signals mostly missing
- **Findings:**
  - ✅ Single named author ("Ezekiel"), real identity, GitHub/Bluesky links on homepage — good trust foundation.
  - ❌ No **About page** (bio/experience/career history).
  - ❌ No **author schema** (Person/Profile) or BlogPosting schema with author.
  - ❌ No contact page or email; no privacy/terms (low risk for a personal site, but trust signals Google looks for).
  - ❌ No RSS feed (content sites benefit for syndication/verification; also an audience feature).
- **Impact:** Medium — for a personal-brand site, demonstrating real-world identity is the whole E-E-A-T story; schema makes it machine-readable.
- **Evidence:** `src/pages/` contains only `index.astro` and `posts.astro` + essays; no `about.astro`; no `rss.xml`.
- **Fix:**
  1. Add `/about` page (background, experience, what you're building).
  2. Add JSON-LD: `Person` + `WebSite` on homepage; `BlogPosting` (with `author`, `datePublished`, `image`) on each essay — see S-1.
  3. Add `rss.xml` via `@astrojs/rss` (one config block) and link it in `<head>`.
- **Priority:** 2 (High)

### 🟠 C-3 — Structured data: entirely absent
- **Issue:** Zero `application/ld+json` blocks anywhere (verified in static HTML — the site is fully static, so no JS-injection concern here; this is a genuine absence).
- **Impact:** High — no rich-result eligibility (author/Person info, article snippets, site search links); no machine-readable identity.
- **Evidence:** `grep -rc "ld+json" dist/` → 0.
- **Fix (static site, no client JS needed — put JSON-LD in the layouts):**
  - `base.astro` (homepage): `WebSite` + `Person` schema (name, url, sameAs: GitHub, Bluesky, Vale).
  - `postlayout.astro`: `BlogPosting` schema with `headline`, `description`, `datePublished`, `author: {Person}`, `image: https://www.ezekielspace.cc/og/<slug>.png`, `mainEntityOfPage` = canonical URL.
  - Validate with the [Rich Results Test](https://search.google.com/test/rich-results) after deploying.
- **Priority:** 2 (High)

---

## 6. International SEO
**N/A** — single English locale, no hreflang required. If a second language is ever added: use subdirectory URLs (`/fr/...`), self-referencing hreflang sets, `x-default`, and fully translated content (never cross-locale canonicals).

---

## 7. Analytics & Measurement
- **No analytics detected** (no GA/Plausible/Umami script in any built page). No Search Console verification.
- **Fix:** Install a lightweight analytics (Plausible/Umami) and verify the domain in **Google Search Console** + **Bing Webmaster Tools** immediately. Without GSC you cannot see crawl errors, coverage, or Core Web Vitals field data — the audit's "can Google find it" question stays unanswerable.
- **Priority:** 1 (Critical — measurement foundation)

---

## 8. Prioritized Action Plan

### Phase 1 — Critical fixes (blocking indexation/ranking) — do first
1. ✅ Verify domain in **Google Search Console** (DNS TXT) + submit property; add analytics.
2. ✅ `astro.config.mjs`: add `site: 'https://www.ezekielspace.cc'`; run `npx astro add sitemap`.
3. ✅ Add `public/robots.txt` with `Sitemap:` line.
4. ✅ `base.astro`: add `<meta name="description">` + `<link rel="canonical">` (both one-liners using existing props).
5. ✅ Fix `og:url` bug in `postlayout.astro` (remove the `/essays`→`posts` rewrite; use `frontmatter.url`).
6. ✅ `posts.astro`: add `<h1>`; `5-books.md`: demote 5 raw `<h1>` → `<h2>`.

### Phase 2 — High-impact improvements
7. Add JSON-LD (`WebSite`+`Person` on homepage, `BlogPosting` per essay) and validate via Rich Results Test.
8. Add `/about` page; add `@astrojs/rss`.
9. Write a unique description for `experience-with-ai.md`; fix description typos (christain, "getting is life together", "instead on focusing").
10. Internal linking: real anchor text on `/posts` + pinned links; "Related posts" block in `postlayout.astro`; start tag pages (TODO already planned).
11. Fix `5-books.md` images: download locally, add alt text.
12. Keyword pass: fold each essay's target phrase into title/H1/first-100-words naturally (mapping in O-5).

### Phase 3 — Quick wins (low effort, immediate)
13. Vercel: change apex→www redirect 307 → 308.
14. Compress `favicon.ico` (208 KB → <15 KB) and `profile-pic.png` (200 KB → <60 KB).
15. Convert OG PNGs → WebP in the build integration.
16. Standardize trailing slashes in canonical/og:url (F-7).

### Phase 4 — Long-term / content strategy
17. Expand the 4 thinnest essays (C-1) with genuine detail.
18. Publish on a cadence aligned to the keyword map (AI for devs, C/low-level, FLIP/animations, SaaS/2026, email productivity) — build topical clusters with internal links.
19. Add custom 404 page.
20. Monthly: re-check sitemap, crawl status in GSC, Core Web Vitals report.

---

## 9. Key Evidence Summary

| Finding | Evidence |
|---|---|
| No sitemap | `curl sitemap-index.xml` → 404; `@astrojs/sitemap` not in package.json |
| No robots.txt | `curl /robots.txt` → Vercel NOT_FOUND |
| No `site` config | `grep site: astro.config.mjs` → nothing |
| No meta description | built `dist/*/index.html` — only `og:description` |
| No canonical | `grep canonical dist/` → 0 matches |
| og:url → 404 | live essay HTML shows `og:url …/posts/introducing-vale`; that URL returns 404 |
| 307 apex redirect | `curl -sI https://ezekielspace.cc/` → 307 |
| No H1 on /posts | `dist/posts/index.html` body starts with `<ul>` |
| 6 H1s on 5-books | `grep -n "<h1" src/pages/essays/5-books.md` (5 raw + layout title) |
| No schema | `grep -rc "ld+json" dist/` → 0 |
| Thin content | `wc -w` — 4 posts under 300 words |
| Hotlinked no-alt images | `grep "<img" 5-books.md` → 4 without alt |
| Heavy favicon/avatar | `du -h` → favicon.ico 208K, profile-pic.png 200K |

---

*Report generated from static + live analysis. For runtime Core Web Vitals and indexing status, complete Phase 1 (GSC + analytics) and run PageSpeed Insights on the production URL.*
