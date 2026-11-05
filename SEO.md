# SEO Audit — ezekielspace.cc

**Date:** 5 November 2026
**Scope:** Full site (17 built routes), source-level audit + `dist/` inspection
**Status:** ⚠️ **Not live yet** — everything below is cheaper to fix now than after launch

---

## Executive summary

**Overall health: Fair → Good** (P1 remediated — see the status column below; discoverability foundation is now in place)

The site is a fast, well-structured Astro static build with real content and no crawl traps. The problem is not the site — it is the *signals*. At the time of the audit, every one of the 17 pages told Google the exact same thing: the same `<title>`, the same `<meta description>`, no canonical, no sitemap, no structured data, and no robots.txt. Google had nothing to distinguish "The 012 Rule" from "About me", and no machine-readable statement that a person named Ezekiel Akinfenwa exists at this domain.

There was also one genuine leak: an unpublished essay (`visible: false`) was being built and served at a public URL.

All five P1 issues are now fixed and verified — see the remediation log below.

### Scorecard

| Area | Score | Notes |
| --- | --- | --- |
| Crawlability | 🟢 9/10 | ✅ `robots.txt`, sitemap and a real 404 page |
| Indexation control | 🟢 8/10 | ✅ Draft removed, canonicals added, trailing slash fixed |
| On-page (titles/descriptions) | 🟢 9/10 | ✅ 16/16 pages have a unique title + description |
| Structured data | 🟢 9/10 | ✅ `Person`, `WebSite`, `BlogPosting`, `BreadcrumbList` — 0 validator errors; per-essay `image` still pending |
| Site architecture / internal links | 🟠 4/10 | Flat, 1 internal link across all essays, no tag pages (deferred) |
| Content depth | 🟢 7/10 | 246–892 word essays, genuine first-hand writing |
| E-E-A-T | 🟠 6/10 | ✅ `Person` + `sameAs` now emitted; author/date still not visible on posts |
| Performance / CWV | 🟠 6/10 | Static HTML, fonts self-hosted, but ~90 KB animation JS on the homepage |
| Mobile | 🟢 8/10 | Responsive, viewport set, fluid type |
| Security / URL structure | 🟢 8/10 | Clean lowercase hyphenated URLs, HTTPS-ready |

### Top 5 priority issues

1. ✅ **Fixed** — Unpublished essay was publicly indexable (`/essays/5-books` despite `visible: false`).
2. ✅ **Fixed** — All pages shared one title and one description; essays ignored their own frontmatter `description`.
3. ✅ **Fixed** — No canonical tags, no sitemap, no `robots.txt`.
4. ✅ **Fixed** — No structured data: `Person`, `WebSite`, `BlogPosting` and `BreadcrumbList` now ship on every relevant page.
5. **`/cv.pdf` 404s from the nav on every page** — a dead link in the global navigation of every route.

### Quick wins (under an hour each)

- ✅ Fix the `visible` filter on the essay route (5 min)
- ✅ Pass `title` / `description` props from every page (30 min)
- ✅ Add `canonical` tags to `Layout.astro` (30 min) — OG/Twitter still open, see P2.2
- ✅ Add `robots.txt` (1 min)
- ⬜ Replace the lorem ipsum on `/essays` (2 min)
- ✅ Add `src/pages/404.astro` (15 min)

---

## Method / evidence

Everything below was verified against the actual build, not assumed. The output shown is the state **before** the P1 fixes.

```bash
pnpm build                                  # 17 pages generated
grep -o '<title>[^<]*</title>' dist/**/index.html
grep -o 'name="description" content="[^"]*"' dist/**/index.html
ls dist/robots.txt dist/sitemap*.xml dist/favicon* dist/404.html
grep -c "5-books" dist/essays/index.html    # 0 → filtered from list
ls dist/essays/5-books/index.html           # exists → published anyway
```

Findings:

```
dist/about/index.html                         <title>Ezekiel — software that works perfectly</title>
dist/ai/index.html                            <title>Ezekiel — software that works perfectly</title>
dist/essays/index.html                        <title>Ezekiel — software that works perfectly</title>
dist/essays/012-rule/index.html               <title>Ezekiel — software that works perfectly</title>
dist/essays/5-books/index.html                <title>Ezekiel — software that works perfectly</title>
...
dist/index.html                               <title>Ezekiel — software that works perfectly</title>
```

All 17 pages: identical `<title>` **and** identical `<meta name="description">`.

> Schema note: this audit reads the built HTML directly, so any JSON-LD would appear in `dist/`. There is none — this is a real finding, not a tooling limitation.

---

## 🔴 P1 — Critical (fix before launch)

> **Status: all four P1 items are implemented** (5 Nov 2026). Findings are kept below as the record of what was wrong and why the fix looks the way it does.

### ✅ P1.1 — Unpublished essay is built and indexable — *FIXED*

**Issue:** `src/pages/essays/[...slug].astro` builds a page for *every* essay in the collection, including ones with `visible: false`. The `visible` flag is only applied on the listing page (`src/pages/essays.astro`), never on the route.

**Impact:** High. `/essays/5-books` is a public, crawlable, orphan page for a draft you have not finished. Once Google finds it (it will — it is in the sitemap you are about to create, and drafts are often linked from previews/shares), removing it cleanly means a 410 or a redirect. It also contains four hotlinked, unstructured external images with no `alt` attributes.

**Evidence:**
```
src/pages/essays/[...slug].astro:7   const essays = await getCollection("essays");
dist/essays/5-books/index.html       ✅ built and served
dist/essays/index.html               "5-books" absent from listing → orphan page
```

**Fix:** filter at the route level, and keep the draft out of `getStaticPaths` entirely so it never exists on disk.

