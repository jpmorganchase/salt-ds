import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { withTableBaseName } from "./Table";

import tableCss from "./Table.css";

export type THeadProps = ComponentPropsWithoutRef<"thead"> & {
  /**
   * If header is positioned with sticky styling.
   * @default undefined
   */
  sticky?: boolean;
  /**
   * Styling variant for header.
   * If undefined, will match variant of parent Table variant.
   * @default undefined
   */
  variant?: "primary" | "secondary" | "tertiary";
};

export const THead = forwardRef<HTMLTableSectionElement, THeadProps>(
  function THead({ children, className, sticky, variant, ...rest }, ref) {
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
          { [withTableBaseName(`thead-${variant}`)]: variant },
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
