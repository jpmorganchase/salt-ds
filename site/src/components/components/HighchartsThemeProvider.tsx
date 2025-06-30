import { type FC, type ReactNode, useEffect } from "react";

import "@salt-ds/highcharts-theme/index.css";
import { highchartsOptionsSalt } from "@salt-ds/highcharts-theme";
import Highcharts from "highcharts";

interface HighchartsThemeProviderProps {
  children: ReactNode;
}

/** This is needed for highcharts theme CSS to be imported */
export const HighchartsThemeProvider: FC<HighchartsThemeProviderProps> = ({
  children,
}) => {
  useEffect(() => {
    Highcharts.setOptions(highchartsOptionsSalt);

    // You could also call setOptions again to override the theme options
    // or you can be chart specific by specifiying and providing options
    // at the individual chart level (which takes precedence over the theme options)
  }, []);

  return <>{children}</>;
};
