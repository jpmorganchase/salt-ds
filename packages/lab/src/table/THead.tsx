import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { withTableBaseName } from "./Table";

import tableCss from "./Table.css";

export type THeadProps = ComponentPropsWithoutRef<"thead"> & {
  sticky?: boolean;
};

export const THead = forwardRef<HTMLTableSectionElement, THeadProps>(
  function THead({ children, className, sticky, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-table-thead",
      css: tableCss,
      window: targetWindow,
    });

    return (
      <thead
        ref={ref}
        className={clsx(
          withTableBaseName("thead"),
          { [withTableBaseName("thead-sticky")]: sticky },
          className,
        )}
        {...rest}
      >
        {children}
      </thead>
    );
  },
);
