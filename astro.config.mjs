// @ts-check
import { defineConfig } from 'astro/config';
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";

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
  ],
});
