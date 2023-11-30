import { FC, ReactNode } from "react";

import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import "@salt-ds/ag-grid-theme/css/salt-ag-theme.scss";

interface AGThemeProviderProps {
  children: ReactNode;
}

export const AGThemeProvider: FC<AGThemeProviderProps> = ({ children }) => {
  return <>{children}</>;
};
