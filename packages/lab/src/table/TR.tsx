import clsx from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import tableCss from "./Table.css";

const withBaseName = makePrefixer("saltTable-tr");

export type TRProps = ComponentPropsWithoutRef<"tr">;

export const TR = forwardRef<HTMLTableRowElement, TRProps>(
  function TR({ children, className, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-table-tr",
    css: tableCss,
    window: targetWindow,
  });
    
    return (
      <tr
        ref={ref} 
        className={clsx(withBaseName(), className)}
        {...rest}
      >
        {children}
      </tr>
    );
  },
);
