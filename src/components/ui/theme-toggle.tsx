import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

/** Accessible light/dark switch; system preference remains the initial default. */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      disabled={!mounted}
      aria-label={mounted ? (isDark ? "Passer en mode clair" : "Passer en mode sombre") : "Changer de thème"}
      aria-pressed={isDark}
      title={mounted ? (isDark ? "Mode clair" : "Mode sombre") : "Changer de thème"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-soft transition-colors duration-fast hover:border-primary/30 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60",
        className,
      )}
    >
      {isDark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
    </button>
  );
}
