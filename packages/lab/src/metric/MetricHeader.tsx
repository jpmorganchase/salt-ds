import { forwardRef, HTMLAttributes } from "react";
import cx from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { Link, LinkProps, H4 } from "@jpmorganchase/uitk-lab";
import warning from "warning";

import { useMetricContext, capitalise } from "./internal";

import "./MetricHeader.css";

export interface MetricHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * If provided, subtitle will be rendered as a `Link` element with these props.
   *
   * @see `Link` for a list of valid props.
   */
  SubtitleLinkProps?: Partial<LinkProps>;
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
    { SubtitleLinkProps, className, title, subtitle, ...restProps },
    ref
  ) {
    const { align, titleId, subtitleId, direction, orientation } =
      useMetricContext();

    const renderSubtitle = (props: {
      id?: string;
      className?: string;
      "data-testid": string;
    }) => {
      if (!subtitle) return;

      if (SubtitleLinkProps) {
        const { children, href = "", ...restLinkProps } = SubtitleLinkProps;

        if (process.env.NODE_ENV !== "production") {
          warning(
            children === undefined,
            `'children' in 'SubtitleLinkProps' is ignored. ${subtitle} is used instead.`
          );
        }

        return (
          <Link href={href} {...restLinkProps}>
            <H4 {...props}>{subtitle}</H4>
          </Link>
        );
      }
      return <H4 {...props}>{subtitle}</H4>;
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
        <H4
          className={withBaseName("title")}
          data-testid="metric-title"
          id={titleId}
        >
          {title}
        </H4>
        {renderSubtitle({
          id: subtitleId,
          className: withBaseName("subtitle"),
          "data-testid": "metric-subtitle",
        })}
      </div>
    );
  }
);
