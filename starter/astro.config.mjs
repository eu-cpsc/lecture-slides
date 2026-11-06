// @ts-check
import { defineConfig } from 'astro/config';
import lectureSlides from '@eu-cpsc/lecture-slides';

// For GitHub Pages: https://<owner>.github.io/<repo>/. The Pages workflow sets
// SITE_URL and BASE_PATH automatically; these defaults are for local builds.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://eu-cpsc.github.io',
  base: process.env.BASE_PATH ?? '/lecture-slides',
  trailingSlash: 'always',
  integrations: [
    lectureSlides({
      course: {
        code: 'CPSC 000',
        title: 'Example Course',
        term: 'Demo',
        instructor: 'Evangel University Computer Science',
        blurb: 'An example site built with @eu-cpsc/lecture-slides. Open the lecture to read it, or press P to present.',
        links: [{ label: 'GitHub', href: 'https://github.com/eu-cpsc/lecture-slides' }],
      },
      brand: 'evangel',
      // The 'evangel' theme includes the EU shield logo. To use other files from
      // public/, set logo / logoOnDark; set them to false for no logo.
      favicon: 'favicon.svg',
      // customCss: ['./src/styles/course.css'],
    }),
  ],
});
