import { createContext, useState, useContext, ReactNode } from "react";
import { useIsomorphicLayoutEffect } from "../utils";

const ViewportContext = createContext<number | null>(null);

export type ViewportProviderProps = {
  children?: ReactNode;
  /*
    Set the default value that will be used on initial render.
    This is mainly intended for use of responsive props in server-side rendering
  */
  defaultViewport?: number;
};

const ViewportProvider = ({
  children,
  defaultViewport,
}: ViewportProviderProps) => {
  // Get value directly from the ViewportContext so we can detect if the value is null (no inherited ViewportProvider)
  const existingViewport = useContext(ViewportContext);
  const [viewport, setViewport] = useState(existingViewport || defaultViewport);

  const noExistingViewport = existingViewport === null;
  const viewportValue = existingViewport || viewport || 0;

  useIsomorphicLayoutEffect(() => {
    let observer: ResizeObserver | null = null;

    if (noExistingViewport) {
      observer = new ResizeObserver(
        (observerEntries: ResizeObserverEntry[]) => {
          setViewport(observerEntries[0].contentRect.width);
        }
      );

      observer.observe(document.body);
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
