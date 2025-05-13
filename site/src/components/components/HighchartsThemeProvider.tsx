import type { FC, ReactNode } from "react";

import "highcharts/modules/accessibility";
import "highcharts/modules/pattern-fill";

import "@salt-ds/highcharts-theme/index.css";

interface HighchartsThemeProviderProps {
  children: ReactNode;
}

/** This is needed for highcharts theme CSS to be imported */
export const HighchartsThemeProvider: FC<HighchartsThemeProviderProps> = ({
  children,
}) => {
  return <>{children}</>;
};
