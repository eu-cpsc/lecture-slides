import type { AstroIntegration } from 'astro';

export interface CourseOptions {
  /** Course code, e.g. "CPSC 420". Shown in the header and on every slide. */
  code: string;
  title?: string;
  /** e.g. "Spring 2027" */
  term?: string;
  instructor?: string;
  /** Short text on the home page. */
  blurb?: string;
  /** Extra links in the site header. */
  links?: { label: string; href: string }[];
}

export interface LectureSlidesOptions {
  course: CourseOptions;
  /** Theme. Default: 'evangel'. */
  brand?: 'evangel' | 'default' | (string & {});
  /**
   * Logo file in public/ for light backgrounds (site header). Defaults to the
   * theme's logo (the EU shield for 'evangel'); `false` for none.
   */
  logo?: string | false;
  /** White logo in public/ for title slides and dark mode. Defaults to the theme's; `false` for none. */
  logoOnDark?: string | false;
  /** Favicon file in public/. Default: a built-in icon. */
  favicon?: string;
  /** CSS files (relative to the project root) loaded after the theme. */
  customCss?: string[];
  /** Add the built-in lecture list at "/". Default: true. */
  homePage?: boolean;
}

export default function lectureSlides(options: LectureSlidesOptions): AstroIntegration;
