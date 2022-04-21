import { useState, useEffect } from "react";

export const useViewport = () => {
  const [viewport, setViewport] = useState(0);

  useEffect(() => {
    const observer = new ResizeObserver(
      (observerEntries: ResizeObserverEntry[]) => {
        setViewport(observerEntries[0].contentRect.width);
      }
    );
    observer.observe(document.body);
    return () => {
      observer.disconnect();
    };
  }, []);

  return viewport;
};
