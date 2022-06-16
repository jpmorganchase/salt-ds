import {
  makePrefixer,
  Tooltip,
  TooltipProps,
  useForkRef,
  useTooltip,
} from "@jpmorganchase/uitk-core";
import cx from "classnames";
import { CSSProperties, ElementType, forwardRef, HTMLAttributes } from "react";
import { useTruncation } from "./useTruncation";

import "./Text.css";

const withBaseName = makePrefixer("uitkText");

export interface TextProps extends HTMLAttributes<HTMLElement> {
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
   * Defaults to 'true'
   */
  showTooltip?: boolean;
  /**
   * Customise Tooltip
   */
  tooltipProps?: Partial<TooltipProps>;
  /**
   * Customize the Tooltip text
   */
  tooltipText?: string;
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
  /**
   * Match styling to a specified heading
   */
  styleAs?: "h1" | "h2" | "h3" | "h4";
}

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  props,
  ref
) {
  const {
    children,
    className,
    elementType = "div",
    expanded,
    marginBottom,
    marginTop,
    maxRows,
    onOverflowChange,
    showTooltip,
    style,
    styleAs,
    tooltipProps,
    tooltipText,
    truncate = false,
    ...restProps
  } = props;

  // Rendering
  const Component: ElementType = elementType;

  const getTruncatingComponent = () => {
    const { setContainerRef, hasTooltip, tooltipTextDefault, rows } =
      useTruncation(props, ref);

    const { getTooltipProps, getTriggerProps } = useTooltip({
      enterDelay: 150,
      placement: "top",
      disabled: !hasTooltip,
    });

    const { ref: triggerRef, ...triggerProps } = getTriggerProps({
      className: cx(withBaseName(), className, {
        [withBaseName("lineClamp")]: !expanded,
        [withBaseName(styleAs || "")]: styleAs,
      }),
      ...restProps,
      tabIndex: hasTooltip ? 0 : -1,
    });

    const handleRef = useForkRef(triggerRef, setContainerRef);

    return (
      <>
        <Component
          {...triggerProps}
          ref={handleRef}
          style={{
            marginTop,
            marginBottom,
            ...style,
            "--text-max-rows": rows,
          }}
        >
          {children}
        </Component>
        <Tooltip
          {...getTooltipProps({
            title: tooltipText || tooltipTextDefault,
            ...tooltipProps,
          })}
        />
      </>
    );
  };

  if (truncate) {
    return getTruncatingComponent();
  }

  return (
    <Component
      className={cx(withBaseName(), withBaseName("overflow"), className, {
        [withBaseName(styleAs || "")]: styleAs,
      })}
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
});
