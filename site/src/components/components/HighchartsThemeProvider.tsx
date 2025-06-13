import { useEffect, type FC, type ReactNode } from "react";

import "@salt-ds/highcharts-theme/index.css";
import { saltHCThemeOptions } from "@salt-ds/highcharts-theme";
import Highcharts from "highcharts";


/*
 If we try import below, we'll get a crash because the Highcharts 
 add-on files (modules/accessibility, modules/pattern-fill etc.) 
 were imported and executed at the top level of your Theme Provider;
 during Next.js’ server-side rendering phase those modules run in 
 a Node environment that has no window/document, so they throw an error
 “Cannot read properties of undefined (reading 'Core/Globals.js')”; 
 moving the add-on initialisation into a useEffect 
 (or otherwise gating it behind typeof window !== "undefined" or ssr:false) 
 ensures it only runs in the browser after hydration, 
 eliminating the error while still applying the modules globally.
*/


// import accessibility from "highcharts/modules/accessibility";
// import patternFill from "highcharts/modules/pattern-fill";

// accessibility(Highcharts);
// patternFill(Highcharts);

interface HighchartsThemeProviderProps {
  children: ReactNode;
}

/** This is needed for highcharts theme CSS to be imported */
export const HighchartsThemeProvider: FC<HighchartsThemeProviderProps> = ({
  children,
}) => {
  useEffect(() => {
    console.log("triggerd effect");
    Highcharts.setOptions(saltHCThemeOptions as unknown as Highcharts.Options);
    // You could also call setOptions again to override the theme options
    // or you can be chart specific by specifiying and providing options
    // at the individual chart level (which takes precedence over the theme options)
  }, []);

  return <>{children}</>;
};
