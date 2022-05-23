import { createContext, useContext } from "react";

export interface MetricContextValue {
  /**
   * Text and value alignment.
   */
  align?: "left" | "center" | "right";
  /**
   * The direction of the main value
   */
  direction?: "up" | "down";
  /**
   * The position of the indicator with regards to the main value.
   */
  indicatorPosition?: "start" | "end";
  /**
   * The metric orientation (layout flow direction).
   */
  orientation?: "horizontal" | "vertical";
  /**
   * If 'true', an indicator will be displayed which shows the direction of the main value
   */
  showIndicator?: boolean;
  headingAriaLevel?: number;
}

export interface MetricContextComponentIds {
  /**
   * id of the subtitle
   */
  subtitleId?: string;
  /**
   * id of the title
   */
  titleId?: string;
  /**
   * id of the value
   */
  valueId?: string;
}

const MetricContext = createContext<
  MetricContextValue & MetricContextComponentIds
>({});

export const { Provider: MetricContextProvider } = MetricContext;
export const useMetricContext = (): MetricContextValue &
  MetricContextComponentIds => useContext(MetricContext);
