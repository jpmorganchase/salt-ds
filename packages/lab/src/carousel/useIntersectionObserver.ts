import { ownerWindow } from "@salt-ds/core";
import { type RefObject, useEffect, useRef } from "react";

export interface UseIntersectionObserverProps {
  ref: RefObject<HTMLElement>;
  onIntersect: (isVisible: boolean) => void;
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
    const element = ref.current;
    if (!element) return;
    const win = ownerWindow(element);

    observerRef.current = new win.IntersectionObserver(
      ([entry]) => {
        onIntersect(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin,
      },
    );

    observerRef.current?.observe(element);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [ref, onIntersect, rootMargin, threshold]);
}
