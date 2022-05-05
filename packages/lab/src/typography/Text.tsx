import {
  ElementType,
  HTMLAttributes,
  ReactNode,
  CSSProperties,
  forwardRef,
  useCallback,
} from "react";
import cx from "classnames";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { Tooltip, TooltipProps } from "@jpmorganchase/uitk-lab";

import { useTruncation } from "./useTruncation";

import "./Text.css";

const withBaseName = makePrefixer("uitkText");

export interface TextProps extends HTMLAttributes<HTMLElement> {
  children?: string | ReactNode;
  /**
   * Represents the semantic element tag name as a string.
   * Defaults to 'div'
   */
  elementType?: ElementType;
  /**
   * When set, this will enforce the text to be truncated.
   */
  maxRows?: number;
  /**
   * If 'true', component will apply the logic for truncation. If 'false' then text will be displayed at 100% height and will show scrollbar if the parent restricts it's height.
   * Defaults to 'false'
   */
  truncate?: boolean;
  /**
   * If 'true' it will show the Tooltip only if the text is truncated.
   * Defaults to 'false'
   */
  showTooltip?: boolean;
  /**
   * Customise Tooltip
   */
  tooltipProps?: Partial<TooltipProps>;
  /**
   * If 'true' the text will expand to 100% height, if 'false' text will collapse to 'maxRows'.
   *
   * When set, maxRows defaults to 1.
   *
   * When set, it will not show the tooltip when text is truncated.
   */
  expanded?: boolean;
  /**
   * Customise styling.
   */
  style?: CSSProperties;
  /**
   * Callback function triggered when overflow state changes.
   * @params [boolean] isOverflowed
   */
  onOverflowChange?: (isOverflowed: boolean) => unknown;
  /**
   * Override style for margin-top
   */
  marginTop?: number;
  /**
   * Override style for margin-bottom
   */
  marginBottom?: number;
}

const TOOLTIP_DELAY = 150;

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { truncate = false, ...props },
  ref
) {
  const {
    children,
    className,
    elementType = "div",
    maxRows,
    showTooltip = true,
    expanded,
    onOverflowChange,
    tooltipProps,
    style,
    marginTop,
    marginBottom,
    ...restProps
  } = props;

  // Rendering
  const Component: ElementType = elementType;

  const getTruncatingComponent = useCallback(() => {
    const { setContainerRef, hasTooltip, tooltipTitle, rows } = useTruncation(
      props,
      ref
    );

    const component = (
      <Component
        className={cx(withBaseName(), className, {
          [withBaseName("lineClamp")]: rows && !expanded,
        })}
        {...restProps}
        tabIndex={hasTooltip ? 0 : -1}
        ref={setContainerRef}
        style={{
          marginTop,
          marginBottom,
          ...style,
          "--text-max-rows": rows,
        }}
      >
        {children}
      </Component>
    );

    return hasTooltip ? (
      <Tooltip
        enterNextDelay={TOOLTIP_DELAY}
        placement="top"
        title={tooltipTitle}
        {...tooltipProps}
      >
        {component}
      </Tooltip>
    ) : (
      component
    );
  }, []);

  const content = truncate ? (
    getTruncatingComponent()
  ) : (
    <Component
      className={cx(withBaseName(), withBaseName("overflow"), className, {})}
      {...restProps}
      ref={ref}
      style={{
        marginTop,
        marginBottom,
        ...style,
      }}
    >
      {children}
    </Component>
  );

  return content;
});
