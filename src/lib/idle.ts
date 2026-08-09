type IdleDeadlineLike = { didTimeout: boolean; timeRemaining: () => number };
type IdleWindow = Window & typeof globalThis & {
  requestIdleCallback?: (callback: (deadline: IdleDeadlineLike) => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export const scheduleAfterPaint = (callback: () => void) => {
  let first = 0;
  let second = 0;
  first = window.requestAnimationFrame(() => {
    second = window.requestAnimationFrame(callback);
  });
  return () => {
    window.cancelAnimationFrame(first);
    window.cancelAnimationFrame(second);
  };
};

export const scheduleIdle = (callback: () => void, timeout = 1200) => {
  const idleWindow = window as IdleWindow;
  if (idleWindow.requestIdleCallback) {
    const handle = idleWindow.requestIdleCallback(() => callback(), { timeout });
    return () => idleWindow.cancelIdleCallback?.(handle);
  }
  const handle = window.setTimeout(callback, Math.min(timeout, 180));
  return () => window.clearTimeout(handle);
};
