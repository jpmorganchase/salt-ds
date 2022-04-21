import {
  forwardRef,
  HTMLAttributes,
  useMemo,
  Children,
  cloneElement,
} from "react";
import cx from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { MetricHeader } from "./MetricHeader";
import { MetricContent } from "./MetricContent";

import {
  capitalise,
  MetricContextProvider,
  MetricContextValue,
} from "./internal";
import { useId } from "../utils";

import "./Metric.css";

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

const isMetricChild = (child: any) =>
  child.type === MetricHeader || child.type === MetricContent;

const withBaseName = makePrefixer("uitkMetric");

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

  let isHeadingApplied = false;

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

  const getHeadingAriaProps = (child: any) => ({
    role: "heading",
    "aria-level": headingAriaLevel,
    // FIXME: content should be labelledby header, not header labelledby content
    "aria-labelledby": (child.type === MetricHeader
      ? [titleId, valueId]
      : [valueId, titleId]
    ).join(" "),
  });

  return (
    <MetricContextProvider value={value}>
      <div
        {...restProps}
        className={cx(
          withBaseName(),
          {
            [withBaseName(`direction${capitalise(direction)}`)]: direction,
            [withBaseName(orientation)]: orientation,
          },
          className
        )}
        id={id}
        ref={ref}
      >
        {Children.toArray(children).map((child) => {
          // As a part of the ADA requirement, we need to add heading role to the first valid child component for metric
          // FIXME: There are fundamental flaws about this approach
          // - `aria-labelledby` problem above
          // - What if `headingAriaProps` is actually passed by the user, with custom ids
          // - What is really the benefit letting the user to pass in 2 different kinds of children,
          //   where really only one each makes sense, so value/subvalue/title/subtitle can drive the main component
          // Keeping current approach to support Demo Sep 2021
          if (!isHeadingApplied && isMetricChild(child)) {
            isHeadingApplied = true;

            return cloneElement(child as any, {
              headingAriaProps: getHeadingAriaProps(child),
            });
          }
          return child;
        })}
      </div>
    </MetricContextProvider>
  );
});
