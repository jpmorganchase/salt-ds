import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { withTableBaseName } from "./Table";

import tableCss from "./Table.css";

export const THeadVariantValues = ["primary", "secondary", "tertiary"] as const;

export interface THeadProps extends ComponentPropsWithoutRef<"thead"> {
  /**
   * If header is positioned with sticky styling.
   * @default false
   */
  sticky?: boolean;
  /**
   * Divider styling variant. Defaults to "primary";
   * @default primary
   */
  divider?: "primary" | "secondary" | "tertiary" | "none";
  /**
   * Styling variant for header.
   * If undefined, will match variant of parent Table component's variant.
   * @default undefined
   */
  variant?: "primary" | "secondary" | "tertiary" ;
}

export const THead = forwardRef<HTMLTableSectionElement, THeadProps>(
  function THead(
    { children, className, sticky = false, variant, divider = "primary", ...rest },
    ref,
  ) {
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
          { [withTableBaseName(`thead-divider-${divider}`)]: divider },
          className,
        )}
        {...rest}
      >
        {children}
      </thead>
    );
  },
);
