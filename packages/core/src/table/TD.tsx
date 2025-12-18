import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { withTableBaseName } from "./Table";

import tableCss from "./Table.css";

export interface TDProps extends ComponentPropsWithoutRef<"td"> {
  /**
   * Specifies the alignment of the text within the `TD`.
   *
   * @default "left"
   */
  textAlign?: "left" | "right";
}

export const TD = forwardRef<HTMLTableCellElement, TDProps>(function TD(
  { children, className, textAlign = "left", ...rest },
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
      className={clsx(
        withTableBaseName("td"),
        withTableBaseName("td", "align", textAlign),
        className,
      )}
      {...rest}
    >
      {children}
    </td>
  );
});
