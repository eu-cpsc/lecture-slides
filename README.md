# @eu-cpsc/lecture-slides

An [Astro](https://astro.build) integration for course lecture sites. Each
lecture is **one Markdown file** that gives you:

- a **reading view**: scroll through slides with notes, in three layouts
  (stacked, side by side, grid);
- a **presentation**: press <kbd>P</kbd> to present from the slide in view,
  <kbd>Esc</kbd> to return to the same spot;
- a **presenter view**: press <kbd>S</kbd> for a second window with the
  current and next slide, notes, speaker notes and a timer, kept in sync with
  the audience window;
- a **handout**: print the page for slides next to notes.

Code highlighting and math are rendered at build time, so sites work offline.
The default theme follows the Evangel University brand guide.

**Demo:** <https://eu-cpsc.github.io/lecture-slides/> (built from [`starter/`](starter/)).

## Start a course site

1. Copy [`starter/`](starter/) into your course repo (for example as `site/`),
   but not its `.npmrc` or `node_modules`.
2. In its `package.json`, replace `"file:.."` with a released version:

   ```json
   "@eu-cpsc/lecture-slides": "github:eu-cpsc/lecture-slides#v0.1.0"
   ```

   or, once the package is on npm, `"^0.1.0"`.
3. Edit `astro.config.mjs`: course details, and `base` (your repo name, for
   GitHub Pages).
4. Replace the demo lecture in `src/content/lectures/` with your own. Start
   from [`templates/lecture.md`](templates/lecture.md).
5. Add the GitHub Pages workflow below and set **Settings → Pages → Source:
   GitHub Actions**.

```bash
npm install
npm run dev        # drafts are visible here
npm run build      # static site in dist/
```

A course site is just three files plus lectures:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import lectureSlides from '@eu-cpsc/lecture-slides';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://my-org.github.io',
  base: process.env.BASE_PATH ?? '/my-repo',
  trailingSlash: 'always',
  integrations: [
    lectureSlides({
      course: {
        code: 'CPSC 420',
        title: 'Course Title',
        term: 'Spring 2027',
        instructor: 'Instructor Name',
        blurb: 'Lecture slides and notes.',
        links: [{ label: 'Syllabus', href: 'https://...' }],
      },
      brand: 'evangel',              // or 'default'
      logo: 'logo.svg',              // optional, files in public/
      logoOnDark: 'logo-white.svg',  // optional, white version for title slides
      favicon: 'favicon.svg',        // optional
      customCss: ['./src/styles/course.css'], // optional overrides
    }),
  ],
});
```

```ts
// src/content.config.ts
import { lectures } from '@eu-cpsc/lecture-slides/content';
export const collections = { lectures };
```

| Option | Default | |
|---|---|---|
| `course.code` | required | Shown in the header and on every slide |
| `course.title`, `term`, `instructor`, `blurb`, `links` | | Home page and header |
| `brand` | `'evangel'` | Theme: `'evangel'` or `'default'` |
| `logo`, `logoOnDark` | none | Logo files in `public/` |
| `favicon` | built-in icon | File in `public/` |
| `customCss` | `[]` | CSS files loaded after the theme |
| `homePage` | `true` | Set `false` to write your own `src/pages/index.astro` |

### GitHub Pages workflow

For a site in a `site/` folder, put this in `.github/workflows/pages.yml` at
the repo root:

```yaml
name: Deploy lecture site
on:
  push:
    branches: [main]
    paths: ['site/**', '.github/workflows/pages.yml']
  workflow_dispatch:
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: true }
defaults: { run: { working-directory: site } }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm, cache-dependency-path: site/package-lock.json }
      - id: pages
        uses: actions/configure-pages@v5
      - run: npm ci
      - run: npm run build
        env:
          SITE_URL: ${{ steps.pages.outputs.origin }}
          BASE_PATH: ${{ steps.pages.outputs.base_path || '/' }}
      - uses: actions/upload-pages-artifact@v3
        with: { path: site/dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: '${{ steps.deployment.outputs.page_url }}' }
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

## Writing lectures

