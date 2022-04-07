import {
  ElementType,
  HTMLAttributes,
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  ReactNode,
  CSSProperties,
  forwardRef,
} from "react";
import cx from "classnames";
import {
  useDensity,
  makePrefixer,
  useIsomorphicLayoutEffect,
} from "@brandname/core";
import { Tooltip, TooltipProps } from "@brandname/lab";

import { useForkRef } from "../utils";
import { getComputedStyles } from "./getComputedStyles";

import "./Text.css";
// import { TooltipNext, TooltipProps } from "../tooltip-next";

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
  onOverflow?: (isOverflowed: boolean) => unknown;
  /**
   * Override style for margin-top
   */
  marginTop?: number;
  /**
   * Override style for margin-bottom
   */
  marginBottom?: number;
}

interface StylesType {
  "--text-height"?: string;
  "--text-max-rows"?: number;
}

const TOOLTIP_DELAY = 150;

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    children,
    className,
    elementType = "div",
    maxRows,
    showTooltip = true,
    truncate = true,
    tooltipProps,
    expanded,
    style,
    onOverflow,
    marginTop,
    marginBottom,
    ...restProps
  },
  ref
) {
  const contentRef = useRef<HTMLElement>();
  const setContainerRef = useForkRef(ref, contentRef);

  const [isOverflowed, setIsOverflowed] = useState(false);
  const [hasTooltip, setHasTooltip] = useState(false);
  const [resize, setResize] = useState<{ width: number; height: number }>();
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [componentStyle, setStyle] = useState<StylesType>();
  const rows = useRef(maxRows);
  const density = useDensity();

  // Finding focusable parent to apply the tooltip on
  const [triggerEl, setTriggerEl] = useState<HTMLElement | undefined>();

  useEffect(() => {
    if (contentRef.current) {
      const parent =
        (contentRef.current.closest('[role="menuitem"]') as HTMLElement) ||
        (contentRef.current.closest("[href]") as HTMLElement) ||
        (contentRef.current.closest('[tabindex="0"]') as HTMLElement);
      setTriggerEl(parent || contentRef.current);
    }
  }, [contentRef]);

  // Scrolling
  useIsomorphicLayoutEffect(() => {
    const { current: node } = contentRef;
    let timeoutScroll: number;

    const scrollObserver = new IntersectionObserver(
      (entries) => {
        if (timeoutScroll) {
          window.clearTimeout(timeoutScroll);
        }
        timeoutScroll = window.setTimeout(() => {
          entries.forEach((entry) => {
            setIsIntersecting(entry.isIntersecting);
          });
        }, 200);
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0,
      }
    );

    if (node) {
      scrollObserver.observe(node);
    }

    return () => {
      scrollObserver.disconnect();
    };
  }, [contentRef.current]);

  // Resizing
  useEffect(() => {
    const { current: node } = contentRef;
    let timeoutResize: number;

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0 && entries[0].contentRect) {
        if (timeoutResize) {
          window.clearTimeout(timeoutResize);
        }

        timeoutResize = window.setTimeout(() => {
          for (const entry of entries) {
            const { width, height } = entry.contentRect;
            if (width !== resize?.width || height !== resize?.height) {
              setResize({ width, height });
            }
          }
        }, 200);
      }
    });

    if (node && isIntersecting) {
      resizeObserver.observe(node);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [contentRef.current, isIntersecting]);

  // Styling
  useEffect(() => {
    if (contentRef.current) {
      const styles: StylesType = {};

      if (maxRows) {
        rows.current = maxRows;
        styles["--text-max-rows"] = maxRows;
      } else if (expanded !== undefined) {
        rows.current = 1;
        styles["--text-max-rows"] = 1;
      } else if (maxRows === 0) {
        // mostly for accommodating reset maxRows in stories
        setIsOverflowed(false);
        setStyle({});
        return;
      }

      if (expanded) {
        styles["--text-max-rows"] = 0;
        styles["--text-height"] = `100%`;
        setIsOverflowed(false);
      } else if (truncate) {
        const { offsetHeight, scrollHeight, offsetWidth, scrollWidth } =
          contentRef.current;
        const { lineHeight } = getComputedStyles(contentRef.current);

        const parent = contentRef.current.parentElement;

        if (rows.current) {
          const maxRowsHeight = rows.current * lineHeight;

          if (maxRowsHeight < scrollHeight || maxRowsHeight < offsetHeight) {
            styles["--text-height"] = `${maxRowsHeight}px`;
            setIsOverflowed(true);
          } else {
            setIsOverflowed(false);
          }
        }
        // we check for wrapper size only if it's the only child, otherwise we depend on too much styling
        else if (
          parent &&
          !contentRef.current.nextSibling &&
          !contentRef.current.previousSibling
        ) {
          const { width: widthParent, height: heightParent } =
            getComputedStyles(parent);

          if (
            heightParent < scrollHeight ||
            heightParent < offsetHeight ||
            offsetWidth < scrollWidth ||
            Math.ceil(widthParent) < scrollWidth
          ) {
            const newRows = Math.floor(heightParent / lineHeight);

            styles["--text-max-rows"] = newRows;
            styles["--text-height"] = `${newRows * lineHeight}px`;

            setIsOverflowed(true);
          } else {
            setIsOverflowed(false);
          }
        }
      }

      if (Object.keys(styles).length > 0) {
        setStyle(styles);
      }
    }
  }, [elementType, maxRows, expanded, truncate, density, resize]);

  // Tooltip
  useEffect(() => {
    if (contentRef.current) {
      if (onOverflow) {
        onOverflow(isOverflowed);
      }

      if (isOverflowed && truncate && showTooltip && expanded === undefined) {
        setHasTooltip(true);
      } else {
        setHasTooltip(false);
      }
    }
  }, [isOverflowed, showTooltip, truncate, expanded, onOverflow]);

  // Rendering
  const Component: ElementType = elementType;
  const content = (
    <Component
      className={cx(withBaseName(), className, {
        [withBaseName("lineClamp")]: isOverflowed && truncate,
        [withBaseName("overflow")]: !truncate,
      })}
      {...restProps}
      tabIndex={hasTooltip ? 0 : -1}
      ref={setContainerRef}
      style={{ marginTop, marginBottom, ...componentStyle, ...style }}
    >
      {children}
    </Component>
  );

  const tooltipContent =
    typeof children === "string"
      ? children
      : contentRef.current?.textContent || "";

  return (
    <>
      {hasTooltip && (
        <Tooltip
          enterNextDelay={TOOLTIP_DELAY}
          placement="top"
          title={tooltipContent}
          {...tooltipProps}
          anchorElement={triggerEl}
        />
      )}
      {content}
    </>
  );
});
