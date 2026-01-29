import { makePrefixer, useId, useIsomorphicLayoutEffect } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

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
   * @default secondary
   */
  divider?: "primary" | "secondary" | "tertiary" | "none";
  /**
   * Zebra styling. Applies a different fill to every other row.
   * @default false
   */
  zebra?: boolean;
}

export const withTableBaseName = makePrefixer("saltTable");

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
      ...rest
    } = props;

    const generatedId = useId();
    const { setId, setLabelledBy } = useTable();
    const tableId = props.id ?? generatedId;
    const tableLabelledBy = props["aria-labelledby"];
    const labelledBy = tableLabelledBy ?? tableId;

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
          withTableBaseName(),
          {
            [withTableBaseName(variant)]: variant,
            [withTableBaseName("zebra")]: zebra,
            [withTableBaseName(`divider-${divider}`)]: divider,
          },
          className,
        )}
        ref={ref}
        {...rest}
      >
        {children}
      </table>
    );
  },
);
