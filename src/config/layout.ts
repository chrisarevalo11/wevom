/**
 * Vertical resting place of the language switch: just under the model's feet, clear of the
 * bottom edge. Shared so the hero and the menu put it at the same height.
 *
 * Lives in a plain module on purpose. It used to sit in locale-switch.tsx, but that file is
 * a "use client" module — importing a constant from one into a Server Component yields a
 * client reference object rather than the string, which silently produced a className with
 * no positioning in it.
 */
export const LOCALE_SWITCH_TOP = "top-[88dvh]";
