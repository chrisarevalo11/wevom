import { notFound } from "next/navigation";

/**
 * The about page is not ready to ship, so the route is disabled: /about renders the 404
 * instead. To bring it back, drop the notFound() call and restore the markup from git
 * history — the copy is still in messages/*.json under `about`, and the links to it are
 * commented out in menu-overlay.tsx and footer-body-links.tsx.
 */
export default function AboutPage() {
  notFound();
}
