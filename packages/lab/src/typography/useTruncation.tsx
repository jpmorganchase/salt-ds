import {
  debounce,
  useForkRef,
  useIsomorphicLayoutEffect,
} from "@jpmorganchase/uitk-core";
import { ForwardedRef, useCallback, useRef, useState } from "react";
import { TextProps } from "../typography";
import { getComputedStyles } from "./getComputedStyles";

export const useTruncation = (
  props: TextProps,
  ref: ForwardedRef<HTMLElement>
) => {
  const {
    children,
    maxRows,
    showTooltip = true,
    expanded,
    onOverflowChange,
  } = props;

  const [element, setElement] = useState<HTMLElement>();
  const setContainerRef = useForkRef(ref, setElement);
  const [rows, setRows] = useState<number | undefined>();
  const isOverflowed = useRef(false);

  // Calculating Rows
  const getRows = useCallback(() => {
    let textRows;

    if (element) {
      const { offsetHeight, scrollHeight, offsetWidth, scrollWidth } = element;
      const { lineHeight } = getComputedStyles(element);

      if (maxRows === 0 || expanded) {
        textRows = 0;
      } else if (maxRows && !expanded) {
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
        const hasOverflowed =
          rowsHeight < offsetHeight || rowsHeight < scrollHeight;
        if (isOverflowed.current !== hasOverflowed) {
          onOverflowChange && onOverflowChange(hasOverflowed);
          isOverflowed.current = hasOverflowed;
        }
      }
    }

    return textRows;
  }, [element, expanded, maxRows, onOverflowChange]);

  // Add Observers
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
      onResize.clear();
    };
  }, [element, getRows]);

  // Has Tooltip
  const hasTooltip =
    rows && showTooltip && isOverflowed.current && expanded === undefined;

  const tooltipTextDefault =
    (hasTooltip &&
      (typeof children === "string" ? children : element?.textContent)) ||
    "";

  return {
    setContainerRef,
    hasTooltip,
    tooltipTextDefault,
    rows,
  };
};
