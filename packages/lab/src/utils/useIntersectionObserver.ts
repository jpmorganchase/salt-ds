import { ownerWindow } from "@salt-ds/core";
import { type RefObject, useEffect, useRef } from "react";

export interface UseIntersectionObserverProps {
  ref: RefObject<HTMLElement>;
  onIntersect: (index: number) => void;
  threshold?: number;
  rootMargin?: string;
}

export function useIntersectionObserver({
  ref,
  onIntersect,
  threshold = 0.5,
  rootMargin = "0px",
}: UseIntersectionObserverProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const container = ref?.current;
    if (!container) return;

    const items = Array.from(container.children);
    if (items.length === 0) return;

    const win = ownerWindow(container);

    observerRef.current = new win.IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            requestAnimationFrame(() => {
              const index = items.indexOf(entry.target as HTMLElement);
              if (index !== -1) {
                onIntersect(index);
              }
            });
          }
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    for (const item of items) {
      observerRef.current?.observe(item);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [ref, onIntersect, rootMargin, threshold]);
}
