import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export function Switch({ checked, className, onCheckedChange }) {
  return (
    <button
      aria-pressed={checked}
      className={cn(
        "inline-flex h-6 w-11 items-center rounded-full border border-border p-0.5 transition",
        checked ? "bg-primary" : "bg-muted",
        className,
      )}
      onClick={() => onCheckedChange?.(!checked)}
      type="button"
    >
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full bg-white text-primary shadow transition",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      >
        {checked ? <Check className="h-3 w-3" /> : null}
      </span>
    </button>
  );
}
