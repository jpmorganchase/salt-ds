import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { withTableBaseName } from "./Table";

import tableCss from "./Table.css";

export type TFootProps = ComponentPropsWithoutRef<"tfoot"> & {
  /**
   * If footer is positioned with sticky styling.
   * @default undefined
   */
  sticky?: boolean;
  /**
   * Divider styling variant. Defaults to "tertiary";
   * @default primary
   */
  divider?: "primary" | "secondary" | "tertiary" | "none";
  /**
   * Styling variant for footer.
   * If undefined, will match variant of parent Table variant.
   * @default undefined
   */
  variant?: "primary" | "secondary" | "tertiary";
};

export const TFoot = forwardRef<HTMLTableSectionElement, TFootProps>(
  function TFoot(
    { children, className, sticky, variant, divider = "tertiary", ...rest },
    ref,
  ) {
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
          { [withTableBaseName(`tfoot-${variant}`)]: variant },
          { [withTableBaseName("tfoot-sticky")]: sticky },
          { [withTableBaseName(`tfoot-divider-${divider}`)]: divider },
          className,
        )}
        {...rest}
      >
        {children}
      </tfoot>
    );
  },
);
