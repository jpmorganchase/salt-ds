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

export interface THProps extends ComponentPropsWithoutRef<"th"> {
  /**
   * Styling for the header cell text overflow.
   * @default ellipsis
   */
  textOverflow?: CSSProperties["textOverflow"];
}

export const TH = forwardRef<HTMLTableCellElement, THProps>(function TH(
  { children, className, textOverflow = "ellipsis", style, ...rest },
  ref,
) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-table-th",
    css: tableCss,
    window: targetWindow,
  });

  const thStyles = {
    ...style,
    textOverflow,
  };

  return (
    <th
      ref={ref}
      className={clsx(withTableBaseName("th"), className)}
      style={thStyles}
      {...rest}
    >
      {children}
    </th>
  );
});
