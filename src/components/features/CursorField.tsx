import { useEffect, useRef } from "react";
const interactiveSelector =
  'a,button,input,textarea,select,[role="button"],[data-cursor="interactive"]';
export const CursorField = () => {
  const follower = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fine = matchMedia("(pointer: fine)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let targetX = 0,
      targetY = 0,
      ringX = 0,
      ringY = 0,
      raf = 0,
      started = false;
    const enabled = () => fine.matches && !reduce.matches;
    const loop = () => {
      ringX += (targetX - ringX) * 0.16;
      ringY += (targetY - ringY) * 0.16;
      if (follower.current)
        follower.current.style.transform = `translate3d(${ringX}px,${ringY}px,0)`;
      if (Math.abs(targetX - ringX) + Math.abs(targetY - ringY) > 0.1)
        raf = requestAnimationFrame(loop);
      else raf = 0;
    };
    const move = (event: PointerEvent) => {
      if (!enabled()) return;
      targetX = event.clientX;
      targetY = event.clientY;
      if (!started) {
        ringX = targetX;
        ringY = targetY;
        started = true;
      }
      document.documentElement.classList.add("cursor-field-enabled");
      document.documentElement.classList.remove("cursor-field-hidden");
      if (dot.current)
        dot.current.style.transform = `translate3d(${targetX}px,${targetY}px,0)`;
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const over = (event: PointerEvent) =>
      follower.current?.classList.toggle(
        "is-interactive",
        Boolean(
          (event.target as Element | null)?.closest?.(interactiveSelector),
        ),
      );
    const hide = () => {
      document.documentElement.classList.add("cursor-field-hidden");
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const preference = () => {
      if (!enabled()) {
        hide();
        document.documentElement.classList.remove("cursor-field-enabled");
      }
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("blur", hide);
    document.documentElement.addEventListener("mouseleave", hide);
    document.addEventListener("visibilitychange", hide);
    fine.addEventListener("change", preference);
    reduce.addEventListener("change", preference);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("blur", hide);
      document.documentElement.removeEventListener("mouseleave", hide);
      document.removeEventListener("visibilitychange", hide);
      fine.removeEventListener("change", preference);
      reduce.removeEventListener("change", preference);
      document.documentElement.classList.remove(
        "cursor-field-enabled",
        "cursor-field-hidden",
      );
    };
  }, []);
  return (
    <div className="cursor-field" aria-hidden="true">
      <div ref={follower} className="cursor-follower">
        <span className="cursor-ring" />
      </div>
      <div ref={dot} className="cursor-dot" />
    </div>
  );
};
