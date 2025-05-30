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

export type THProps = ComponentPropsWithoutRef<"th"> & {
  textOverflow?: CSSProperties["textOverflow"];
};

export const TH = forwardRef<HTMLTableCellElement, THProps>(function TH(
  { children, className, textOverflow, style, ...rest },
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
    textOverflow: textOverflow,
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
