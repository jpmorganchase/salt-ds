import { ComponentPropsWithoutRef, forwardRef, ReactNode } from "react";
import { clsx } from "clsx";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { makePrefixer, useId } from "@salt-ds/core";
import menuGroupCss from "./MenuGroup.css";

export interface MenuGroupProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * The label of the menu group.
   */
  label?: string;
  /**
   * Menus to be rendered inside the menu group.
   */
  children?: ReactNode;
}

const withBaseName = makePrefixer("saltMenuGroup");

export const MenuGroup = forwardRef<HTMLDivElement, MenuGroupProps>(
  function MenuGroup(props, ref) {
    const { className, children, label, ...rest } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-menu-group",
      css: menuGroupCss,
      window: targetWindow,
    });

    const labelId = useId();

    return (
      <div
        aria-labelledby={label ? labelId : undefined}
        className={clsx(withBaseName(), className)}
        role="group"
        ref={ref}
        {...rest}
      >
        {label && (
          <div aria-hidden className={withBaseName("label")} id={labelId}>
            {label}
          </div>
        )}
        {children}
      </div>
    );
  }
);
