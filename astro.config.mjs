// @ts-check
import { defineConfig } from 'astro/config';
import icon from "astro-icon";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://www.ezekielspace.cc',
  integrations: [icon()]
});