```astro
// src/pages/essays/[...slug].astro
export async function getStaticPaths() {
  const essays = await getCollection("essays", ({ data }) => data.visible);
  return essays.map((essay) => ({
    params: { slug: essay.id },
    props: { essay },
  }));
}
```

Then delete the stale output so it cannot survive a stale deploy cache:

```bash
rm -rf dist/essays/5-books
```

**Priority:** P1 — blocker.

---

### ✅ P1.2 — Every page has the same `<title>` and `<meta description>` — *FIXED*

**Issue:** `Layout.astro` accepts `title` and `description` props, but **no page passes them**. Essays have a `description` field in frontmatter that is validated by the schema and then never used.

**Impact:** High. Duplicate titles across a site is treated as a quality signal problem; Google will rewrite your titles in SERPs. All 14 essays are competing for the same brand-less, keyword-less title, so none of them can rank for their own topic.

**Evidence:**
```
dist/essays/012-rule/index.html   <title>Ezekiel — software that works perfectly</title>
dist/about/index.html             <title>Ezekiel — software that works perfectly</title>
```
Every page: `<title>Ezekiel — software that works perfectly</title>` and
`content="I build software that works perfectly and runs seamlessly."`

**Fix:** add a `<title>` template and pass real props.

`src/components/Layout.astro`:

```astro
---
interface Props {
  title?: string;
  description?: string;
  /** Root-relative path for the canonical URL. Defaults to the current route. */
  path?: string;
}

const SITE = "https://www.ezekielspace.cc";
const NAME = "Ezekiel Akinfenwa";

const {
  title = `${NAME} — Software Engineer in Lagos`,
  description = "I build software that works perfectly and runs seamlessly. Go, TypeScript and SvelteKit. Essays on engineering, AI tooling and shipping.",
  path,
} = Astro.props;

/** Trailing-slash form, matching `trailingSlash: "always"`. Assets are left alone. */
const withTrailingSlash = (pathname: string) => {
  const isFile = /\/[^/]*\.[^/]+$/.test(pathname);
  return isFile || pathname.endsWith("/") ? pathname : `${pathname}/`;
};

const canonical = new URL(withTrailingSlash(path ?? Astro.url.pathname), SITE).href;
---

<head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />
  <!-- OG / Twitter / icons: see P2.2 -->
</head>
```

> OG, Twitter card and icon tags were deliberately left out of the P1 pass — they belong to P2.2 and slot into the same `<head>`.

Then per page:

```astro
<!-- src/pages/index.astro -->
<Layout
  title="Ezekiel Akinfenwa — Software Engineer in Lagos"
  description="I build software that works perfectly and runs seamlessly. Go, TypeScript and SvelteKit. Essays on engineering, AI tooling and shipping."
/>
```

```astro
<!-- src/pages/about.astro -->
<Layout
  title="About Ezekiel Akinfenwa — Full Stack Engineer & Designer"
  description="Full stack software engineer and designer based in Lagos, Nigeria. I build in Go, TypeScript and SvelteKit, and care most about excellent user experience."
/>
```

```astro
<!-- src/pages/ai.astro -->
<Layout
  title="AI Usage Policy — Ezekiel Akinfenwa"
  description="How I use AI: research, fact checking and proofreading — never for writing the content on this site. Written in accordance with the AI Manifesto."
/>
```

```astro
<!-- src/pages/essays.astro -->
<Layout
  title="Essays — Ezekiel Akinfenwa"
  description="Essays on software engineering, AI tooling, learning in public and building things for the fun of it."
/>
```

```astro
<!-- src/pages/essays/[...slug].astro -->
<Layout
  title={`${essay.data.title} — Ezekiel Akinfenwa`}
  description={essay.data.description ?? `An essay by Ezekiel Akinfenwa: ${essay.data.title}.`}
  type="article"
  path={`/essays/${essay.id}`}
/>
```

**Title length discipline:** primary keyword first, brand last, 50–60 characters.
**Description discipline:** 150–160 characters, unique, states the value, no keyword stuffing.

**Priority:** P1 — blocker.

---

### ✅ P1.3 — No canonical URLs — *FIXED*

**Issue:** No `<link rel="canonical">` on any page.

**Impact:** High. `https://ezekielspace.cc` and `https://www.ezekielspace.cc` both resolve to the same content (and your own essay links to the apex while `astro.config.mjs` declares `www`). Without canonicals, link equity splits across host variants and any trailing-slash / `index.html` duplicates.

**Evidence:** `grep -rl "canonical" dist --include=*.html` → no matches.

**Fix:** add to `Layout.astro` `<head>` (after the title):

```astro
<link rel="canonical" href={canonical} />
```

Notes:
- Every page must self-canonical. Never point deep pages at the homepage.
- Canonical must agree with the sitemap and `og:url` exactly — same protocol, same host, same trailing-slash form.
- Astro's default `trailingSlash: "ignore"` builds `dist/essays/index.html`, which is served at `/essays/`. Pick **trailing slash** as canonical so it matches the built output:

```js
// astro.config.mjs
export default defineConfig({
  site: "https://www.ezekielspace.cc",
  trailingSlash: "always",   // /essays/ — matches the emitted directory index
  integrations: [icon()],
});
```

Then 301 the non-slash form at the host level (see P2.3).

**Priority:** P1 — blocker.

---

### ✅ P1.4 — No `robots.txt` and no XML sitemap — *FIXED*

**Issue:** Neither file is generated. There is no `public/` directory at all.

**Impact:** High. No sitemap means slow discovery of 14 essays and no way to see coverage in Search Console. No `robots.txt` means no sitemap declaration and no crawl directives — including no way to keep a future staging/preview deployment out of the index.

