import React from "react";

import { cn } from "@/lib/utils";

const variants = {
  default: "bg-primary/10 text-primary",
  secondary: "bg-muted text-muted-foreground",
  destructive: "bg-destructive/10 text-destructive",
  outline: "border border-border bg-background",
};

export function Badge({ className, variant = "default", ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variants[variant] ?? variants.default,
        className,
      )}
      {...props}
    />
  );
}
