// @ts-check
import { defineConfig } from 'astro/config';
// @ts-ignore
import path from "node:path";
// @ts-ignore
import fs from "node:fs/promises";
import satori from "satori"
import sharp from "sharp"
import matter from "gray-matter"
import { pathToFileURL } from 'url';
import { fileURLToPath } from "node:url";

// https://astro.build/config
export default defineConfig({
  integrations: [
    {
      name: 'og-image-generator',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          const postsDir = path.resolve('./src/pages/essays');
          const files = await fs.readdir(postsDir);

          // 1. Load a font (Satori requires an ArrayBuffer font)
          const fontData = await fs.readFile('./node_modules/@fontsource/gloria-hallelujah/files/gloria-hallelujah-latin-400-normal.woff');
          // Load background image as base64 to avoid URL issues
          const bgBuffer = await fs.readFile(path.resolve('./public/og.png'));
          const bgBase64 = `data:image/png;base64,${bgBuffer.toString('base64')}`;

          for (const file of files) {
            if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;

            // 2. Parse Markdown frontmatter
            const filePath = path.join(postsDir, file);
            const source = await fs.readFile(filePath, 'utf-8');
            const { data } = matter(source);
            const title = data.title || 'Untitled';
            const slug = file.replace(/\.(md|mdx)$/, '');

            // 3. Generate SVG with Satori
            const svg = await satori(
              {
                type: 'div',
                props: {
                  style: {
                    background: `url(${bgBase64})`,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    justifyContent: 'flex-end',
                    color: 'black',
                    paddingLeft: '61px',
                    paddingRight: '61px',
                    paddingTop: '55px',
                    paddingBottom: '55px'
                  },
                  children: [
                    {
                      type: 'h1',
                      props: {
                        style: { fontSize: '72px', fontWeight: 'bold' },
                        children: title,
                      },
                    },
                    {
                      type: 'h3',
                      props: {
                        style: {fontSize: '51px', fontWeight: 'bold'},
                        children: "by Ezekiel"
                      }
                    }
                  ],
                },
              },
              {
                width: 1200,
                height: 630,
                fonts: [{ name: 'Inter', data: fontData, weight: 700 }],
              }
            );

            // 4. Convert SVG to PNG using Sharp
            // @ts-ignore
            const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();

            // 5. Write to the dist folder (Astro's build output)
            const resultDirectory = path.join(fileURLToPath(dir), 'og-bg')
            const outputPath = path.join(resultDirectory, `${slug}.png`);
            await fs.mkdir(path.dirname(outputPath), { recursive: true });
            await fs.writeFile(outputPath, pngBuffer);

            console.log(`✅ Generated OG image: /og/${slug}.png`);
          }
        },
      },
    },
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark-default'
    }
  }
});
