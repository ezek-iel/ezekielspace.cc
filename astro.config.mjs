// @ts-check
import { defineConfig } from 'astro/config';
import fs from 'node:fs/promises';
import satori from 'satori';
import sharp from 'sharp';
import matter from 'gray-matter';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';

/**
 * Titles are set in Bricolage, which has no pictographs — an emoji would render
 * as a .notdef box, so it is dropped from the card rather than shipped as tofu.
 */
const cardTitle = (title) =>
  (title ?? 'Untitled')
    .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();


const THEMES = [
  { background: "og-cupcake.png", color: "#FC5383" },
  { background: "og-fish.png", color: "#FD7305" },
  { background: "og-rounded-square.png", color: "#43A047" },
  { background: "og-sphere.png", color: "#0162F1" }
]

function pickRandom() {
  return THEMES[Math.floor(Math.random() * THEMES.length)]
}

/**
 * Generate one Open Graph card per published essay, after the build finishes.
 *
 * Paths are resolved from this file's location rather than `process.cwd()`, so
 * the hook behaves the same however the build is invoked.
 */
const ogImages = () => ({
  name: 'og-images',
  hooks: {
    'astro:build:done': async ({ dir, logger }) => {
      const resolve = (p) => new URL(p, import.meta.url);

      // The markdown lives in the content collection, NOT in src/pages/essays —
      // that directory only holds [...slug].astro and would yield zero matches.
      const essaysDir = resolve('./src/content/essays/');
      const outDir = new URL('./og/', dir);

      // satori only parses ttf/otf/woff. Handed woff2 (all that the variable
      // fontsource package ships) it silently draws .notdef boxes instead of
      // throwing, so these must be the static .woff faces.
      const [font700, font400] = await Promise.all([
        fs.readFile(
          resolve('./node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-700-normal.woff'),
        ),
        fs.readFile(
          resolve('./node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-400-normal.woff'),
        ),

      ]);

      const essays = (await fs.readdir(essaysDir)).filter((f) => /\.mdx?$/.test(f));

      if (essays.length === 0) {
        // fail loudly — this is exactly the case that used to pass silently
        throw new Error(`[og-images] No essays found in ${essaysDir.pathname}`);
      }

      await fs.mkdir(outDir, { recursive: true });

      let generated = 0;
      for (const file of essays) {
        const theme = pickRandom()
        const background = await fs.readFile(resolve(`./public/${theme.background}`))

        const backgroundUrl = `data:image/png;base64,${background.toString('base64')}`;
        const { data } = matter(await fs.readFile(new URL(file, essaysDir), 'utf-8'));

        // same rule as getStaticPaths in src/pages/essays/[...slug].astro
        if (data.visible === false) continue;

        const svg = await satori(
          {
            type: 'div',
            props: {
              style: {
                width: '100%',
                height: '100%',
                // satori sizes the box content-box, so without this the root
                // becomes 1200+2*61 wide and 630+2*55 tall and the bottom of the
                // card is clipped
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                background: `url(${backgroundUrl})`,
                backgroundSize: '1200px 630px',
                backgroundRepeat: 'no-repeat',
                color: '#141414',
                fontFamily: 'Bricolage',
                paddingLeft: '40px',
                paddingRight: '40px',
                paddingTop: '55px',
                paddingBottom: '72px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    // the character sits in the right third of the background,
                    // so the copy is capped to the whitespace beside it
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      width: '620px',
                      gap: '10px',
                    },
                    children: [
                      {
                        type: 'h1',
                        props: {
                          style: {
                            fontSize: '84px',
                            fontWeight: 700,
                            lineHeight: 1.05,
                            letterSpacing: '-0.02em',
                            color: theme.color
                          },
                          children: cardTitle(data.title),
                        },
                      },
                      {
                        type: 'h3',
                        props: {
                          style: {
                            fontSize: '42px',
                            fontWeight: 400,
                            lineHeight: 1.2,
                            color: '#52525b',
                          },
                          children: 'by Ezekiel',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            width: 1200,
            height: 630,
            fonts: [
              { name: 'Bricolage', data: font400, weight: 400, style: 'normal' },
              { name: 'Bricolage', data: font700, weight: 700, style: 'normal' },
            ],
          },
        );

        const png = await sharp(Buffer.from(svg)).png().toBuffer();
        await fs.writeFile(new URL(`${file.replace(/\.mdx?$/, '')}.png`, outDir), png);
        generated += 1;
      }

      logger.info(`generated ${generated} OG image(s) in /og/`);
    },
  },
});

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://www.ezekielspace.cc',
  // Canonical URLs end in a slash, which is what `build.format: "directory"` emits.
  // Keeps canonical, internal links and the sitemap on one form.
  trailingSlash: 'always',
  integrations: [
    icon(),
    sitemap({
      // Drafts are already filtered out of `getStaticPaths`; this is a second guard
      // so an unpublished essay can never reach the sitemap.
      filter: (page) => !page.includes("/5-books"),
    }),
    ogImages(),
  ],
});
