"use client";

import { useEffect } from "react";
import { usePageChromeStore } from "@/stores/page-chrome-store";

/**
 * Renders nothing; keeps the footer off the page while mounted. The 404 uses it because it
 * can render under any path, so the footer cannot decide by pathname as it does for /summary.
 */
export function HideFooter() {
  const setFooterHidden = usePageChromeStore((state) => state.setFooterHidden);

  useEffect(() => {
    setFooterHidden(true);
    return () => setFooterHidden(false);
  }, [setFooterHidden]);

  return null;
}
