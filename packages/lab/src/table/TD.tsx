import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import clsx from "clsx";
import { type ComponentPropsWithoutRef, CSSProperties, forwardRef } from "react";
import { withTableBaseName } from "./Table";

import tableCss from "./Table.css";

export type TDProps = ComponentPropsWithoutRef<"td"> & { overflowWrap?: CSSProperties['overflowWrap'] };

export const TD = forwardRef<HTMLTableCellElement, TDProps>(function TD(
  { children, className, overflowWrap, style, ...rest },
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
    "overflowWrap": overflowWrap,
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
