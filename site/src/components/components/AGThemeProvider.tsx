import type { FC, ReactNode } from "react";

import "ag-grid-community/styles/ag-grid.css";
import "@salt-ds/ag-grid-theme/salt-ag-theme.css";

interface AGThemeProviderProps {
  children: ReactNode;
}

/** This is needed for ag grid theme CSS to be imported */
export const AGThemeProvider: FC<AGThemeProviderProps> = ({ children }) => {
  return <>{children}</>;
};
