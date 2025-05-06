import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

import tableCss from "./Table.css";

export type TableProps = ComponentPropsWithoutRef<"table"> & {
  variant?: "primary" | "secondary" | "zebra";
};

export const withTableBaseName = makePrefixer("saltTable");

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { children, className, variant = "primary", ...rest },
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
        },
        className,
      )}
      {...rest}
    >
      {children}
    </table>
  );
});
