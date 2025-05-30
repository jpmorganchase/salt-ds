import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { withTableBaseName } from "./Table";

import tableCss from "./Table.css";

export type TFootProps = ComponentPropsWithoutRef<"tfoot"> & {
  sticky?: boolean;
};

export const TFoot = forwardRef<HTMLTableSectionElement, TFootProps>(
  function TFoot({ children, className, sticky, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-table-tfoot",
      css: tableCss,
      window: targetWindow,
    });

    return (
      <tfoot
        ref={ref}
        className={clsx(
          withTableBaseName("tfoot"),
          { [withTableBaseName("tfoot-sticky")]: sticky },
          className,
        )}
        {...rest}
      >
        {children}
      </tfoot>
    );
  },
);
