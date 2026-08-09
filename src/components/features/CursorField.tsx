import { useEffect, useRef } from 'react';

const interactiveSelector = 'a,button,input,textarea,select,[role="button"],[data-cursor="interactive"]';

export const CursorField = () => {
  const follower = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let targetX = innerWidth / 2;
    let targetY = innerHeight / 2;
    let ringX = targetX;
    let ringY = targetY;
    let haloX = targetX;
    let haloY = targetY;
    let raf = 0;
    let interactive = false;

    document.documentElement.classList.add('cursor-field-enabled');

    const move = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      if (dot.current) dot.current.style.transform = `translate3d(${targetX}px,${targetY}px,0)`;
    };

    // Interaction state changes on element boundaries, not on every pointer frame.
    const over = (event: PointerEvent) => {
      const next = Boolean((event.target as Element | null)?.closest?.(interactiveSelector));
      if (next === interactive) return;
      interactive = next;
      follower.current?.classList.toggle('is-interactive', interactive);
    };

    const leave = () => document.documentElement.classList.add('cursor-field-hidden');
    const enter = () => document.documentElement.classList.remove('cursor-field-hidden');

    const loop = () => {
      ringX += (targetX - ringX) * 0.16;
      ringY += (targetY - ringY) * 0.16;
      haloX += (targetX - haloX) * 0.075;
      haloY += (targetY - haloY) * 0.075;
      if (follower.current) follower.current.style.transform = `translate3d(${ringX}px,${ringY}px,0)`;
      if (halo.current) halo.current.style.transform = `translate3d(${haloX}px,${haloY}px,0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over, { passive: true });
    document.documentElement.addEventListener('mouseleave', leave);
    document.documentElement.addEventListener('mouseenter', enter);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
      document.documentElement.removeEventListener('mouseleave', leave);
      document.documentElement.removeEventListener('mouseenter', enter);
      document.documentElement.classList.remove('cursor-field-enabled', 'cursor-field-hidden');
    };
  }, []);

  return (
    <div className="cursor-field" aria-hidden="true">
      <div ref={halo} className="cursor-halo" />
      <div ref={follower} className="cursor-follower"><span className="cursor-ring" /></div>
      <div ref={dot} className="cursor-dot" />
    </div>
  );
};
