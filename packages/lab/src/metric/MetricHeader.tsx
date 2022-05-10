import { forwardRef, HTMLAttributes, useCallback } from "react";
import cx from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { Link, LinkProps, H4 } from "@jpmorganchase/uitk-lab";
import warning from "warning";

import { useMetricContext } from "./internal";

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
    const { titleId, subtitleId } = useMetricContext();

    const renderSubtitle = useCallback(() => {
      if (!subtitle) return;

      const subtitleComponent = (
        <H4
          id={subtitleId}
          className={withBaseName("subtitle")}
          data-testid="metric-subtitle"
        >
          {subtitle}
        </H4>
      );

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
            {subtitleComponent}
          </Link>
        );
      }

      return subtitleComponent;
    }, [subtitle]);

    return (
      <div {...restProps} className={cx(withBaseName(), className)} ref={ref}>
        <H4
          className={withBaseName("title")}
          data-testid="metric-title"
          id={titleId}
        >
          {title}
        </H4>
        {renderSubtitle()}
      </div>
    );
  }
);
