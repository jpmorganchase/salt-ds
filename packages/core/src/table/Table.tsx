import {
  useComponentCssInjection,
  useComponentDefaults,
} from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer, useId, useIsomorphicLayoutEffect } from "../utils";

import tableCss from "./Table.css";
import { useTable } from "./TableContext";

export interface TableProps extends ComponentPropsWithoutRef<"table"> {
  /**
   * The styling variant.
   * @default "primary"
   */
  variant?: "primary" | "secondary" | "tertiary";
  /**
   * The styling variant of the dividers.
   * @default "tertiary"
   */
  divider?: "primary" | "secondary" | "tertiary" | "none";
  /**
   * If `true`, the table has zebra styling, which applies a different fill to
   * every other row.
   */
  zebra?: boolean;
}

export const withTableBaseName = makePrefixer("saltTable");

export const Table = forwardRef<HTMLTableElement, TableProps>(
  function Table(props, ref) {
    const { props: propsWithDefaults, rootDataAttributes } =
      useComponentDefaults("saltTable", props);

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
    } = propsWithDefaults;

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
          withTableBaseName(),
          {
            [withTableBaseName(variant)]: variant,
            [withTableBaseName("zebra")]: zebra,
            [withTableBaseName(`divider-${divider}`)]: divider,
          },
          className,
        )}
        aria-labelledby={labelledBy}
        ref={ref}
        {...rest}
        {...rootDataAttributes}
      >
        {children}
      </table>
    );
  },
);
