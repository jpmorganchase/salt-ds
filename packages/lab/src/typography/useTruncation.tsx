import { useState, useCallback, useRef, ForwardedRef } from "react";
import { useIsomorphicLayoutEffect, debounce } from "@jpmorganchase/uitk-core";
import { TextProps } from "@jpmorganchase/uitk-lab";

import { useForkRef } from "../utils";
import { getComputedStyles } from "./getComputedStyles";

export const useTruncation = (
  props: TextProps,
  ref: ForwardedRef<HTMLElement>
) => {
  const { maxRows, showTooltip, expanded, onOverflowChange } = props;

  const [element, setElement] = useState<HTMLElement>();
  const setContainerRef = useForkRef(ref, setElement);
  const [rows, setRows] = useState<number | undefined>();
  const isOverflowedRef = useRef(false);

  // Calculating Rows
  const getRows = useCallback(() => {
    let textRows;

    if (element) {
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
    };
  }, [element, getRows]);

  // Has Tooltip
  const hasTooltip = element && rows && showTooltip && expanded === undefined;

  return { element, hasTooltip, setContainerRef, rows };
};