**Evidence:** `ls dist/robots.txt dist/sitemap*.xml` → both missing.

**Fix (sitemap):** install the official integration.

```bash
pnpm add -D @astrojs/sitemap
```

```js
// astro.config.mjs
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.ezekielspace.cc",
  trailingSlash: "always",
  integrations: [
    icon(),
    sitemap({
      // belt-and-braces: drafts must never reach the sitemap
      filter: (page) => !page.includes("/5-books"),
    }),
  ],
});
```

*No-dependency alternative* if you would rather not add a package — `src/pages/sitemap.xml.ts`:

```ts
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

const SITE = "https://www.ezekielspace.cc";

export const GET: APIRoute = async () => {
  const essays = await getCollection("essays", ({ data }) => data.visible);

  const urls = [
    { loc: "/", lastmod: undefined, priority: "1.0" },
    { loc: "/essays/", lastmod: undefined, priority: "0.9" },
    { loc: "/about/", lastmod: undefined, priority: "0.8" },
    { loc: "/ai/", lastmod: undefined, priority: "0.3" },
    ...essays.map((e) => ({
      loc: `/essays/${e.id}/`,
      lastmod: e.data.date.toISOString().slice(0, 10),
      priority: "0.7",
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${new URL(u.loc, SITE).href}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
```

**Fix (robots.txt):** create `public/robots.txt`.

```
# ezekielspace.cc
User-agent: *
Allow: /

# draft essays are filtered at build time; this is a second guard
Disallow: /5-books

Sitemap: https://www.ezekielspace.cc/sitemap-index.xml
```

> If you use `@astrojs/sitemap`, the file is `sitemap-index.xml` (plus `sitemap-0.xml`). If you use the hand-rolled endpoint above, it is `sitemap.xml`.

**Critical for a not-yet-live site:** if you deploy a staging URL (`staging.ezekielspace.cc`, `*.pages.dev`, `*.vercel.app`) alongside production, add `X-Robots-Tag: noindex` **on the staging host only**. Do not ship a `Disallow: /` left in the production `robots.txt`.

**Priority:** P1 — blocker.

---

### ✅ P1.5 — No structured data (JSON-LD) — *FIXED*

**Issue:** No `application/ld+json` on any page.

**Impact:** High for a personal site. You are competing for your own name against LinkedIn, GitHub and Peerlist. `Person` + `sameAs` is exactly the signal that ties those profiles to this domain. `BlogPosting` gives essays eligibility for rich results and improves how AI search surfaces quote you.

**Evidence:** `grep -rl "application/ld+json" dist` → no matches.

**Fix:** four node types, all emitted from one shared module.

**1. `src/lib/schema.ts`** — single source of truth for `SITE`, `NAME` and every node. `Person` and `WebSite` are referenced everywhere by `@id`, so the author and the site are one entity instead of repeated literal objects.

```ts
import meta from "../meta.json";

export const SITE = "https://www.ezekielspace.cc";
export const NAME = "Ezekiel Akinfenwa";

const PERSON_ID = `${SITE}/#person`;
const WEBSITE_ID = `${SITE}/#website`;

/** Escape `<` so a title containing markup cannot close the script tag early. */
export const toJsonLd = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");

/** Empty entries in meta.json are skipped, so sameAs never links to nowhere. */
const sameAs = Object.values(meta.socials).filter(
  (url): url is string => typeof url === "string" && url.trim() !== "",
);

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": PERSON_ID,
  name: NAME,
  alternateName: "Ezekiel",
  url: `${SITE}/`,
  jobTitle: "Full Stack Software Engineer & Designer",
  description:
    "Software engineer based in Lagos, Nigeria, building in Go, TypeScript and SvelteKit.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Lagos",
    addressCountry: "NG",
  },
  knowsAbout: [
    "Go", "TypeScript", "SvelteKit",
    "Software Engineering", "Product Design", "Web Performance",
  ],
  sameAs,
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: `${SITE}/`,
  name: NAME,
  description:
    "Essays on software engineering, AI tooling and building things for the fun of it.",
  author: { "@id": PERSON_ID },
  publisher: { "@id": PERSON_ID },
  inLanguage: "en",
};
```

**2. `Layout.astro`** emits `Person` + `WebSite` on every page, and exposes a `head` slot so a page can add its own nodes into `<head>` rather than dropping JSON-LD into `<body>`:

```astro
<head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />

  <script type="application/ld+json" is:inline set:html={toJsonLd(personSchema)} />
  <script type="application/ld+json" is:inline set:html={toJsonLd(websiteSchema)} />

  {/* Per-page schema (BlogPosting, BreadcrumbList) */}
  <slot name="head" />
</head>
```

**3. `BlogPosting` + `BreadcrumbList`** are built in the same module and injected by the essay route through `slot="head"`:

```ts
export const blogPostingSchema = ({ title, description, date, tags, path }: BlogPostingInput) => {
  const url = new URL(path, SITE).href;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: title,
    description,
    datePublished: date.toISOString(),
    dateModified: date.toISOString(), // no revision tracking yet, so the two agree
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(tags.length > 0 ? { keywords: tags.join(", ") } : {}),
    inLanguage: "en",
  };
};

export const breadcrumbSchema = ({ title, path }: { title: string; path: string }) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name: "Essays", item: `${SITE}/essays/` },
    { "@type": "ListItem", position: 3, name: title, item: new URL(path, SITE).href },
  ],
});
```

```astro
<!-- src/pages/essays/[...slug].astro -->
<Layout title={`${essay.data.title} — ${NAME}`} description={...} path={path}>
  <script slot="head" type="application/ld+json" is:inline set:html={toJsonLd(post)} />
  <script slot="head" type="application/ld+json" is:inline set:html={toJsonLd(breadcrumbs)} />
  <article>…</article>
