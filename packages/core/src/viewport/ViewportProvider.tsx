import { useWindow } from "@salt-ds/window";
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
  const targetWindow = useWindow();
  const body = targetWindow?.document.body;
  const ResizeObserverConstructor = (
    targetWindow as (Window & typeof globalThis) | null
  )?.ResizeObserver;

  const noExistingViewport = existingViewport === null;
  const viewportValue = existingViewport || viewport || 0;

  useIsomorphicLayoutEffect(() => {
    if (noExistingViewport && body && ResizeObserverConstructor) {
      const observer = new ResizeObserverConstructor(
        (observerEntries: ResizeObserverEntry[]) => {
          setViewport(observerEntries[0].contentRect.width);
        },
      );

      observer.observe(body);
      setViewport(body.getBoundingClientRect().width);

      return () => {
        observer.disconnect();
      };
    }
  }, [body, noExistingViewport, ResizeObserverConstructor]);

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
