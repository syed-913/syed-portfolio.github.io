import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
type Theme = "dark" | "light";
const eventName = "portfolio:theme-change";
const snapshot = (): Theme =>
  document.documentElement.dataset.theme === "light" ? "light" : "dark";
const setDocumentTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document
    .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#14181b" : "#f4f1e9");
};
const subscribe = (listener: () => void) => {
  const media = matchMedia("(prefers-color-scheme: light)");
  const system = () => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("portfolio-theme");
    } catch {
      /* use preference */
    }
    if (stored !== "dark" && stored !== "light") {
      setDocumentTheme(media.matches ? "light" : "dark");
      listener();
    }
  };
  const storage = (event: StorageEvent) => {
    if (event.key !== "portfolio-theme" && event.key !== null) return;
    const value = event.newValue;
    setDocumentTheme(
      value === "dark" || value === "light"
        ? value
        : media.matches
          ? "light"
          : "dark",
    );
    listener();
  };
  window.addEventListener(eventName, listener);
  window.addEventListener("storage", storage);
  media.addEventListener("change", system);
  return () => {
    window.removeEventListener(eventName, listener);
    window.removeEventListener("storage", storage);
    media.removeEventListener("change", system);
  };
};
export const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const theme = useSyncExternalStore(
    subscribe,
    snapshot,
    () => "dark" as Theme,
  );
  const next = theme === "dark" ? "light" : "dark";
  const toggle = () => {
    setDocumentTheme(next);
    try {
      localStorage.setItem("portfolio-theme", next);
    } catch {
      /* current theme still works */
    }
    window.dispatchEvent(new Event(eventName));
  };
  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={toggle}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      <Sun size={17} />
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb" />
      </span>
      <Moon size={16} />
    </button>
  );
};
