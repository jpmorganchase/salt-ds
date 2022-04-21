import {
  ElementType,
  HTMLAttributes,
  useEffect,
  useState,
  useRef,
  ReactNode,
  CSSProperties,
  forwardRef,
  useMemo,
  useCallback,
} from "react";
import cx from "classnames";
import {
  useDensity,
  makePrefixer,
  useIsomorphicLayoutEffect,
  debounce,
} from "@brandname/core";
import { Tooltip, TooltipProps } from "@brandname/lab";

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
    expanded,
    onOverflow,
    tooltipProps,
    style,
    marginTop,
    marginBottom,
    ...restProps
  },
  ref
) {
  const [contentRef, setContentRef] = useState<HTMLElement>();
  const setContainerRef = useForkRef(ref, setContentRef);

  const [size, setSize] = useState<{ width: number; height: number }>();
  const [isIntersecting, setIsIntersecting] = useState(false);
  const rows = useRef(maxRows);
  const density = useDensity();

  // Scrolling

  const scrollingCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.target.isConnected) {
          setIsIntersecting(entry.isIntersecting);
        }
      });
    },
    []
  );

  const debounceScrolling = useMemo(
    () => debounce(scrollingCallback),
    [scrollingCallback]
  );

  useIsomorphicLayoutEffect(() => {
    const scrollObserver = new IntersectionObserver(debounceScrolling, {
      root: null,
      rootMargin: "0px",
      threshold: 0,
    });

    if (contentRef) {
      scrollObserver.observe(contentRef);
    }

    return () => {
      scrollObserver.disconnect();
    };
  }, [contentRef, debounceScrolling]);

  // Resizing

  const debounceResize = useMemo(
    () =>
      debounce((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (entry.target.isConnected) {
            setSize({ width, height });
          }
        }
      }),
    []
  );

  const [resizeObserver] = useState(() => {
    return new ResizeObserver((entries) => {
      if (entries.length > 0 && entries[0].contentRect) {
        debounceResize(entries);
      }
    });
  });

  useIsomorphicLayoutEffect(() => {
    if (contentRef && isIntersecting) {
      resizeObserver.observe(contentRef);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [contentRef, isIntersecting]);

  // Styling
  const componentStyle = useMemo(() => {
    if (contentRef) {
      const styles: StylesType = {};

      if (maxRows) {
        rows.current = maxRows;
        styles["--text-max-rows"] = maxRows;
      } else if (expanded !== undefined) {
        rows.current = 1;
        styles["--text-max-rows"] = 1;
      } else if (maxRows === 0) {
        // accommodating reset maxRows in stories
        return {};
      }

      if (expanded) {
        styles["--text-max-rows"] = 0;
      } else if (truncate && !rows.current) {
        const { offsetHeight, scrollHeight, offsetWidth, scrollWidth } =
          contentRef;
        const { lineHeight } = getComputedStyles(contentRef);

        const parent = contentRef.parentElement;

        if (parent && !contentRef.nextSibling && !contentRef.previousSibling) {
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
          }
        }
      }

      if (Object.keys(styles).length > 0) {
        return styles;
      }
    }
  }, [elementType, maxRows, expanded, truncate, density, size]);

  const isOverflowed = useMemo(() => {
    if (contentRef && truncate) {
      const { offsetHeight, scrollHeight, offsetWidth, scrollWidth } =
        contentRef;
      const { lineHeight } = getComputedStyles(contentRef);

      if (rows.current) {
        const maxRowsHeight = rows.current * lineHeight;

        if (maxRowsHeight < scrollHeight || maxRowsHeight < offsetHeight) {
          return true;
        }
      }

      const parent = contentRef.parentElement;

      if (parent && !contentRef.nextSibling && !contentRef.previousSibling) {
        const { width: widthParent, height: heightParent } =
          getComputedStyles(parent);

        if (
          heightParent < scrollHeight ||
          heightParent < offsetHeight ||
          offsetWidth < scrollWidth ||
          Math.ceil(widthParent) < scrollWidth
        ) {
          return true;
        }
      }
    }

    return false;
  }, [componentStyle]);

  useEffect(() => {
    if (onOverflow) {
      onOverflow(isOverflowed);
    }
  }, [isOverflowed]);

  // Tooltip
  const hasTooltip = useMemo(() => {
    let shouldHaveTooltip = false;
    if (contentRef) {
      if (isOverflowed && truncate && showTooltip && expanded === undefined) {
        shouldHaveTooltip = true;
      }
    }
    return shouldHaveTooltip;
  }, [isOverflowed, showTooltip, truncate, expanded]);

  // Rendering
  const Component: ElementType = elementType;
  const content = (
    <Component
      className={cx(withBaseName(), className, {
        [withBaseName("lineClamp")]: isOverflowed,
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

  const tooltipTitle =
    typeof children === "string" ? children : contentRef?.textContent || "";

  return hasTooltip ? (
    <Tooltip
      enterNextDelay={TOOLTIP_DELAY}
      placement="top"
      title={tooltipTitle}
      {...tooltipProps}
    >
      {content}
    </Tooltip>
  ) : (
    content
  );
});
