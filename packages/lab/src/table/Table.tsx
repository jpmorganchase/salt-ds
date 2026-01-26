import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import tableCss from "./Table.css";

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

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  {
    children,
    className,
    variant = "primary",
    divider = "tertiary",
    zebra = false,
    ...rest
  },
  ref,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-table",
    css: tableCss,
    window: targetWindow,
  });

  return (
    <table
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
});
