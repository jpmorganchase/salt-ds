import {
  debounce,
  useForkRef,
  useIsomorphicLayoutEffect,
  polymorphicRef,
} from "@jpmorganchase/uitk-core";
import { useCallback, useRef, useState, ElementType, Ref } from "react";
import { TextProps } from "../typography";
import { getComputedStyles } from "./getComputedStyles";

// this guards against text underline which adds 1px on scrollHeight
const VELOCITY = 1;

type UseTruncationType = {
  setContainerRef?: Ref<ElementType> | null | undefined;
  hasTooltip?: boolean;
  tooltipTextDefault: string;
  rows?: number;
};

export const useTruncation = (
  {
    children,
    maxRows,
    showTooltip = true,
    onOverflowChange,
  }: Partial<TextProps>,
  ref: polymorphicRef<ElementType>
): UseTruncationType => {
  const [element, setElement] = useState<HTMLElement>();
  const setContainerRef = useForkRef(ref, setElement);
  const [rows, setRows] = useState<number | undefined>();
  const isOverflowed = useRef<boolean | undefined>();

  // Calculating Rows
  const getRows = useCallback(() => {
    let textRows;

    if (element) {
      const { offsetHeight, scrollHeight, offsetWidth, scrollWidth } = element;
      const { lineHeight } = getComputedStyles(element);

      if (maxRows) {
        textRows = maxRows;
      } else {
        const parent = element.parentElement;

        if (parent && !element.nextSibling && !element.previousSibling) {
          const { width: widthParent, height: heightParent } =
            getComputedStyles(parent);

          if (
            Math.ceil(heightParent) < scrollHeight - VELOCITY ||
            Math.ceil(heightParent) < offsetHeight ||
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
          rowsHeight < scrollHeight - VELOCITY ||
          rowsHeight < offsetHeight ||
          offsetWidth < scrollWidth;

        if (isOverflowed.current !== hasOverflowed) {
          onOverflowChange?.(hasOverflowed);
          isOverflowed.current = hasOverflowed;
        }

        if (!hasOverflowed) {
          return 0;
        }
      } else {
        if (isOverflowed.current || isOverflowed.current === undefined) {
          onOverflowChange && onOverflowChange(false);
          isOverflowed.current = false;
        }
      }
    }

    return textRows;
  }, [element, maxRows, onOverflowChange]);

  // Add Observers
  useIsomorphicLayoutEffect(() => {
    if (element) {
      const onResize = debounce(
        () => {
          setRows(getRows());
        },
        500,
        true
      );

      const resizeObserver = new ResizeObserver((entries) => {
        if (entries.length > 0 && entries[0].target.isConnected) {
          onResize();
        }
      });

      resizeObserver.observe(element);

      return () => {
        resizeObserver?.disconnect();
        onResize?.clear();
      };
    }
  }, [element, getRows]);

  // Has Tooltip
  const hasTooltip = rows && showTooltip && isOverflowed.current;

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
