import { highchartsOptionsSalt } from "@salt-ds/highcharts-theme";
import Highcharts from "highcharts";
import { type FC, type ReactNode, useEffect } from "react";

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
