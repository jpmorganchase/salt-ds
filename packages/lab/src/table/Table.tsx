import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import tableCss from "./Table.css";

export const TableVariantValues = ["primary", "secondary", "tertiary"] as const;
export type TableVariant = (typeof TableVariantValues)[number];

export interface TableProps extends ComponentPropsWithoutRef<"table"> {
  /**
   * Styling variant. Defaults to "primary".
   * @default primary
   */
  variant?: TableVariant;
  /**
   * Divider styling variant. Defaults to "tertiary";
   * @default secondary
   */
  divider?: "primary" | "secondary" | "tertiary" | "none";
  /**
   * Zebra styling. Applies variant to every other row.
   * @default undefined
   */
  zebra?: TableVariant;
}

export const withTableBaseName = makePrefixer("saltTable");

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  {
    children,
    className,
    variant = "primary",
    divider = "tertiary",
    zebra,
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
          [withTableBaseName(`zebra-${zebra}`)]: zebra,
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
