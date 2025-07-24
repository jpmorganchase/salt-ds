import { makePrefixer, useId } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, useMemo } from "react";
import { MetricContextProvider, type MetricContextValue } from "./internal";

import metricCSS from "./Metric.css";

const withBaseName = makePrefixer("saltMetric");

export interface MetricProps
  extends MetricContextValue,
    HTMLAttributes<HTMLDivElement> {
  /**
   * The aria-level attribute to be applied to the heading component. The default is 2.
   *
   * As an ADA requirement, the heading component should be the first valid component inside the Metric. It is the title
   * if <MetricHeader/> is placed before <MerticContent/>. It is the main value if <MerticContent/> is placed before <MetricHeader/>.
   */
  headingAriaLevel?: number;
  /**
   * This prop is used to help implement the accessibility logic.
   * If you don't provide this prop. It falls back to a randomly generated id.
   */
  id?: string;
}

export const Metric = forwardRef<HTMLDivElement, MetricProps>(function Metric(
  {
    className,
    children,
    direction,
    showIndicator,
    align = "left",
    orientation = "vertical",
    indicatorPosition = "end",
    headingAriaLevel = 2,
    id: idProp,
    size = "medium",
    ...restProps
  },
  ref,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-metric",
    css: metricCSS,
    window: targetWindow,
  });

  const id = useId(idProp);
  const titleId = `metric-title-${id}`;
  const subtitleId = `metric-subtitle-${id}`;
  const valueId = `metric-value-${id}`;

  const value = useMemo(
    () => ({
      align,
      direction,
      orientation,
      showIndicator,
      indicatorPosition,
      headingAriaLevel,
      size,
      titleId,
      subtitleId,
      valueId,
    }),
    [
      align,
      direction,
      orientation,
      showIndicator,
      indicatorPosition,
      headingAriaLevel,
      size,
      titleId,
      subtitleId,
      valueId,
    ],
  );

  return (
    <MetricContextProvider value={value}>
      <div
        {...restProps}
        className={clsx(
          withBaseName(),
          withBaseName(`size-${size}`),
          {
            [withBaseName(`direction-${direction}`)]: direction,
            [withBaseName(`orientation-${orientation}`)]: orientation,
            [withBaseName(`align-${align}`)]: align,
          },
          className,
        )}
        id={id}
        ref={ref}
      >
        {children}
      </div>
    </MetricContextProvider>
  );
});
