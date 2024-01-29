import { FC, ReactNode } from "react";

import "ag-grid-community/styles/ag-grid.css";
import "@salt-ds/ag-grid-theme/salt.css";

interface AGThemeProviderProps {
  children: ReactNode;
}

export const AGThemeProvider: FC<AGThemeProviderProps> = ({ children }) => {
  return <>{children}</>;
};
