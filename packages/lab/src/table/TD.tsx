import clsx from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import tableCss from "./Table.css";

const withBaseName = makePrefixer("saltTable-td");

export type TDProps = ComponentPropsWithoutRef<"td">;

export const TD = forwardRef<HTMLTableCellElement, TDProps>(
  function TD({ children, className, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-table-td",
    css: tableCss,
    window: targetWindow,
  });
    
    return (
      <td
        ref={ref} 
        className={clsx(withBaseName(), className)}
        {...rest}
      >
        {children}
      </td>
    );
  },
);
