import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { withTableBaseName } from "./Table";

import tableCss from "./Table.css";

export interface TDProps extends ComponentPropsWithoutRef<"td"> {
  /**
   * Apply text truncation by mentioning number of rows to be displayed
   */
  maxRows?: number;
}

export const TD = forwardRef<HTMLTableCellElement, TDProps>(function TD(
  { children, className, maxRows, style: styleProp, ...rest },
  ref,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-table-td",
    css: tableCss,
    window: targetWindow,
  });

  const style = { "--table-td-max-rows": maxRows, ...styleProp };

  return (
    <td
      ref={ref}
      className={clsx(
        withTableBaseName("td"),
        { [withTableBaseName("td", "lineClamp")]: maxRows },
        className,
      )}
      style={style}
      {...rest}
    >
      {children}
    </td>
  );
});
