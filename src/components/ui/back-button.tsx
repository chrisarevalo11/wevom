"use client";

import { useRouter } from "next/navigation";

/**
 * Goes back one step in history. When there is nowhere to go back to (the 404 was the first
 * page opened, say from a shared link) it falls back to the home page instead of doing nothing.
 */
export function BackButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push("/");
      }}
    >
      {children}
    </button>
  );
}
