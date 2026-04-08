import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import megaMenuItemCss from "./MegaMenuItem.css";

const withBaseName = makePrefixer("saltMegaMenuItem");

export interface MegaMenuItemProps extends HTMLAttributes<HTMLLIElement> {
  /**
   * The content of the mega menu item.
   */
  children?: ReactNode;
}

export const MegaMenuItem = forwardRef<HTMLLIElement, MegaMenuItemProps>(
  function MegaMenuItem({ children, className, ...rest }, ref) {
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-mega-menu-item",
      css: megaMenuItemCss,
      window: targetWindow,
    });

    return (
      <li
        className={clsx(withBaseName(), className)}
        ref={ref}
        tabIndex={0}
        {...rest}
      >
        {children}
      </li>
    );
  },
);
