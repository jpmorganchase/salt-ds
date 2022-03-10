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
  useCallback,
} from "react";
import cx from "classnames";
import { useForkRef } from "../utils";

import { Tooltip, TooltipProps } from "../tooltip";
import { useDensity, makePrefixer } from "@brandname/core";

import "./Text.css";

const withBaseName = makePrefixer("uitkText");

export interface TextProps extends HTMLAttributes<HTMLElement> {
  children?: string | ReactNode;
  /**
   * Represents the semantic element tag name as a string.
   */
  elementType?: ElementType;
  /**
   * When set, this will enforce the text to be truncated.
   */
  maxRows?: number;
  /**
   * If 'false' then text will be displayed at 100% height and will show scrollbar if the parent restricts it's height.
   */
  truncate?: boolean;
  /**
   * If 'true' it will show the Tooltip only if the text is truncated.
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
}

interface StylesType {
  opacity?: number;
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
    ...restProps
  },
  ref
) {
  const contentRef = useRef<HTMLElement>();
  const setContainerRef = useForkRef(ref, contentRef);

  const [isOverflowed, setIsOverflowed] = useState(false);
  const [hasTooltip, setHasTooltip] = useState(false);
  const [resize, setResize] = useState<{ width?: number; height?: number }>();
  const [isVisible, setIsVisible] = useState(false);
  const [componentStyle, setStyle] = useState<StylesType>();
  const rows = useRef(maxRows);
  const density = useDensity();

  // Debounce hook
  const debounce = useCallback((func: () => void, timeout = 100) => {
    let timer: number;
    const debouncer = function () {
      clearTimeout(timer);
      timer = window.setTimeout(() => func(), timeout);
    };
    return debouncer();
  }, []);

  // Scrolling
  useLayoutEffect(() => {
    const { current: node } = contentRef;

    const scrollObserver = new IntersectionObserver(
      (entries) => {
        debounce(() => {
          entries.forEach((entry) => {
            setIsVisible(entry.isIntersecting);
          });
        });
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
  }, [contentRef.current, debounce]);

  // Resizing
  useLayoutEffect(() => {
    const { current: node } = contentRef;

    const resizeObserver = new ResizeObserver((entries) => {
      debounce(() => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          setResize({ width, height });
        }
      });
    });

    if (node && isVisible) {
      resizeObserver.observe(node);
    }

    return () => {
      if (node) {
        resizeObserver.unobserve(node);
      }
    };
  }, [isVisible, contentRef.current, debounce]);

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
        const { offsetHeight, scrollHeight, scrollWidth } = contentRef.current;
        const { lineHeight: lineHeightComputed } = getComputedStyles(
          contentRef.current
        );

        const parent = contentRef.current.parentElement;

        if (rows.current) {
          const maxRowsHeight = rows.current * lineHeightComputed;

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
            Math.ceil(widthParent) < scrollWidth
          ) {
            const newRows = Math.floor(heightParent / lineHeightComputed);

            styles["--text-max-rows"] = newRows;
            styles["--text-height"] = `${newRows * lineHeightComputed}px`;

            setIsOverflowed(true);
          } else {
            setIsOverflowed(false);
          }
        }
      }
      styles.opacity = 1;
      setStyle(styles);
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

    return () => {
      setHasTooltip(false);
    };
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
      aria-hidden={hasTooltip ? true : undefined}
      ref={setContainerRef}
      style={{ ...componentStyle, ...style }}
    >
      {children}
    </Component>
  );

  return hasTooltip ? (
    <Tooltip
      enterNextDelay={TOOLTIP_DELAY}
      placement="top"
      title={
        typeof children === "string"
          ? children
          : contentRef.current?.textContent || ""
      }
      {...tooltipProps}
    >
      {content}
    </Tooltip>
  ) : (
    content
  );
});

// Utils
function getComputedStyles(el: HTMLElement) {
  const { lineHeight, height, width } = window.getComputedStyle(el);

  return {
    lineHeight: parseFloat(lineHeight.replace("px", "")),
    height: parseFloat(height.replace("px", "")),
    width: parseFloat(width.replace("px", "")),
  };
}
