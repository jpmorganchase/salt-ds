import { makePrefixer } from "@jpmorganchase/uitk-core";
import cx from "classnames";
import { forwardRef, HTMLAttributes, useCallback } from "react";
import { Link, LinkProps } from "../link";
import { Div } from "../text";
import { useMetricContext } from "./internal";
import "./MetricHeader.css";

export interface MetricHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * If provided, subtitle will be rendered as a `Link` element with these props.
   *
   * @see `Link` for a list of valid props.
   */
  SubtitleLinkProps?: Omit<Partial<LinkProps>, "children">;
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
    const { titleId, subtitleId, headingAriaLevel } = useMetricContext();

    const renderSubtitle = useCallback(() => {
      if (!subtitle) return null;

      const subtitleComponent = (
        <Div
          id={subtitleId}
          className={withBaseName("subtitle")}
          data-testid="metric-subtitle"
        >
          {subtitle}
        </Div>
      );

      if (SubtitleLinkProps) {
        const { href = "", ...restLinkProps } = SubtitleLinkProps;

        return (
          <Link href={href} {...restLinkProps}>
            {subtitleComponent}
          </Link>
        );
      }

      return subtitleComponent;
    }, [subtitle, subtitleId, SubtitleLinkProps]);

    return (
      <div {...restProps} className={cx(withBaseName(), className)} ref={ref}>
        <Div
          styleAs="h4"
          className={withBaseName("title")}
          data-testid="metric-title"
          id={titleId}
          role="heading"
          aria-level={headingAriaLevel}
        >
          {title}
        </Div>
        {renderSubtitle()}
      </div>
    );
  }
);
