"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
}

export function SearchBar({
  placeholder = "Search orders, tracking…",
  onSearch,
}: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Optional: make ⌘K actually focus the search bar, not just decorative
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-2.5 transition-all duration-150
        ${focused
          ? "border-purple-400 ring-2 ring-purple-500/15"
          : "border-neutral-200 hover:border-neutral-300"
        }`}
    >
      <Search className="h-4 w-4 shrink-0 text-neutral-400" strokeWidth={2} />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => onSearch?.(e.target.value)}
        className="w-full bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none"
      />
      <kbd className="hidden sm:inline-flex shrink-0 items-center rounded-md border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[11px] font-medium text-neutral-400">
        ⌘K
      </kbd>
    </div>
  );
}
