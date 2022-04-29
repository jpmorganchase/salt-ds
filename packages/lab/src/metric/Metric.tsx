import { forwardRef, HTMLAttributes, useMemo } from "react";
import cx from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";

import {
  capitalise,
  MetricContextProvider,
  MetricContextValue,
} from "./internal";
import { useId } from "../utils";

import "./Metric.css";

const withBaseName = makePrefixer("uitkMetric");

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
    emphasis = "medium",
    orientation = "vertical",
    indicatorPosition = "end",
    headingAriaLevel = 2,
    id: idProp,
    ...restProps
  },
  ref
) {
  const id = useId(idProp);
  const titleId = `metric-title-${id}`;
  const subtitleId = `metric-subtitle-${id}`;
  const valueId = `metric-value-${id}`;

  const value = useMemo(
    () => ({
      align,
      emphasis,
      direction,
      orientation,
      showIndicator,
      indicatorPosition,
      titleId,
      subtitleId,
      valueId,
    }),
    [
      align,
      emphasis,
      direction,
      orientation,
      showIndicator,
      indicatorPosition,
      titleId,
      subtitleId,
      valueId,
    ]
  );

  return (
    <MetricContextProvider value={value}>
      <div
        {...restProps}
        className={cx(
          withBaseName(),
          {
            [withBaseName(`direction${capitalise(direction)}`)]: direction,
            [withBaseName(orientation)]: orientation,
            [withBaseName(`emphasis-${emphasis}`)]: emphasis,
          },
          className
        )}
        id={id}
        ref={ref}
      >
        {children}
      </div>
    </MetricContextProvider>
  );
});
