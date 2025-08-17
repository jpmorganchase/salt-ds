import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { withTableBaseName } from "./Table";

import tableCss from "./Table.css";

export interface TRProps extends ComponentPropsWithoutRef<"tr"> {}

export const TR = forwardRef<HTMLTableRowElement, TRProps>(function TR(
  { children, className, ...rest },
  ref,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-table-tr",
    css: tableCss,
    window: targetWindow,
  });

  return (
    <tr
      ref={ref}
      className={clsx(withTableBaseName("tr"), className)}
      {...rest}
    >
      {children}
    </tr>
  );
});
