import {
  useComponentCssInjection,
  useComponentDefaults,
} from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { withTableBaseName } from "./Table";

import tableCss from "./Table.css";

export interface THeadProps extends ComponentPropsWithoutRef<"thead"> {
  /**
   * If `true`, the header is positioned with sticky styling, so it stays at
   * the top when the table scrolls.
   */
  sticky?: boolean;
  /**
   * The styling variant of the divider.
   * @default "primary"
   */
  divider?: "primary" | "secondary" | "tertiary" | "none";
  /**
   * The styling variant of the header. When not set, it matches the `Table`'s
   * `variant`.
   */
  variant?: "primary" | "secondary" | "tertiary";
}

export const THead = forwardRef<HTMLTableSectionElement, THeadProps>(
  function THead(props, ref) {
    const { props: propsWithDefaults, rootDataAttributes } =
      useComponentDefaults("saltTHead", props);
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
        {...rootDataAttributes}
      >
        {children}
      </thead>
    );
  },
);
