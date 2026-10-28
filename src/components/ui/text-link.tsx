/**
 * The one text-button look in the site: footer body links, the showcase "view all", and the
 * catalog category filter all render with these. Kept here so a change to the type lands in
 * every one of them at once.
 */
export const TEXT_LINK_CLASS =
  "font-sans text-xs uppercase tracking-[0.24em] transition sm:text-sm";
export const TEXT_LINK_INACTIVE = "text-text-muted hover:text-text";
export const TEXT_LINK_ACTIVE = "font-semibold text-text";

/**
 * Width the marker dot occupies. A row of text buttons reserves this on every label so the
 * one dot can travel between them without any of them shifting. Wider than the glyph itself —
 * the surplus is the gap between the dot and the word it marks.
 */
export const MARKER_DOT_SLOT = "inline-block w-[1.7em]";
