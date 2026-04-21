import React, { createContext, useContext, useMemo } from "react";

import { cn } from "@/lib/utils";

const SelectContext = createContext({
  value: "",
  onValueChange: () => {},
  options: [],
  placeholder: "",
});

function extractText(node) {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractText).join("");
  }

  if (React.isValidElement(node)) {
    return extractText(node.props.children);
  }

  return "";
}

export function Select({ value, onValueChange, children }) {
  const model = useMemo(() => {
    const options = [];
    let placeholder = "";

    const visit = (node) => {
      React.Children.forEach(node, (child) => {
        if (!React.isValidElement(child)) {
          return;
        }

        if (child.type === SelectItem) {
          options.push({ value: child.props.value, label: extractText(child.props.children) });
        }

        if (child.type === SelectValue && child.props.placeholder) {
          placeholder = child.props.placeholder;
        }

        if (child.props?.children) {
          visit(child.props.children);
        }
      });
    };

    visit(children);
    return { options, placeholder };
  }, [children]);

  return (
    <SelectContext.Provider value={{ value, onValueChange, options: model.options, placeholder: model.placeholder }}>
      {children}
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className }) {
  const { value, onValueChange, options, placeholder } = useContext(SelectContext);

  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-ring",
        className,
      )}
      onChange={(event) => onValueChange?.(event.target.value)}
      value={value ?? ""}
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function SelectValue() {
  return null;
}

export function SelectContent() {
  return null;
}

export function SelectItem() {
  return null;
}
