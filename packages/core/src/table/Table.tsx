import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { useId, useIsomorphicLayoutEffect } from "../utils";
import { withTableBaseName as withBaseName } from "./internal/withTableBaseName";
import tableCss from "./Table.css";
import { useTable } from "./TableContext";

export interface TableProps extends ComponentPropsWithoutRef<"table"> {
  /**
   * Styling variant. Defaults to "primary".
   * @default primary
   */
  variant?: "primary" | "secondary" | "tertiary";
  /**
   * Divider styling variant. Defaults to "tertiary";
   * @default tertiary
   */
  divider?: "primary" | "secondary" | "tertiary" | "none";
  /**
   * Zebra styling. Applies a different fill to every other row.
   * @default false
   */
  zebra?: boolean;
}

/**
 * @deprecated since 1.76.0. It's internal and will be removed in a future major version.
 */
export const withTableBaseName = withBaseName;

export const Table = forwardRef<HTMLTableElement, TableProps>(
  function Table(props, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-table",
      css: tableCss,
      window: targetWindow,
    });

    const {
      children,
      className,
      variant = "primary",
      divider = "tertiary",
      zebra = false,
      "aria-labelledby": ariaLabelledBy,
      id,
      ...rest
    } = props;

    const tableId = useId(id);
    const { setId, setLabelledBy } = useTable();
    const labelledBy = ariaLabelledBy ?? tableId;

    useIsomorphicLayoutEffect(() => {
      if (tableId) {
        setId(tableId);
      }
      if (labelledBy) {
        setLabelledBy(labelledBy);
      }
    }, [tableId, labelledBy, setId, setLabelledBy]);

    return (
      <table
        id={tableId}
        className={clsx(
          withBaseName(),
          {
            [withBaseName(variant)]: variant,
            [withBaseName("zebra")]: zebra,
            [withBaseName(`divider-${divider}`)]: divider,
          },
          className,
        )}
        aria-labelledby={labelledBy}
        ref={ref}
        {...rest}
      >
        {children}
      </table>
    );
  },
);
