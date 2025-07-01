import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import tableCss from "./Table.css";

export type TableProps = ComponentPropsWithoutRef<"table"> & {
  /**
   * Styling variant. Defaults to "primary".
   * @default primary
   */
  variant?: "primary" | "secondary" | "tertiary";
  /**
   * Zebra styling. Applies variant to every other row.
   * @default undefined
   */
  zebra?: "primary" | "secondary" | "tertiary";
};

export const withTableBaseName = makePrefixer("saltTable");

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { children, className, variant = "primary", zebra = undefined, ...rest },
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
        },
        className,
      )}
      {...rest}
    >
      {children}
    </table>
  );
});