</Layout>
```

> `sameAs` currently resolves to GitHub only — `linkedin`, `bluesky` and `youtube` are empty strings in `src/meta.json`. Fill those in before launch; they are the strongest authority signals available to a personal site, and they are what makes the `Person` node resolve to *you* and not a namesake.
>
> A per-essay `image` is not emitted because the content collection has no `image` field yet (see P3.2). Google recommends an image for `BlogPosting` but does not require one.
>
> `tags` feed `BlogPosting.keywords` only. Tag archive routes are deliberately **out of scope for now** — see P2.5.

**Priority:** P1 — blocker (before Search Console submission).

---

## 🟠 P2 — High impact

### P2.1 — `/cv.pdf` 404s from the global nav on every page

**Issue:** `src/meta.json` has `"cv-link": "/cv.pdf"`. There is no `public/cv.pdf`, so `<a href="/cv.pdf">CV</a>` in `Navbar.astro` is a broken link rendered on all 17 pages.

**Impact:** Medium-High. Broken links in global navigation waste crawl budget, and the CV is your highest-value conversion asset.

**Evidence:** `ls dist/cv.pdf` → missing; `grep -o 'href="/cv.pdf"' dist/index.html` → present.

**Fix:** add `public/cv.pdf`. Add `public/` to the repo (it does not exist yet — needed for `robots.txt` and the OG image too). If you would rather not host a PDF, point the nav item at `/about/#cv` or an external URL.

**Priority:** P2 — fix before launch.

---

### P2.2 — No Open Graph / Twitter card tags, no favicon, no OG image

**Issue:** Sharing any URL produces a bare text link with no image. No favicon, no apple-touch-icon, no web manifest.

**Impact:** Medium. Large social/AI previews materially affect CTR from Bluesky, LinkedIn, X and Slack — and CTR feeds back into how often the page is re-crawled.

**Fix:** add to `Layout.astro`:

```astro
<meta property="og:type" content={type} />
<meta property="og:site_name" content="Ezekiel Akinfenwa" />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonical} />
<meta property="og:image" content={ogImage} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="en_NG" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={ogImage} />

<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
```

Create in `public/`: `og-default.png` (1200×630), `favicon.svg`, `apple-touch-icon.png` (180×180), `site.webmanifest`.

Later, generate per-essay OG images from the title with `satori`/`@vercel/og` — a real CTR lift for a writing site, but not a launch blocker.

**Priority:** P2 — fix before launch.

---

### P2.3 — Host inconsistency: `www` vs apex

**Issue:** `astro.config.mjs` declares `site: 'https://www.ezekielspace.cc'`, but `src/content/essays/site-seo.md` links to `https://ezekielspace.cc` (apex). No redirect config exists in the repo (no `netlify.toml`, `vercel.json`, `_redirects`, `wrangler.toml`, or `public/_headers`).

**Impact:** Medium-High. Two hostnames serving identical content splits equity and creates "Duplicate, Google chose a different canonical" reports. Left unfixed, canonicals will point one way while real traffic arrives the other.

**Fix:**
1. Decide: **`www`** (matches current config) or apex. Then commit to it everywhere — `site`, canonical, `og:url`, sitemap, internal links, `robots.txt`, social profiles.
2. Add the 301 at the host level. Cloudflare Pages (`public/_redirects`):

```
https://ezekielspace.cc/*  https://www.ezekielspace.cc/:splat  301!
```

Netlify (`public/_redirects`) uses the same syntax. Vercel (`vercel.json`):

```json
{
  "redirects": [
    { "source": "/(.*)", "has": [{ "type": "host", "value": "ezekielspace.cc" }],
      "destination": "https://www.ezekielspace.cc/$1", "permanent": true }
  ]
}
```

3. Fix the apex link in `src/content/essays/site-seo.md`:

```md
One thing was not cool though, my [website](https://www.ezekielspace.cc) wasn't part of it.
```

**Priority:** P2 — fix before launch (a redirect rule is a one-liner but must be in place from day one).

---

### P2.4 — Essay pages render no date, no author, no tags

**Issue:** `src/pages/essays/[...slug].astro` outputs `<h1>` + markdown body and nothing else. The publication date and author exist in frontmatter and are rendered on the *list* page, but not on the article itself.

**Impact:** Medium-High (E-E-A-T). A reader landing from search cannot see when the post was written or who wrote it. Google's helpful-content signals weight visible authorship and freshness heavily for personal blogs, and AI answer engines cite pages with explicit dates far more readily.

**Evidence:** `grep -o '<time' dist/essays/site-seo/index.html` → 0 matches; the string `2026` does not appear in the rendered body.

**Fix:** extend the essay template:

```astro
<Layout
  title={`${essay.data.title} — Ezekiel Akinfenwa`}
  description={essay.data.description ?? `An essay by Ezekiel Akinfenwa.`}
  type="article"
>
  <article>
    <header>
      <h1 class="essay-title title">{essay.data.title}</h1>
      <p class="meta">
        By <a href="/about/">Ezekiel Akinfenwa</a> ·
        <time datetime={essay.data.date.toISOString()}>
          {essay.data.date.toLocaleDateString("en-US", {
            year: "numeric", month: "long", day: "numeric",
          })}
        </time>
        {essay.data.tags.length > 0 && (
          <> · {essay.data.tags.map((t) => <span class="tag">{t}</span>)}</>
        )}
      </p>
    </header>
    <div class="content"><Content /></div>
  </article>
</Layout>
```

Also render a visible byline block at the foot of the article ("Written by Ezekiel Akinfenwa, software engineer in Lagos") — that is the paragraph AI search engines and readers use to establish who is speaking.

**Priority:** P2.

