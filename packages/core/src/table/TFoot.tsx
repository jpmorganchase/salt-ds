import {
  useComponentCssInjection,
  useComponentDefaults,
} from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { withTableBaseName } from "./Table";

import tableCss from "./Table.css";

export interface TFootProps extends ComponentPropsWithoutRef<"tfoot"> {
  /**
   * If `true`, the footer is positioned with sticky styling, so it stays at
   * the bottom when the table scrolls.
   */
  sticky?: boolean;
  /**
   * The styling variant of the divider.
   * @default "primary"
   */
  divider?: "primary" | "secondary" | "tertiary" | "none";
  /**
   * The styling variant of the footer. When not set, it matches the `Table`'s
   * `variant`.
   */
  variant?: "primary" | "secondary" | "tertiary";
}

export const TFoot = forwardRef<HTMLTableSectionElement, TFootProps>(
  function TFoot(props, ref) {
    const { props: propsWithDefaults, rootDataAttributes } =
      useComponentDefaults("saltTFoot", props);
    const {
      children,
      className,
      sticky = false,
      variant,
      divider = "primary",
      ...rest
    } = propsWithDefaults;

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
        {...rootDataAttributes}
      >
        {children}
      </tfoot>
    );
  },
);
