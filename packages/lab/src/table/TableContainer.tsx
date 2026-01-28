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
  useMemo,
  useRef,
  useState,
} from "react";
import { withTableBaseName } from "./Table";
import tableCss from "./Table.css";
import { TableContext } from "./TableContext";

export interface TableContainerProps extends HTMLAttributes<HTMLDivElement> {}

export const TableContainer = forwardRef<HTMLDivElement, TableContainerProps>(
  function TableContainer(props, ref) {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [tableId, setTableId] = useState<string | undefined>(undefined);
    const [labelledBy, setLabelledBy] = useState<string | undefined>(undefined);

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-table-container",
      css: tableCss,
      window: targetWindow,
    });

    const ariaLabelledBy = props["aria-labelledby"];

    const { children, className, role, tabIndex, ...rest } = props;

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
          ...(ariaLabelledBy === undefined && {
            "aria-labelledby": labelledBy ?? (tableId || undefined),
          }),
        }
      : {};

    const contextValue = useMemo(
      () => ({ id: tableId, setId: setTableId, labelledBy, setLabelledBy }),
      [tableId, labelledBy],
    );

    return (
      <TableContext.Provider value={contextValue}>
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
      </TableContext.Provider>
    );
  },
);
