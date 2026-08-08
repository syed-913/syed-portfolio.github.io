import { useEffect, useRef } from 'react';

const interactiveSelector = 'a,button,input,textarea,select,[role="button"],[data-cursor="interactive"]';

export const CursorField = () => {
  const follower = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const halo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let tx = innerWidth / 2, ty = innerHeight / 2;
    let fx = tx, fy = ty, hx = tx, hy = ty;
    let raf = 0;
    let interactive = false;

    document.documentElement.classList.add('cursor-field-enabled');

    const move = (event: PointerEvent) => {
      tx = event.clientX;
      ty = event.clientY;
      if (dot.current) dot.current.style.transform = `translate3d(${tx}px,${ty}px,0)`;
      const nextInteractive = Boolean((event.target as Element | null)?.closest?.(interactiveSelector));
      if (nextInteractive !== interactive) {
        interactive = nextInteractive;
        follower.current?.classList.toggle('is-interactive', interactive);
      }
    };

    const leave = () => document.documentElement.classList.add('cursor-field-hidden');
    const enter = () => document.documentElement.classList.remove('cursor-field-hidden');

    const loop = () => {
      // Ring is responsive; halo has a slightly heavier lag so the two still read as one object.
      fx += (tx - fx) * 0.16;
      fy += (ty - fy) * 0.16;
      hx += (tx - hx) * 0.075;
      hy += (ty - hy) * 0.075;
      if (follower.current) follower.current.style.transform = `translate3d(${fx}px,${fy}px,0)`;
      if (halo.current) halo.current.style.transform = `translate3d(${hx}px,${hy}px,0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('mouseleave', leave);
    document.documentElement.addEventListener('mouseenter', enter);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
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
