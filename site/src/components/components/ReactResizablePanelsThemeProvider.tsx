import type { FC, ReactNode } from "react";

import themeCSS from "@salt-ds/react-resizable-panels-theme/index.css";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";

interface ReactResizablePanelsThemeProviderProps {
  children: ReactNode;
}

/** This is needed for react resizable panels theme CSS to be imported */
export const ReactResizablePanelsThemeProvider: FC<
  ReactResizablePanelsThemeProviderProps
> = ({ children }) => {
  const targetWindow = useWindow();

  useComponentCssInjection({
    testId: "react-resizable-panels-theme",
    css: themeCSS,
    window: targetWindow,
  });

  return <>{children}</>;
};
