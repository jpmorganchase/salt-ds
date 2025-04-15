import { clsx } from "clsx";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { withTableBaseName } from "./Table";

import tableCss from "./Table.css";

export type TableProps = ComponentPropsWithoutRef<'tfoot'>;

export const TFoot = forwardRef<HTMLTableSectionElement, TableProps>(
  function TFoot({ children, className, ...rest }, ref) {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-table-tfoot",
    css: tableCss,
    window: targetWindow,
  });

    return (
      <tfoot
        ref={ref}
        className={clsx(withTableBaseName('tfoot'), className)}
        {...rest}
    >
      {children}
    </tfoot>
  );
});