---

### P2.5 — Almost no internal linking; tags are collected and never used

**Issue:** Across 14 essays there is exactly **one** internal link (`moved-to-linux.md` → `/essays/ai-workflow`). The `tags` array in the content schema is populated on every post and used for nothing — no tag pages, no related-essays block.

**Impact:** Medium-High. Internal links are how PageRank moves between your own pages and how Google understands topical clusters. You have natural clusters already: *AI* (4 posts), *software engineering* (5), *personal/life* (5). None of them are connected.

**Evidence:**
```
grep -rno "](/[^)]*)" src/content/essays/*.md
→ moved-to-linux.md:39:](/essays/ai-workflow)   (1 result total)
```

**Fix, in order of value:**

1. **Related essays** at the bottom of each post — score by shared tags, take the top 3:

```astro
---
const all = await getCollection("essays", ({ data }) => data.visible);
const related = all
  .filter((e) => e.id !== essay.id)
  .map((e) => ({
    essay: e,
    score: e.data.tags.filter((t) => essay.data.tags.includes(t)).length,
  }))
  .filter((r) => r.score > 0)
  .sort((a, b) => b.score - a.score || b.essay.data.date.valueOf() - a.essay.data.date.valueOf())
  .slice(0, 3);
---
```

2. **Tag archive pages** — `src/pages/tags/[tag].astro`. Only worth doing once you have 3+ posts per tag; a page per tag with one post is thin content. **Deferred by decision (5 Nov 2026):** tags currently feed `BlogPosting.keywords` only (see P1.5), and no tag routes exist. Revisit when at least one tag has 3+ published essays.

3. **Reciprocal links inside prose.** Every essay on AI should link to at least one other essay on AI. `ai-workflow` → `ai-guide` → `experience-with-ai` is a natural triangle; none of those links exist.

4. **Navigation** — add an essays link to the homepage hero. The homepage currently links nowhere except the nav; a single contextual link to `/essays/` from the `<main>` copy would give the archive a homepage-level signal.

**Priority:** P2.

---

### P2.6 — `/essays` is described by lorem ipsum

**Issue:** The essays index still ships placeholder copy.

**Impact:** Medium. It is the page most likely to be a landing page (`/essays` is a natural target for "ezekiel essays", "ezekiel akinfenwa blog"), and it currently reads as an unfinished site to both users and quality raters.

**Evidence:** `dist/essays/index.html` contains `Lorem ipsum dolor sit amet, consectetur adipisicing elit…`

**Fix:** replace with a real 2–3 sentence description naming what you write about and how often, e.g.:

> I write about software engineering, AI tooling and the things I learn building them. Mostly Go, TypeScript and SvelteKit, occasionally about life. New essays appear when I have something worth saying.

Also promote this paragraph into the page `<meta description>`.

**Priority:** P2 — 2-minute fix, do it now.

---

### P2.7 — The homepage and about page never say your full name in a heading

**Issue:** The only `<h1>` on the homepage is the slogan *"I build software that works perfectly and runs seamlessly."* The `<h1>` on `/about` is *"Full Stack Software Engineer & Designer"*. Your full name appears only in body copy ("I'm Ezekiel, Software Developer based in Lagos, Nigeria.") and in the essay `site-seo.md`.

**Impact:** Medium-High. Your primary keyword is your own name — `site-seo.md` documents that searching "Ezekiel Akinfenwa" did not surface the site. Google needs the name in an `<h1>` and in structured data (P1.5) to connect the domain to the entity.

**Fix:**
- Homepage: keep the slogan but make the name an explicit identity statement in the `<main>`, and put the slogan in a `<p class="tagline">` or a visually-styled `<h2>`. Simplest safe version — keep the current `<h1>` as the slogan but change the eyebrow line so the name is in a heading context:

```astro
<main>
  <h1 class="title heading">
    I build software that works <span>perfectly</span> and runs <span>seamlessly.</span>
  </h1>
  <p class="top">Hello, I'm <strong>Ezekiel Akinfenwa</strong>, a software engineer in Lagos.</p>
  <p class="bottom">Currently working on <strong>{meta.currentlyWorkingOn}</strong>.</p>
</main>
```

- About: `<h1>Ezekiel Akinfenwa — Full Stack Software Engineer & Designer</h1>`. Keep the icons, wrap the name in a `<span>`.

**Priority:** P2.

---

### P2.8 — Navigation anchors have no accessible text

**Issue:** `Navbar.astro` puts the visible label as bare text inside `<li>` and lays a separate, empty `<a>` over it:

```astro
<li>
  <Icon name="tabler:pencil-bolt" />Essays
  <a href="/essays"></a>
</li>
```

**Impact:** Medium (SEO + accessibility). The `<a>` has no accessible name, so assistive tech announces "link" with no destination, and the anchor text Google sees for your most important internal link is empty. The visible word "Essays" is not part of any link.

**Fix:** make the label the link text:

```astro
<li>
  <a href="/essays">
    <Icon name="tabler:pencil-bolt" />
    <span>Essays</span>
  </a>
</li>
```

Style `.links li > a` with the flex/padding that currently lives on `li`. Add `aria-label="Home"` to the icon-only home button — it currently has no accessible name either.

**Priority:** P2.

---

## 🟡 P3 — Medium / polish

### P3.1 — Invalid HTML: nested `<p>` on `/ai`

`src/pages/ai.astro` nests `<p class="sub">` inside `<p class="content">`. Browsers auto-close the outer `<p>`, so the DOM is malformed and the "ai-manifesto" paragraph is pulled out of the content block.

```html
<p class="content">… I respect your time and attention.
  <p class="sub">This was written in accordance with …</p>
</p>
```

