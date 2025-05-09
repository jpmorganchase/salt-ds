import type { FC, ReactNode } from "react";

import "@salt-ds/react-resizable-panels-theme/index.css";

interface ReactResizablePanelsThemeProviderProps {
  children: ReactNode;
}

/** This is needed for react resizable panels theme CSS to be imported for the site */
export const ReactResizablePanelsThemeProvider: FC<
  ReactResizablePanelsThemeProviderProps
> = ({ children }) => {
  return <>{children}</>;
};