```md
---
title: Lecture Title
number: 1
date: 2027-01-12
description: One sentence for the lecture list.
draft: true            # visible in `npm run dev` only
# theme: dark          # slide colours: light (default) or dark
# aspect: "4:3"        # 16:9 (default) or 4:3
# unit: "Unit 1"       # optional grouping on the home page
---

## Slide title            <- first heading = title in the slide list

- Regular Markdown: lists, **bold**, `code`, links, tables, images
- Math: $O(n \log n)$ inline, $$...$$ for display

:::notes
Student-facing notes. Shown below/beside the slide when reading,
and in the presenter view.
:::

:::speaker
Notes only you see (presenter view, or press N while reading).
:::

---                       <- a line with only --- starts the next slide
```

| You write | You get |
|---|---|
| `---` | New slide |
| `:::notes` … `:::` | Notes for the slide |
| `:::speaker` … `:::` | Presenter-only notes (hidden, but still in the page source) |
| a `---` section containing only `:::notes` | Notes-only section: in the reading view, skipped when presenting |
| `::slide{.title}` (first line of slide) | Slide layout: `title`, `section`, `center`, `statement`, `dense`, `xdense`, `big-text`, `image`, `no-footer` (combine freely) |
| `:::steps` … `:::` | Items appear one at a time while presenting |
| `:::callout{.step}` | Any block can be a single step |
| `::::columns` + `:::column` … | Columns: each block inside is one column (`.wide-left`, `.wide-right`, `.middle`) |
| `:::callout[Label]` | Callout box (`:::callout[Label]{.warn}` for a warning; label goes before `{…}`) |
| `:::fill` | Fill remaining space (good for a diagram) |
| `:kbd[Ctrl]`, `:mark[text]` | Key cap, highlight |

Nested blocks need **more colons on the outside** (`::::columns` around
`:::column`). Any other `:::name` becomes `<div class="name">`, so a new
building block is a CSS rule in a `customCss` file (`.slide .name { … }`).

Put images in `src/content/lectures/images/` and reference them relatively:
`![alt text](./images/diagram.svg)`. Files starting with `_` are ignored.

The demo lecture, [`starter/src/content/lectures/00-using-these-slides.md`](starter/src/content/lectures/00-using-these-slides.md),
uses every feature.

## Themes

A theme sets a handful of CSS variables; light/dark mode and the dark slide
theme are derived from them ([`src/styles/tokens.css`](src/styles/tokens.css)).
The Evangel theme is [`src/styles/themes/evangel.css`](src/styles/themes/evangel.css).

To adjust colours for one course, override the variables in a `customCss`
file:

```css
:root {
  --brand-primary: #285c69;     /* headings rule, buttons, title slides */
  --brand-primary-2: #55705b;   /* gradient end */
  --brand-secondary: #75243d;   /* subheadings, links */
}
```

The full list of variables is at the top of `tokens.css`. A theme for another
institution is a new file in `src/styles/themes/` scoped to
`:root[data-brand='name']`, imported in `src/components/Base.astro`.

## Package layout

| Path | Purpose |
|---|---|
| `src/index.mjs` | The integration: markdown plugins, routes, config |
| `src/content.mjs` | The `lectures` content collection and frontmatter schema |
| `src/plugins/remark-slides.mjs` | Splits a lecture at `---` into slide + notes sections |
| `src/pages/` | Home page and lecture page (injected routes) |
| `src/components/Base.astro` | Page shell; can be reused by custom pages |
| `src/scripts/deck.ts` | Presenting, steps, scroll tracking, presenter sync, shortcuts |
| `src/styles/` | Tokens, themes, slide styles, site chrome, print |
| `starter/` | Example course site (the demo); also the CI test |

## Releasing

1. Bump `version` in `package.json` (e.g. `0.2.0`) and merge to `main`.
2. The **Publish to npm** workflow builds the starter, stages the version on
   npm, and creates the `v0.2.0` tag and GitHub release.
3. Approve the staged version (2FA) on npmjs.com, or run
   `npm stage list @eu-cpsc/lecture-slides` and
   `npm stage approve <stage-id>`. Until then it isn't installable from npm.
4. Course repos update with `npm install @eu-cpsc/lecture-slides@0.2.0`, or
   `github:eu-cpsc/lecture-slides#v0.2.0` for a GitHub install.

If a run fails before publishing, fix the problem and re-run it from the
Actions tab. A version that already has a tag is skipped.

## License

MIT
