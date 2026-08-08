import { useEffect, useRef } from 'react';

export const CursorField = () => {
  const follower = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let tx=innerWidth/2, ty=innerHeight/2, x=tx, y=ty, raf=0;
    const move=(e:PointerEvent)=>{tx=e.clientX;ty=e.clientY;document.documentElement.style.setProperty('--pointer-x',`${tx}px`);document.documentElement.style.setProperty('--pointer-y',`${ty}px`);if(dot.current)dot.current.style.transform=`translate3d(${tx}px,${ty}px,0)`;};
    const hover=(e:PointerEvent)=>{const el=e.target as Element|null;follower.current?.classList.toggle('is-interactive',Boolean(el?.closest('a,button,input,textarea,select,[data-cursor="interactive"]')));};
    const tick=()=>{x+=(tx-x)*.115;y+=(ty-y)*.115;if(follower.current)follower.current.style.transform=`translate3d(${x}px,${y}px,0)`;document.documentElement.style.setProperty('--pointer-lag-x',`${x}px`);document.documentElement.style.setProperty('--pointer-lag-y',`${y}px`);raf=requestAnimationFrame(tick);};
    addEventListener('pointermove',move,{passive:true});addEventListener('pointerover',hover,{passive:true});document.documentElement.classList.add('cursor-field-enabled');raf=requestAnimationFrame(tick);
    return()=>{removeEventListener('pointermove',move);removeEventListener('pointerover',hover);cancelAnimationFrame(raf);document.documentElement.classList.remove('cursor-field-enabled');};
  },[]);
  return <div className="cursor-field" aria-hidden="true"><div ref={follower} className="cursor-follower"/><div ref={dot} className="cursor-dot"/></div>;
};
