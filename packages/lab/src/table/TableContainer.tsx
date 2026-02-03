import {
  useForkRef,
  useIsomorphicLayoutEffect,
  useResizeObserver,
} from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { withTableBaseName } from "./Table";
import tableCss from "./Table.css";
import { TableContext } from "./TableContext";

export interface TableContainerProps
  extends Omit<
    ComponentPropsWithoutRef<"div">,
    "aria-label" | "aria-labelledby" | "role"
  > {}

export const TableContainer = forwardRef<HTMLDivElement, TableContainerProps>(
  function TableContainer(props, ref) {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [tableId, setTableId] = useState<string | undefined>();
    const [labelledBy, setLabelledBy] = useState<string | undefined>();

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-table-container",
      css: tableCss,
      window: targetWindow,
    });

    const {
      children,
      className,
      // @ts-expect-error: "aria-labelledby" is omitted to prevent accidental misuse,
      // but we still want to forward it for advanced accessible labeling scenarios.
      "aria-labelledby": ariaLabelledBy,
      // @ts-expect-error: Allow passing aria-label even though it's omitted from HTMLAttributes
      // Same reasoning as above: we forward aria-label for accessibility purposes.
      "aria-label": ariaLabel,
      // @ts-expect-error: Allow passing role even though it's omitted from HTMLAttributes
      // Same reasoning as above: we forward role for accessibility purposes.
      role,
      tabIndex,
      ...rest
    } = props;

    const scrollRef = useRef<HTMLDivElement | null>(null);
    const handleRef = useForkRef<HTMLDivElement>(ref, scrollRef);

    const checkOverflow = useCallback(() => {
      const element = scrollRef.current;
      if (!element) return;
      const overflowing =
        element.scrollHeight > element.clientHeight ||
        element.scrollWidth > element.clientWidth;
      setIsOverflowing((prev) => (prev !== overflowing ? overflowing : prev));
    }, []);

    useResizeObserver({ ref: scrollRef, onResize: checkOverflow });

    useIsomorphicLayoutEffect(() => {
      checkOverflow();
    }, [checkOverflow]);

    const overflowProps = isOverflowing
      ? {
          role: role ?? "region",
          tabIndex: tabIndex ?? 0,
          "aria-label": ariaLabel,
          ...(ariaLabelledBy === undefined &&
            ariaLabel === undefined && {
              "aria-labelledby": labelledBy ?? tableId,
            }),
          ...(ariaLabelledBy !== undefined && {
            "aria-labelledby": ariaLabelledBy,
          }),
        }
      : {
          role,
          tabIndex,
          "aria-labelledby": ariaLabelledBy,
          "aria-label": ariaLabel,
        };

    const contextValue = useMemo(
      () => ({ id: tableId, setId: setTableId, labelledBy, setLabelledBy }),
      [tableId, labelledBy],
    );

    return (
      <TableContext.Provider value={contextValue}>
        <div
          ref={handleRef}
          className={clsx(withTableBaseName("container"), className)}
          {...overflowProps}
          {...rest}
        >
          {children}
        </div>
      </TableContext.Provider>
    );
  },
);
