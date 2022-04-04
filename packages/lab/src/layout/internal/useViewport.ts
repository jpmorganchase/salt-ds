import { useState, useEffect } from "react";

export enum Viewport {
  EXTRA_SMALL = "xs",
  SMALL = "sm",
  MEDIUM = "md",
  LARGE = "lg",
  EXTRA_LARGE = "xl",
}

const breakpoints = {
  sm: 600,
  md: 960,
  lg: 1280,
  xl: 1920,
};

const getViewport = (
  windowWidth: number,
  breakpoints: { sm: number; md: number; lg: number; xl: number }
) => {
  const { sm, md, lg, xl } = breakpoints;

  if (windowWidth >= xl) {
    return Viewport.EXTRA_LARGE;
  }
  if (windowWidth >= lg) {
    return Viewport.LARGE;
  }
  if (windowWidth >= md) {
    return Viewport.MEDIUM;
  }
  if (windowWidth >= sm) {
    return Viewport.SMALL;
  }

  return Viewport.EXTRA_SMALL;
};

const useViewport = () => {
  const [viewport, setViewport] = useState<Viewport>(() =>
    getViewport(window.innerWidth, breakpoints)
  );

  useEffect(() => {
    const listener = () => {
      setViewport(getViewport(window.innerWidth, breakpoints));
    };
    window.addEventListener("resize", listener);

    return () => window.removeEventListener("resize", listener);
  }, [breakpoints]);

  return viewport;
};

export default useViewport;
