import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/format-price";

type PriceProps = {
  amount: string;
  currencyCode: string;
  className?: string;
};

export function Price({ amount, currencyCode, className }: PriceProps) {
  return (
    <span className={cn("font-medium tabular-nums", className)}>
      {formatPrice(amount, currencyCode)}
    </span>
  );
}
