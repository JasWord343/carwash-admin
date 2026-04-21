import React, { createContext, useContext } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const DialogContext = createContext({ open: false, onOpenChange: () => {} });

export function Dialog({ open, onOpenChange, children }) {
  return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>;
}

export function DialogContent({ className, children }) {
  const { open, onOpenChange } = useContext(DialogContext);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      onClick={() => onOpenChange?.(false)}
    >
      <div
        className={cn("relative w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-xl", className)}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          onClick={() => onOpenChange?.(false)}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn("mb-5 space-y-1", className)} {...props} />;
}

export function DialogTitle({ className, ...props }) {
  return <h2 className={cn("text-xl font-semibold tracking-tight", className)} {...props} />;
}
