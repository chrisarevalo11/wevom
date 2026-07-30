import { LOGO_LETTERS, LOGO_WORDMARK } from "@/config/brand";
import { cn } from "@/lib/utils/cn";

type LogoWordmarkProps = {
  variant?: keyof typeof LOGO_WORDMARK;
  className?: string;
  letterClassName?: string;
  letterRefs?: React.RefObject<HTMLSpanElement | null>[];
};

export function LogoWordmark({
  variant = "nav",
  className,
  letterClassName,
  letterRefs,
}: LogoWordmarkProps) {
  const { fontSize, gap, letterWidth, letterHeight } = LOGO_WORDMARK[variant];

  return (
    <span
      className={cn(
        "font-wordmark inline-flex items-center font-medium tracking-normal text-white",
        className,
      )}
      style={{ gap }}
    >
      {LOGO_LETTERS.map((letter, index) => (
        <span
          key={letter.id}
          ref={letterRefs?.[index]}
          className={cn(
            "inline-flex items-center justify-center will-change-transform leading-none",
            letterClassName,
          )}
          style={{
            width: letterWidth,
            height: letterHeight,
            fontSize,
            lineHeight: 1,
          }}
        >
          <span
            className="inline-block"
            style={{
              transform: "flipX" in letter && letter.flipX ? "scaleX(-1)" : undefined,
              lineHeight: 1,
            }}
          >
            {letter.char}
          </span>
        </span>
      ))}
    </span>
  );
}
