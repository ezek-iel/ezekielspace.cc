// @ts-check
import { defineConfig } from 'astro/config';
import fs from 'node:fs/promises';
import satori from 'satori';
import sharp from 'sharp';
import matter from 'gray-matter';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';
import { formatDay } from './src/lib/funcs.ts';

const ogImages = () => ({
  name: 'og-images',
  hooks: {
    'astro:build:done': async ({ dir, logger }) => {
      const resolve = (p) => new URL(p, import.meta.url);

      const essaysDir = resolve('./src/content/essays/');
      const outDir = new URL('./og/', dir);

      // 1. Load ONE font weight. 
      // MUST be .woff, satori silently fails on .woff2
      const font = await fs.readFile(
        resolve('./node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-700-normal.woff')
      );

      // 2. Load your SINGLE background image (Put this in your public folder)
      // Base64 encode it so satori can use it immediately
      const bgBuffer = await fs.readFile(resolve('./public/og-bg.png'));
      const bgUrl = `data:image/png;base64,${bgBuffer.toString('base64')}`;

      const essays = (await fs.readdir(essaysDir)).filter((f) => /\.mdx?$/.test(f));
      await fs.mkdir(outDir, { recursive: true });

      for (const file of essays) {
        const { data } = matter(await fs.readFile(new URL(file, essaysDir), 'utf-8'));

        // Skip hidden essays
        if (data.visible === false) continue;

        // 3. The simplest possible layout
        const svg = await satori(
          {
            type: 'div',
            props: {
              style: {
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end', // Align to top
                alignItems: 'flex-start',     // Align to left
                padding: '80px',
                boxSizing: 'border-box',      // Crucial: keeps padding inside the 1200x630 bounds
                background: `url(${bgUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: '#000',
                fontFamily: 'Bricolage',
              },
              children: [
                {
                  type: 'h1',
                  props: {
                    style: {
                      fontSize: '80px',
                      fontWeight: 700,
                      lineHeight: 1.1,
                      margin: 0,
                    },
                    children: data.title || 'Untitled',
                  },
                },
                {
                  type: 'h3',
                  props: {
                    style: {
                      fontSize: '40px',
                      fontWeight: 400, // Change to 700 if you only load the bold font
                      marginTop: '20px',
                      marginBottom: 0,
                      color: '#52525b', // Slightly lighter gray
                    },
                    children: 'by Ezekiel',
                  },
                },
                {
                  type: 'h5',
                  props: {
                    style: {
                      fontSize: '24px',
                      fontWeight: 400,
                      marginTop: '10px',
                      marginBottom: 0,
                      color: '#a1a1aa', // Even lighter gray for the date
                    },
                    children: formatDay(new Date(data.date)) || '', // Assuming 'date' is in your frontmatter
                  },
                },
              ],
            },
          },
          {
            width: 1200,
            height: 630,
            fonts: [
              { name: 'Bricolage', data: font, weight: 700, style: 'normal' }
            ],
          }
        );

        logger.info(`✅ Generated image for ${data.title}`)

        const png = await sharp(Buffer.from(svg)).png().toBuffer();
        await fs.writeFile(new URL(`${file.replace(/\.mdx?$/, '')}.png`, outDir), png);
      }

      logger.info(`Generated OG images in /og/`);
    },
  },
});

export default defineConfig({
  site: 'https://www.ezekielspace.cc',
  trailingSlash: 'always',
  integrations: [
    icon(),
    sitemap(),
    ogImages(),
  ],
});