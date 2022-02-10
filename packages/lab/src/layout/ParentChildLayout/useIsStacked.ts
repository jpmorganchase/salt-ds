import { useEffect, useState } from "react";

export const useIsStacked = (stackedAtBreakpoint: number) => {
  const [stackedView, setStackedView] = useState(false);
  useEffect(() => {
    const listener = () => {
      setStackedView(window.innerWidth <= stackedAtBreakpoint);
    };

    window.addEventListener("resize", listener);

    window.dispatchEvent(new Event("resize")); // trigger resize on initial render

    return () => window.removeEventListener("resize", listener);
  }, [stackedAtBreakpoint]);

  return stackedView;
};
