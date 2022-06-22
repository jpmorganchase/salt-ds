import {
  makePrefixer,
  Tooltip,
  TooltipProps,
  useForkRef,
  useTooltip,
} from "@jpmorganchase/uitk-core";
import cx from "classnames";
import {
  CSSProperties,
  ElementType,
  forwardRef,
  ComponentPropsWithoutRef,
  useMemo,
  useCallback,
} from "react";
import { useTruncation } from "./useTruncation";

import "./Text.css";

const withBaseName = makePrefixer("uitkText");

interface TextPropsBase<E extends ElementType> {
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
   * Customise styling.
   */
  style?: CSSProperties;
  /**
   * Callback function triggered when overflow state changes.
   * @params [boolean] isOverflowed
   */
  onOverflowChange?: (isOverflowed: boolean) => unknown;
  /**
   * Match styling to a specified heading
   */
  styleAs?: "h1" | "h2" | "h3" | "h4" | "label";
}

export type TextProps<E extends ElementType = "div"> = TextPropsBase<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof TextPropsBase<E>>;

export const Text = forwardRef<HTMLElement, TextProps<ElementType>>(
  function Text(props, ref) {
    const {
      children,
      className,
      elementType = "div",
      maxRows,
      onOverflowChange,
      showTooltip = true,
      style,
      styleAs,
      tooltipProps,
      tooltipText,
      truncate = false,
      tabIndex,
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
        className: cx(withBaseName(), className, withBaseName("lineClamp"), {
          [withBaseName(styleAs || "")]: styleAs,
        }),
        tabIndex: hasTooltip || elementType === "a" ? 0 : -1,
        style: {
          ...style,
          // @ts-ignore
          "--text-max-rows": rows,
        },
        ...restProps,
      });

      const handleRef = useForkRef(triggerRef, setContainerRef);

      return (
        <>
          <Component {...triggerProps} ref={handleRef}>
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
        style={style}
      >
        {children}
      </Component>
    );
  }
);
