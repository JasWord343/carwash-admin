import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export function Checkbox({ checked, className, onCheckedChange }) {
  return (
    <button
      aria-pressed={checked}
      className={cn(
        "flex h-5 w-5 items-center justify-center rounded border border-input transition",
        checked ? "bg-primary text-primary-foreground" : "bg-background",
        className,
      )}
      onClick={() => onCheckedChange?.(!checked)}
      type="button"
    >
      {checked ? <Check className="h-3.5 w-3.5" /> : null}
    </button>
  );
}
