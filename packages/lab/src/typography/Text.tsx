import {
  ElementType,
  HTMLAttributes,
  useState,
  ReactNode,
  CSSProperties,
  forwardRef,
  useCallback,
  useRef,
} from "react";
import cx from "classnames";
import {
  makePrefixer,
  useIsomorphicLayoutEffect,
  debounce,
} from "@jpmorganchase/uitk-core";
import { Tooltip, TooltipProps, useTooltip } from "../tooltip";

import { useForkRef } from "../utils";
import { getComputedStyles } from "./getComputedStyles";

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
   * If 'false' then text will be displayed at 100% height and will show scrollbar if the parent restricts it's height.
   * Defaults to 'true'
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

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    children,
    className,
    elementType = "div",
    maxRows,
    showTooltip = true,
    truncate = true,
    expanded,
    onOverflowChange,
    tooltipProps,
    style,
    marginTop,
    marginBottom,
    ...restProps
  },
  ref
) {
  const [element, setElement] = useState<HTMLElement>();
  const setContainerRef = useForkRef(ref, setElement);
  const [rows, setRows] = useState<number | undefined>();
  const isOverflowedRef = useRef(false);

  // Overflow
  const getRows = useCallback(() => {
    let textRows;

    if (element && truncate) {
      const { offsetHeight, scrollHeight, offsetWidth, scrollWidth } = element;
      const { lineHeight } = getComputedStyles(element);

      if (maxRows === 0 || expanded) {
        textRows = 0;
      } else if (maxRows) {
        textRows = maxRows;
      } else if (expanded !== undefined) {
        textRows = 1;
      } else {
        const parent = element.parentElement;

        if (parent && !element.nextSibling && !element.previousSibling) {
          const { width: widthParent, height: heightParent } =
            getComputedStyles(parent);

          if (
            heightParent < scrollHeight ||
            heightParent < offsetHeight ||
            offsetWidth < scrollWidth ||
            Math.ceil(widthParent) < scrollWidth
          ) {
            textRows = Math.floor(heightParent / lineHeight);
          }
        }
      }

      if (textRows) {
        const rowsHeight = textRows * lineHeight;
        const isOverflowed =
          rowsHeight < offsetHeight || rowsHeight < scrollHeight;
        if (isOverflowedRef.current !== isOverflowed) {
          onOverflowChange && onOverflowChange(isOverflowed);
          isOverflowedRef.current = isOverflowed;
        }
      }
    }
    return textRows;
  }, [element, expanded, truncate, maxRows, onOverflowChange]);

  // Observers
  useIsomorphicLayoutEffect(() => {
    const onResize = debounce(() => {
      setRows(getRows());
    });

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0 && entries[0].target.isConnected) {
        onResize();
      }
    });

    const onScroll = debounce((entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (element && entry.isIntersecting) {
          resizeObserver.observe(element);
        } else {
          resizeObserver.disconnect();
        }
      });
    });

    const scrollObserver = new IntersectionObserver(onScroll, {
      root: null,
      rootMargin: "0px",
      threshold: 0,
    });

    if (element) {
      scrollObserver.observe(element);
    }

    return () => {
      scrollObserver.disconnect();
    };
  }, [element, getRows]);

  // Tooltip
  const hasTooltip =
    element && rows && truncate && showTooltip && expanded === undefined;

  // Rendering
  const Component: ElementType = elementType;

  const tooltipTitle =
    typeof children === "string" ? children : element?.textContent || "";

  const { getTooltipProps, getTriggerProps } = useTooltip({
    enterDelay: 150,
    placement: "top",
    disabled: !hasTooltip,
  });

  const { ref: triggerRef, ...triggerProps } = getTriggerProps({
    className: cx(
      withBaseName(),
      {
        [withBaseName("lineClamp")]: rows && !expanded,
        [withBaseName("overflow")]: !truncate,
      },
      className
    ),
    ...restProps,
    tabIndex: hasTooltip ? 0 : -1,
    style: {
      marginTop,
      marginBottom,
      ...style,
      "--text-max-rows": rows,
    } as CSSProperties,
  });

  const handleRef = useForkRef(triggerRef, setContainerRef);

  return (
    <>
      <Component {...triggerProps} ref={handleRef}>
        {children}
      </Component>
      <Tooltip
        {...getTooltipProps({
          title: tooltipTitle,
          ...tooltipProps,
        })}
      />
    </>
  );
});
