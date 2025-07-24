import { type FC, type ReactNode, useEffect } from "react";

import "@salt-ds/highcharts-theme/index.css";
import { highchartsOptionsSalt } from "@salt-ds/highcharts-theme";
import Highcharts from "highcharts";

interface HighchartsThemeProviderProps {
  children: ReactNode;
}

export const HighchartsThemeProvider: FC<HighchartsThemeProviderProps> = ({
  children,
}) => {
  useEffect(() => {
    Highcharts.setOptions(highchartsOptionsSalt);
  }, []);

  return <>{children}</>;
};
