import Link from "next/link";
import { LogoWordmark } from "@/components/layout/logo-wordmark";
import { BRAND_NAME, type LOGO_WORDMARK } from "@/config/brand";
import { cn } from "@/lib/utils/cn";

type LogoProps = {
  className?: string;
  variant?: keyof typeof LOGO_WORDMARK;
};

export function Logo({ className, variant = "nav" }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("inline-flex", className)}
      aria-label={`${BRAND_NAME} home`}
    >
      <LogoWordmark variant={variant} />
    </Link>
  );
}
