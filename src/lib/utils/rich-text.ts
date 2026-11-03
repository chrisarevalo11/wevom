/**
 * Tidies the HTML Shopify's description editor produces so the site can render it in its
 * own type. The editor leaves behind its own class names, inline styles and empty
 * paragraphs; the site's stylesheet is the only thing that should decide fonts and colours,
 * so those are dropped. Text alignment is the one editor choice kept, carried over as a
 * data attribute the stylesheet understands.
 *
 * The HTML is the merchant's own, written in Admin — not visitor input — which is why it is
 * rendered as HTML at all.
 */
export function cleanRichText(html: string): string {
  return (
    html
      // Inline styles would bring the editor's fonts and colours with them
      .replace(/\sstyle="[^"]*"/gi, "")
      // Centre alignment survives as a data attribute; every other class is the editor's own
      .replace(/\sclass="([^"]*)"/gi, (_match, classes: string) =>
        /\balign-center\b/.test(classes) ? ' data-align="center"' : "",
      )
      .replace(/\sdir="ltr"/gi, "")
      // Links the merchant opened in a new tab must not hand the page to that tab
      .replace(
        /<a\b(?![^>]*\brel=)([^>]*target="_blank"[^>]*)>/gi,
        '<a$1 rel="noopener">',
      )
      // Empty spans and paragraphs (the editor leaves "<p> </p>" after the last line)
      .replace(/<span[^>]*>\s*<\/span>/gi, "")
      .replace(/<(b|strong|em|i)>\s*<\/\1>/gi, "")
      .replace(/<p[^>]*>(?:\s|&nbsp;| )*<\/p>/gi, "")
      .trim()
  );
}
