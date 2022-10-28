import {
  createContext,
  useEffect,
  useState,
  useContext,
  ReactNode,
} from "react";

const ViewportContext = createContext(0);

const ViewportProvider = ({ children }: { children?: ReactNode }) => {
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

  return (
    <ViewportContext.Provider value={viewport}>
      {children}
    </ViewportContext.Provider>
  );
};

const useViewport = () => {
  return useContext(ViewportContext);
};

export { ViewportProvider, ViewportContext, useViewport };
