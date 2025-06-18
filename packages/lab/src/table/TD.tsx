import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import {
  type CSSProperties,
  type ComponentPropsWithoutRef,
  forwardRef,
} from "react";
import { withTableBaseName } from "./Table";

import tableCss from "./Table.css";

export type TDProps = ComponentPropsWithoutRef<"td"> & {
  /**
   * Overflow wrap styling for the cell.
   * @default anywhere
   */
  overflowWrap?: CSSProperties["overflowWrap"];
};

export const TD = forwardRef<HTMLTableCellElement, TDProps>(function TD(
  { children, className, overflowWrap = "anywhere", style, ...rest },
  ref,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-table-td",
    css: tableCss,
    window: targetWindow,
  });

  const tdStyles = {
    ...style,
    overflowWrap,
  };

  return (
    <td
      ref={ref}
      className={clsx(withTableBaseName("td"), className)}
      style={tdStyles}
      {...rest}
    >
      {children}
    </td>
  );
});
