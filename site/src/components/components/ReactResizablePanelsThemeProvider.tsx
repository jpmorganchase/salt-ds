import type { FC, ReactNode } from "react";

import "@salt-ds/react-resizable-panels-theme/salt-react-resizable-panels-theme.css";

interface ReactResizablePanelsThemeProviderProps {
  children: ReactNode;
}

/** This is needed for react resizable panels theme CSS to be imported */
export const ReactResizablePanelsThemeProvider: FC<ReactResizablePanelsThemeProviderProps> = ({ children }) => {
  return <>{children}</>;
};
