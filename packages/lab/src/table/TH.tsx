import clsx from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { withTableBaseName } from "./Table";

import tableCss from "./Table.css";

export type THProps = ComponentPropsWithoutRef<"th">;

export const TH = forwardRef<HTMLTableCellElement, THProps>(
  function TH({ children, className, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-table-th",
    css: tableCss,
    window: targetWindow,
  });
    
    return (
      <th
        ref={ref} 
        className={clsx(withTableBaseName('th'), className)}
        {...rest}
      >
        {children}
      </th>
    );
  },
);