**Fix:** change the outer element to a `<div class="content">` (keeping the same styles) and leave the inner `<p class="sub">` as a paragraph. Also fix the double period in `"AI generated images on my blogposts and messages.."`.

---

### P3.2 — External hotlinked images with no `alt`

`src/content/essays/5-books.md` hotlinks four images from `th.bing.com`, `tse3.mm.bing.net` and `images-na.ssl-images-amazon.com`, none with `alt`, and the first URL contains two `?o=7rm=3` parameters (a mangled query string). This is currently only reachable via the draft URL (P1.1), but the pattern will spread.

**Fix:** stop hotlinking. Add an `image` field to the content schema, store assets in `src/assets/` (Astro will optimise and emit WebP/AVIF), and always write `alt`:

```ts
// src/content.config.ts
image: z.string().optional(),
```

Never hotlink an image you do not control — it is a broken-image and CWV risk on someone else's CDN schedule.

---

### P3.3 — `font-family` declaration is invalid and silently dropped

`src/styles/app.css`:

```css
body {
    font-family: "Manrope Variable", system-ui, …;   /* ← the ellipsis */
}
```

The `…` makes the whole declaration invalid, so the browser drops it and body text falls back to the default serif. The built CSS confirms it verbatim:

```
body{font-family:Manrope Variable,system-ui,…}
```

The comment in `markdown.css` ("app.css sets font-family on `*`") also no longer matches reality — app.css sets it on `body`. **Fix:**

```css
body {
  font-family: "Manrope Variable", system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}
```

Type rendering is not a ranking factor, but it is a perceived-quality factor on a writing site — and everything below the hero currently renders in the wrong typeface.

---

### P3.4 — Homepage ships ~90 KB of physics JS for a decorative effect

`dist/_astro/FallingPills.astro_astro_type_script_index_0_lang.*.js` is **90,224 bytes** (Matter.js bundled). The component is already careful — it respects `prefers-reduced-motion`, degrades to a static grid, gates interactivity on `pointer: fine`, and marks the layer `aria-hidden="true"`. Good work.

Remaining risks and cheap mitigations:

- **INP:** the `pointerdown` listener clones and measures DOM on every click. Throttle it harder (or drop `interactive` on touch devices entirely, which it already mostly does).
- **Cumulative layout shift:** chips are `position: fixed` inside a masked layer and the hero copy is in normal flow, so there is no reported shift — keep it that way. Do not let the animation layer ever affect document height.
- **Battery/CPU:** `requestAnimationFrame` runs indefinitely. Consider pausing on `document.visibilitychange` and after ~15s of no movement; it matters on mid-range Android, and mobile CWV is measured on exactly those devices.
- **LCP:** the LCP element is the `<h1>` text. It is safe, but only while the mask keeps chips off the copy. Verify LCP in PageSpeed Insights after deploy — a "LCP element was rendered by JS" warning here would mean the mask measurement is racing paint.

Make sure the script stays `type="module"` (it is) so it does not block parsing.

---

### ✅ P3.5 — No 404 page — *FIXED*

`dist/` had no `404.html`, so most static hosts served the platform default — fine for users, but a dead end for a visitor and a soft-404 ambiguity risk.

**Fix:** `src/pages/404.astro`, built in the site's own language: the three digits of 404 rendered as the signature pill chips (tilted, with `map-pin-off` / `ghost` / `compass-off` icons), a one-line explanation, four destination chips that mirror the navbar, a "tell me about the broken link" footnote, and a `history.back()` button that stays hidden unless there is history to go back to.

Verified: `curl /essays/sk/` → **404** status returning this page, `<meta name="robots" content="noindex, follow">` emitted through the `Layout` `head` slot, excluded from the sitemap, and **zero JS bundle** (the only script is a 6-line inline block for the back button).

---

### P3.6 — No RSS/Atom feed and no `feed` discovery link

For a writing site this is a distribution channel and another discovery path for aggregators and AI crawlers. In Astro 7, `@astrojs/rss` + an endpoint at `src/pages/rss.xml.ts` takes about 20 lines, and `<link rel="alternate" type="application/rss+xml" href="/rss.xml">` goes in `Layout.astro`.

---

### P3.7 — `/ai` is a thin page competing for nothing

It is ~120 words. It is genuinely valuable as a trust/E-E-A-T page (an explicit editorial policy is exactly what quality raters look for), but it should not be treated as a content page. Either:

- leave it indexable and add the `<link rel="canonical">` from P1.3 — a short policy page is fine and helps E-E-A-T, or
- keep it indexable but make sure it is **not** in the sitemap's high-priority set (see the sitemap `priority: "0.3"` above).

Do **not** `noindex` it — thin-but-honest policy pages are not a liability, and noindex would remove a trust signal.

---

### P3.8 — `description` and `author` are schema-validated but never surfaced

`src/content.config.ts` requires `author` on every essay, and every essay sets `author: "Ezekiel"`. Consider renaming the field to reference a single author entity (or hardcode it in the layout) so the byline, `BlogPosting.author` and the `Person` node all point at the same `@id`. Right now "Ezekiel" as a plain string has no entity resolution.

---

## Post-launch checklist (the part that cannot be done from code)

The code fixes above make the site *eligible*. These make it *indexed*.

