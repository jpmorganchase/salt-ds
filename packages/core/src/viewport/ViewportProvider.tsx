import { createContext, type ReactNode, useContext, useState } from "react";
import { useIsomorphicLayoutEffect } from "../utils/useIsomorphicLayoutEffect";

const ViewportContext = createContext<number | null>(null);

type ViewportProviderProps = {
  children?: ReactNode;
};

const ViewportProvider = ({ children }: ViewportProviderProps) => {
  // Get value directly from the ViewportContext so we can detect if the value is null (no inherited ViewportProvider)
  const existingViewport = useContext(ViewportContext);
  const [viewport, setViewport] = useState(existingViewport);

  const noExistingViewport = existingViewport === null;
  const viewportValue = existingViewport || viewport || 0;

  useIsomorphicLayoutEffect(() => {
    let observer: ResizeObserver | null = null;

    if (noExistingViewport) {
      observer = new ResizeObserver(
        (observerEntries: ResizeObserverEntry[]) => {
          setViewport(observerEntries[0].contentRect.width);
        },
      );

      observer.observe(document.body);
      setViewport(document.body.getBoundingClientRect().width);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [noExistingViewport]);

  return (
    <ViewportContext.Provider value={viewportValue}>
      {children}
    </ViewportContext.Provider>
  );
};

const useViewport = (): number => {
  const value = useContext(ViewportContext);
  return value === null ? 0 : value;
};

export { ViewportProvider, ViewportContext, useViewport };
