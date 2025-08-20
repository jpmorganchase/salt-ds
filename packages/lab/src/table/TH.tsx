import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { withTableBaseName } from "./Table";

import tableCss from "./Table.css";

export interface THProps extends ComponentPropsWithoutRef<"th"> {
  /**
   * Apply text truncation by mentioning number of rows to be displayed
   */
  maxRows?: number;
}

export const TH = forwardRef<HTMLTableCellElement, THProps>(function TH(
  { children, className, maxRows, style: styleProp, ...rest },
  ref,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-table-th",
    css: tableCss,
    window: targetWindow,
  });

  const style = { "--table-th-max-rows": maxRows, ...styleProp };

  return (
    <th
      ref={ref}
      className={clsx(
        withTableBaseName("th"),
        { [withTableBaseName("th", "lineClamp")]: maxRows },
        className,
      )}
      style={style}
      {...rest}
    >
      {children}
    </th>
  );
});
