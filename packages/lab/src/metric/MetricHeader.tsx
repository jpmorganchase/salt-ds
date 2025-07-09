import { Link, type LinkProps, makePrefixer, Text } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, useCallback } from "react";
import { useMetricContext } from "./internal";

import metricHeaderCss from "./MetricHeader.css";

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

const withBaseName = makePrefixer("saltMetricHeader");

export const MetricHeader = forwardRef<HTMLDivElement, MetricHeaderProps>(
  function MetricHeader(
    { SubtitleLinkProps, className, title, subtitle, ...restProps },
    ref,
  ) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-metric-header",
      css: metricHeaderCss,
      window: targetWindow,
    });

    const { titleId, subtitleId, headingAriaLevel } = useMetricContext();

    const renderSubtitle = useCallback(() => {
      if (!subtitle) return null;

      const subtitleComponent = (
        <Text
          id={subtitleId}
          className={withBaseName("subtitle")}
          data-testid="metric-subtitle"
          variant="secondary"
        >
          {subtitle}
        </Text>
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
      <div {...restProps} className={clsx(withBaseName(), className)} ref={ref}>
        <Text
          styleAs="h4"
          className={withBaseName("title")}
          data-testid="metric-title"
          id={titleId}
          role="heading"
          aria-level={headingAriaLevel}
        >
          {title}
        </Text>
        {renderSubtitle()}
      </div>
    );
  },
);
