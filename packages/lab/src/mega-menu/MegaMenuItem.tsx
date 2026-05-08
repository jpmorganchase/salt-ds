import { makePrefixer } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import megaMenuItemCss from "./MegaMenuItem.css";
import { useMegaMenu } from "./useMegaMenu";

const withBaseName = makePrefixer("saltMegaMenuItem");

export interface MegaMenuItemProps extends HTMLAttributes<HTMLLIElement> {
  /**
   * The content of the mega menu item.
   */
  children?: ReactNode;
  /**
   * Whether selecting this item closes the mega menu.
   * @default true
   */
  closeOnSelect?: boolean;
}

export const MegaMenuItem = forwardRef<HTMLLIElement, MegaMenuItemProps>(
  function MegaMenuItem(
    { children, className, closeOnSelect = true, ...rest },
    ref,
  ) {
    const targetWindow = useWindow();
    const megaMenu = useMegaMenu();

    useComponentCssInjection({
      testId: "salt-mega-menu-item",
      css: megaMenuItemCss,
      window: targetWindow,
    });

    const baseProps = {
      className: clsx(withBaseName(), className),
      tabIndex: 0,
      "data-mega-menu-item": "",
    };

    const handleClick = (event: MouseEvent<HTMLLIElement>) => {
      rest.onClick?.(event);
      if (closeOnSelect) {
        megaMenu.setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
      rest.onKeyDown?.(event);
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        event.currentTarget.click();
      }
    };

    return (
      <li
        className={withBaseName()}
        ref={ref}
        {...rest}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <a {...baseProps}>{children}</a>
      </li>
    );
  },
);
