import { forwardRef, HTMLAttributes } from "react";
import cx from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import warning from "warning";

import { useMetricContext, capitalise } from "./internal";
import { Link, LinkProps } from "../link";

import "./MetricHeader.css";

export interface MetricHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * If provided, subtitle will be rendered as a `Link` element with these props.
   *
   * @see `Link` for a list of valid props.
   */
  SubtitleLinkProps?: Partial<LinkProps>;
  /**
   * @ignore - this is passed from the parent <Metric/> component
   *
   * The ARIA props to be applied to the title if the component is considered as a `heading`,
   * i.e. it is the first component inside the metric.
   */
  headingAriaProps?: {
    role: string;
    "aria-level": number;
    "aria-labelledby": string;
  };
  /**
   * Subtitle of the Metric Header
   */
  subtitle?: string;
  /**
   * Title of the Metric Header
   */
  title: string;
}

const withBaseName = makePrefixer("uitkMetricHeader");

export const MetricHeader = forwardRef<HTMLDivElement, MetricHeaderProps>(
  function MetricHeader(
    {
      SubtitleLinkProps,
      className,
      title,
      subtitle,
      headingAriaProps,
      ...restProps
    },
    ref
  ) {
    const { align, titleId, subtitleId, direction, orientation } =
      useMetricContext();

    const renderSubtitle = (props: {
      id?: string;
      className?: string;
      "data-testid": string;
    }) => {
      if (SubtitleLinkProps) {
        const { children, href = "", ...restLinkProps } = SubtitleLinkProps;

        if (process.env.NODE_ENV !== "production") {
          warning(
            children === undefined,
            `'children' in 'SubtitleLinkProps' is ignored. ${subtitle} is used instead.`
          );
        }

        return (
          <Link
            href={href}
            {...props}
            {...restLinkProps}
            aria-labelledby={[titleId, subtitleId].join(" ")}
          >
            {subtitle}
          </Link>
        );
      }
      return <div {...props}>{subtitle}</div>;
    };

    return (
      <div
        {...restProps}
        className={cx(
          withBaseName(),
          {
            [withBaseName(orientation as string)]: orientation,
            [withBaseName(`align${capitalise(align)}`)]: align,
            [withBaseName(`direction${capitalise(direction)}`)]: direction,
          },
          className
        )}
        ref={ref}
      >
        <div
          className={withBaseName("title")}
          data-testid="metric-title"
          id={titleId}
          {...headingAriaProps}
        >
          {title}
        </div>
        {subtitle &&
          renderSubtitle({
            id: subtitleId,
            className: withBaseName("subtitle"),
            "data-testid": "metric-subtitle",
          })}
      </div>
    );
  }
);
