// @ts-check
/**
 * Render math with KaTeX. Replaces the `rehype-katex` package, which only
 * supports KaTeX 0.16, so the markup comes from the same KaTeX version as the
 * stylesheet imported in Base.astro.
 *
 * remark-math marks math as `<code class="language-math math-inline">` (inline)
 * or `<pre><code class="language-math math-display">` (display); a ```math
 * fenced block is `<pre><code class="language-math">`. Each becomes KaTeX's
 * HTML. Math KaTeX can't parse is rendered with the error shown in red.
 */
import katex from 'katex';
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic';
import { toText } from 'hast-util-to-text';
import { SKIP, visitParents } from 'unist-util-visit-parents';

/** @returns {(tree: import('hast').Root, file: import('vfile').VFile) => void} */
export default function rehypeKatex() {
  return (tree, file) => {
    visitParents(tree, 'element', (element, parents) => {
      const classes = Array.isArray(element.properties.className) ? element.properties.className : [];
      const languageMath = classes.includes('language-math');
      if (!languageMath && !classes.includes('math-inline') && !classes.includes('math-display')) return;

      let scope = /** @type {import('hast').Element} */ (element);
      let parent = parents[parents.length - 1];
      let displayMode = classes.includes('math-display');
      // Display math is <pre><code>; replace the <pre>.
      if (languageMath && element.tagName === 'code' && parent?.type === 'element' && parent.tagName === 'pre') {
        scope = parent;
        parent = parents[parents.length - 2];
        displayMode = true;
      }
      if (!parent) return;

      const tex = toText(scope, { whitespace: 'pre' });
      let html;
      try {
        html = katex.renderToString(tex, { displayMode, throwOnError: true });
      } catch (error) {
        file.message('Could not render math with KaTeX', {
          ancestors: [...parents, element],
          cause: error,
          place: element.position,
          source: 'lecture-slides',
        });
        html = katex.renderToString(tex, { displayMode, throwOnError: false, strict: 'ignore' });
      }

      const index = parent.children.indexOf(scope);
      parent.children.splice(index, 1, ...fromHtmlIsomorphic(html, { fragment: true }).children);
      return SKIP;
    });
  };
}
