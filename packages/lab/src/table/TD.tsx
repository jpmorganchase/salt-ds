import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { withTableBaseName } from "./Table";

import tableCss from "./Table.css";

export interface TDProps extends ComponentPropsWithoutRef<"td"> {}

export const TD = forwardRef<HTMLTableCellElement, TDProps>(function TD(
  { children, className, ...rest },
  ref,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-table-td",
    css: tableCss,
    window: targetWindow,
  });

  return (
    <td
      ref={ref}
      className={clsx(withTableBaseName("td"), className)}
      {...rest}
    >
      {children}
    </td>
  );
});
