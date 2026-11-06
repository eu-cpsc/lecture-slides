// @ts-check
/**
 * @eu-cpsc/lecture-slides: Astro integration for course lecture sites.
 *
 *   // astro.config.mjs
 *   import lectureSlides from '@eu-cpsc/lecture-slides';
 *   export default defineConfig({
 *     integrations: [lectureSlides({ course: { code: 'CPSC 420', title: '...' } })],
 *   });
 *
 *   // src/content.config.ts
 *   import { lectures } from '@eu-cpsc/lecture-slides/content';
 *   export const collections = { lectures };
 *
 * Lectures go in src/content/lectures/*.md.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import remarkDirective from 'remark-directive';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkSlides from './plugins/remark-slides.mjs';

const PKG = '@eu-cpsc/lecture-slides';
const CONFIG_ID = 'virtual:lecture-slides/config';
const CSS_ID = 'virtual:lecture-slides/custom-css';

/**
 * @typedef {object} CourseOptions
 * @property {string} code            Course code, e.g. "CPSC 420".
 * @property {string} [title]         Course title.
 * @property {string} [term]          e.g. "Spring 2027".
 * @property {string} [instructor]
 * @property {string} [blurb]         Short text on the home page.
 * @property {{ label: string, href: string }[]} [links]  Extra links in the site header.
 */

/**
 * @typedef {object} LectureSlidesOptions
 * @property {CourseOptions} course
 * @property {'evangel' | 'default' | string} [brand]  Theme. Default: 'evangel'.
 * @property {string} [logo]        File in public/ shown on light backgrounds (site header).
 * @property {string} [logoOnDark]  White logo in public/ for title slides and dark mode.
 * @property {string} [favicon]     File in public/. Default: a built-in icon.
 * @property {string[]} [customCss] CSS files (relative to the project root) loaded after the theme.
 * @property {boolean} [homePage]   Add the built-in lecture list at "/". Default: true.
 */

/**
 * @param {LectureSlidesOptions} options
 * @returns {import('astro').AstroIntegration}
 */
export default function lectureSlides(options) {
  if (!options?.course?.code) throw new Error(`${PKG}: options.course.code is required`);
  const config = {
    course: {
      title: '',
      term: '',
      instructor: '',
      blurb: 'Lecture slides and notes. Open any lecture to read it, or press P to present.',
      links: [],
      ...options.course,
    },
    brand: options.brand ?? 'evangel',
    logo: options.logo ?? null,
    logoOnDark: options.logoOnDark ?? null,
    favicon: options.favicon ?? null,
  };

  return {
    name: PKG,
    hooks: {
      'astro:config:setup': ({ config: astroConfig, updateConfig, injectRoute }) => {
        const root = fileURLToPath(astroConfig.root);
        const customCss = (options.customCss ?? []).map((p) => path.resolve(root, p));

        updateConfig({
          markdown: {
            remarkPlugins: [remarkDirective, remarkMath, remarkSlides],
            rehypePlugins: [rehypeKatex],
            shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, wrap: false },
          },
          vite: {
            ssr: { noExternal: [PKG] },
            plugins: [
              {
                name: 'lecture-slides-virtual',
                resolveId(id) {
                  if (id === CONFIG_ID || id === CSS_ID) return '\0' + id;
                },
                load(id) {
                  if (id === '\0' + CONFIG_ID) return `export default ${JSON.stringify(config)};`;
                  if (id === '\0' + CSS_ID) return customCss.map((f) => `import ${JSON.stringify(f)};`).join('\n');
                },
              },
            ],
          },
        });

        if (options.homePage !== false) {
          injectRoute({ pattern: '/', entrypoint: `${PKG}/pages/index.astro` });
        }
        injectRoute({ pattern: '/lectures/[...slug]', entrypoint: `${PKG}/pages/lecture.astro` });
      },
    },
  };
}
