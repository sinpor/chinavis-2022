import { MutableRefObject, useEffect, useRef } from 'react';

export function useUpdatePosition<T extends HTMLElement>(eleRef: MutableRefObject<T | null>, x: number, y: number) {
  const timer = useRef<number>();

  useEffect(() => {
    if (!eleRef.current) return;
    const rect = eleRef.current?.getBoundingClientRect();
    const { offsetHeight: h, offsetWidth: w } = document.body;
    if (!rect) return;
    const fh = rect.top + rect.height;
    const fw = rect.left + rect.width;
    clearTimeout(timer.current);
    if (fw > w || fh > h) {
      timer.current = setTimeout(() => {
        if (fw > w) {
          (eleRef.current as HTMLElement).style.left = `${x - rect.width}px`;
        }
        if (fh > h) {
          (eleRef.current as HTMLElement).style.top = `${y - rect.height}px`;
        }
      }, 50);
    }
  }, [x, y]);
}
