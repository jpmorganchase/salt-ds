import clsx from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";

import tableCss from "./Table.css";

const withBaseName = makePrefixer("saltTable-th");

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
        className={clsx(withBaseName(), className)}
        {...rest}
      >
        {children}
      </th>
    );
  },
);
