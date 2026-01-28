import {
  useForkRef,
  useIsomorphicLayoutEffect,
  useResizeObserver,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  forwardRef,
  type HTMLAttributes,
  useCallback,
  useRef,
  useState,
} from "react";
import { withTableBaseName } from "./Table";
import tableCss from "./Table.css";

export interface TableContainerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Accessible label for the table when it is scrollable.
   */
  label?: string;
  /**
   * ID of the element that contains the accessible label for the table when it is scrollable.
   */
  labelId?: string;
}

export const TableContainer = forwardRef<HTMLDivElement, TableContainerProps>(
  function TableContainer(props, ref) {
    const [isOverflowing, setIsOverflowing] = useState(false);

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-table-container",
      css: tableCss,
      window: targetWindow,
    });

    const ariaLabel = props["aria-label"];
    const ariaLabelledBy = props["aria-labelledby"];

    const { children, className, role, tabIndex, label, labelId, ...rest } =
      props;

    const scrollRef = useRef<HTMLDivElement | null>(null);
    const handleRef = useForkRef<HTMLDivElement>(ref, scrollRef);

    const checkOverflow = useCallback(() => {
      const element = scrollRef.current;
      if (!element) return;
      const verticalScroll = element.scrollHeight > element.clientHeight;
      const horizontalScroll = element.scrollWidth > element.clientWidth;
      setIsOverflowing(verticalScroll || horizontalScroll);
    }, []);

    useResizeObserver({ ref: scrollRef, onResize: checkOverflow });

    useIsomorphicLayoutEffect(() => {
      checkOverflow();
    }, [checkOverflow]);

    const ariaProps = isOverflowing
      ? {
          ...(ariaLabel === undefined && label && { "aria-label": label }),
          ...(ariaLabelledBy === undefined &&
            labelId && { "aria-labelledby": labelId }),
        }
      : {};

    return (
      <div
        ref={handleRef}
        className={clsx(withTableBaseName("container"), className)}
        role={role ?? (isOverflowing ? "region" : undefined)}
        tabIndex={tabIndex ?? (isOverflowing ? 0 : undefined)}
        {...ariaProps}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
