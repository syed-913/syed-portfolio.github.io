import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

export const CopyButton = ({ text, label = "Copy code" }: { text: string; label?: string }) => {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setState("copied"); }
    catch { setState("error"); }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2200);
  };
  return <button className={`copy-button ${state === "copied" ? "is-copied" : ""}`} type="button" onClick={copy} aria-label={state === "copied" ? `${label}: copied` : label}>
    {state === "copied" ? <Check size={15} /> : <Copy size={15} />}
    <span aria-live="polite">{state === "copied" ? "Copied" : state === "error" ? "Try again" : label}</span>
  </button>;
};