1. **Deploy to production** at the chosen canonical host (P2.3).
2. **Verify** the property in [Google Search Console](https://search.google.com/search-console) — use the **Domain** property (DNS TXT) so it covers `www` and apex together.
3. **Submit the sitemap**: `https://www.ezekielspace.cc/sitemap-index.xml`.
4. **Confirm `robots.txt` is reachable** and contains the sitemap line.
5. **URL Inspection → Request indexing** on `/`, `/essays/`, `/about/` and your three strongest essays. Do not request more than a handful; let the sitemap handle the rest.
6. **Re-validate structured data** with the [Rich Results Test](https://search.google.com/test/rich-results) on one essay and the homepage. Already validated against the official schema.org validator on the local build (0 errors, 0 warnings, all `@id`s resolving), but the Rich Results Test is the only way to confirm what Google itself extracts once the pages are served over HTTPS.
7. **Run [PageSpeed Insights](https://pagespeed.web.dev/)** on `/` and one essay — confirm LCP < 2.5s, INP < 200ms, CLS < 0.1. The 90 KB physics bundle is the thing to watch.
8. **Add [Bing Webmaster Tools](https://www.bing.com/webmasters)** — Bing indexes faster for new domains and now feeds several AI assistants. Submit the same sitemap.
9. **Fill in `src/meta.json`** — `linkedin`, `bluesky` and `youtube` are empty. Social profiles are the strongest `sameAs` signals available to a personal site, and they are what makes the `Person` entity resolve to *you* and not a namesake.
10. **Claim the handles that already exist**: `github.com/ezek-iel` is linked from `/about`, along with a CodePen of the same handle. Make sure every profile links back to `https://www.ezekielspace.cc/` in its website field. A one-way link is worth a fraction of a reciprocal one.
11. **Re-check `site:ezekielspace.cc` in 7–14 days** and compare against Search Console's Pages report. Expect the 14 essays + 4 static pages = 18 URLs indexed (17 pages + no drafts).
12. **Set a 6-month content cadence baseline.** You publish in bursts (three posts in Feb 2026, three in Aug 2026) with multi-month gaps. For topical authority, consistency beats volume; even one post a month compounds.

---

## Prioritised action plan

### 🔴 1. Before launch — blockers (a few hours total)

| # | Task | File | Effort | Status |
| --- | --- | --- | --- | --- |
| 1 | Filter `visible` in `getStaticPaths`, delete `dist/essays/5-books` | `src/pages/essays/[...slug].astro` | 5 min | ✅ **Done** |
| 2 | Rewrite `Layout.astro` head: title template, description, canonical | `src/components/Layout.astro` | 30 min | ✅ **Done** (OG/Twitter/icons remain in P2.2) |
| 3 | Pass real `title` / `description` from all 5 page templates | `src/pages/*.astro` | 30 min | ✅ **Done** |
| 4 | Add `robots.txt` + `public/` directory | `public/robots.txt` | 5 min | ✅ **Done** |
| 5 | Add sitemap integration + `trailingSlash: "always"` | `astro.config.mjs` | 10 min | ✅ **Done** |
| 6 | Add `Person`, `WebSite`, `BlogPosting`, `BreadcrumbList` JSON-LD | `src/lib/schema.ts`, `Layout.astro`, essay template | 45 min | ✅ **Done** |
| 7 | Resolve `www` vs apex, add host-level 301, fix apex link in `site-seo.md` | `_redirects` / `vercel.json` | 15 min | ⬜ Open |
| 8 | Add `public/cv.pdf` (or repoint the nav link) | `public/` | 5 min | ⬜ Open |
| 9 | Replace lorem ipsum on `/essays` | `src/pages/essays.astro` | 2 min | ⬜ Open |
| 10 | Add `404.astro` | `src/pages/404.astro` | 15 min | ✅ **Done** |
| 11 | Add default OG image, favicon, apple-touch-icon | `public/` | 20 min | ⬜ Open |

#### P1 remediation log — 5 November 2026

What was changed and how each fix was verified against a clean `pnpm build`:

| Fix | Implementation | Verification |
| --- | --- | --- |
| Draft leak | `getCollection("essays", ({ data }) => data.visible)` in `getStaticPaths` | 17 → **16 pages** built; `dist/essays/5-books/` absent; `curl /essays/5-books/` → 404 |
| Duplicate metadata | `Layout.astro` head rewritten; `title` / `description` / `path` props passed from all 5 templates; essays use frontmatter `description` with a title fallback | All 16 pages have a unique `<title>` **and** unique `<meta description>` |
| Canonicals | `canonical` computed from `path` (or `Astro.url.pathname`) against `SITE`, normalised to the trailing-slash form | `<link rel="canonical">` present on all 16 pages; set of canonicals **exactly equals** the sitemap's `<loc>` set (`comm -3` → empty) |
| Trailing slash | `trailingSlash: "always"`; internal hrefs in `Navbar`, `about.astro`, `essays.astro` and `moved-to-linux.md` updated to `/path/` | No internal `href` without a trailing slash remains in `dist/` |
| Sitemap | `@astrojs/sitemap` 3.7.4 wired with a `/5-books` filter guard | `dist/sitemap-index.xml` + `dist/sitemap-0.xml`, 16 URLs, all trailing-slashed |
| robots.txt | `public/robots.txt` with `Allow: /`, `/5-books` guard and the sitemap declaration | Copied to `dist/robots.txt`, served 200 |
| Structured data | `src/lib/schema.ts` builds `Person`, `WebSite`, `BlogPosting`, `BreadcrumbList`; `Layout.astro` emits the two site-wide nodes and exposes a `head` slot for per-page nodes; `SITE`/`NAME` hoisted out of `Layout` so there is one source of truth | 16/16 pages carry `Person` + `WebSite`; all 14 essays add `BlogPosting` + `BreadcrumbList`; every block parses as JSON, sits in `<head>`, and every `@id` reference resolves (no dangling `@id`s); **schema.org validator: 0 errors, 0 warnings** |
| 404 page | `src/pages/404.astro` — chip-styled 404, navbar-mirroring destination links, `noindex, follow` via the `Layout` head slot, hidden-until-usable back button | `dist/404.html` emitted; dev server returns **404 status** with this page; absent from `sitemap-0.xml`; no JS bundle |
**Host requirement introduced by `trailingSlash: "always"`:** the route only matches `/path/`, so the deployment must 301 `/path` → `/path/`. Netlify, Vercel and Cloudflare Pages all do this automatically for directory-format output; if you ever move to a host that does not, add the redirect explicitly (see P2.3). Canonicals absorb this either way, but a redirect is cleaner than a duplicate.

### 🟠 2. Launch week — high impact

| # | Task | File | Effort |
| --- | --- | --- | --- |
| 12 | Add byline, date and tags to essay template | `[...slug].astro` | 20 min |
| 13 | Add related-essays block (tag overlap) | `[...slug].astro` | 30 min |
| 14 | Fix nav anchors (`<a>` wraps the label) + `aria-label` on home button | `Navbar.astro` | 15 min |
| 15 | Put full name in `/about` `<h1>`; add identity line to homepage | `about.astro`, `index.astro` | 15 min |
| 16 | Fix nested `<p>` on `/ai`, fix double period | `ai.astro` | 5 min |
| 17 | Fix `font-family` ellipsis bug | `styles/app.css` | 2 min |
| 18 | Add 3–5 in-prose internal links across the AI and software clusters | `src/content/essays/*.md` | 30 min |
| 19 | Fill `linkedin` / `bluesky` / `youtube` in `meta.json` | `src/meta.json` | 2 min |

### 🟡 3. Quick wins (do whenever)

| # | Task | Effort |
| --- | --- | --- |
| 20 | RSS feed + `<link rel="alternate">` | 20 min |
| 21 | Pause the physics loop on `visibilitychange` + idle | 20 min |
| 22 | Add `image` to content schema, self-host essay images with `alt` | 30 min |
| 23 | Tag archive pages (once 3+ posts share a tag) | 1 h |

### 🔵 4. Long-term

- **Per-essay dynamic OG images** generated from the title (satori / `@vercel/og`) — meaningful CTR lift on Bluesky and LinkedIn, where you actually distribute.
- **A dedicated `/uses` or `/projects` page** — "what I run" and "what I built" are both strong personal-site search intents and give the `Person` entity more to be known for.
- **Author a proper "about the author" E-E-A-T block** at the end of every essay with credentials and location, in prose. This is the single highest-leverage non-technical change for a personal blog.
- **Refresh the AI cluster** as the field moves. `ai-guide` is explicitly a living document ("This post will stay updated as AI evolves"). Actually update it and bump `dateModified` in the `BlogPosting` schema — freshness on a cluster hub lifts the whole cluster.
- **Consider whether `/5-books` should ever be published.** It is a draft with hotlinked images and broken query strings. Either finish it properly or delete the file so it cannot leak again.

---

## What is already good — do not break it

- **Clean, keyword-relevant URLs**: `/essays/012-rule/`, `/essays/moved-to-linux/`. Lowercase, hyphen-separated, descriptive, no parameters.
- **One `<h1>` per page**, and the essay `<h1>` already matches the title. Heading hierarchy on `/essays` (h1 → h2 year → h3 title) is correct.
- **`<html lang="en">`**, `<meta charset="utf-8">`, viewport — all correct and in the right order.
- **Fully static output.** 572 KB total `dist/`, no hydration, no framework runtime, no client-side rendering. TTFB will be excellent on any host, and Googlebot needs no JS to see your content.
- **Self-hosted variable fonts** with `font-display: swap` via `@fontsource` — no render-blocking third-party requests, no layout shift from a font CDN.
- **`prefers-reduced-motion` respected** with a genuine static fallback in `FallingPills`, not just a blanket `animation: none`.
- **The decorative layer is `aria-hidden="true"`** — the falling chips are correctly excluded from the accessibility tree and do not pollute the text Google extracts.
- **Frontmatter discipline** is already strong: every essay has `title`, `author`, `date`, `tags` and (mostly) `description`. The content model is sound — you just have to use it.
- **Real, first-hand writing.** 14 essays, 246–892 words, a distinct voice, opinions, footnotes, code, and a stated AI policy. This is the part that is actually hard to fake, and it is the part that will rank once the signals around it are fixed.

---

## Reference: target metadata per page

| Route | Title (≤60 chars) | Description (≤160 chars) |
| --- | --- | --- |
| `/` | Ezekiel Akinfenwa — Software Engineer in Lagos | I build software that works perfectly and runs seamlessly. Go, TypeScript and SvelteKit. Essays on engineering, AI tooling and shipping. |
| `/about/` | About Ezekiel Akinfenwa — Full Stack Engineer & Designer | Full stack software engineer and designer based in Lagos, Nigeria. I build in Go, TypeScript and SvelteKit and care most about user experience. |
| `/essays/` | Essays — Ezekiel Akinfenwa | Essays on software engineering, AI tooling, learning in public and building things for the fun of it. |
| `/essays/{slug}/` | {title} — Ezekiel Akinfenwa | {frontmatter description} |
| `/ai/` | AI Usage Policy — Ezekiel Akinfenwa | How I use AI: research, fact checking and proofreading — never for writing the content on this site. Written in accordance with the AI Manifesto. |

---

*Generated from source inspection and the `dist/` build of 5 November 2026. Re-run `pnpm build` before validating any fix — several findings above only exist in the emitted HTML, not the source.*

*P1.1 – P1.5 implemented and verified on 5 November 2026: 16 pages built, unique title + description + canonical on every route, `sitemap-index.xml` and `robots.txt` emitted, draft essay no longer built, and `Person` / `WebSite` / `BlogPosting` / `BreadcrumbList` JSON-LD on every relevant page (schema.org validator: 0 errors, 0 warnings).*
