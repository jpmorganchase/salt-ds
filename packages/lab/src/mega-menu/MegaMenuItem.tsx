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
   * A unique value identifying this item. Used for tracking the selected item.
   * When omitted, this item will not participate in selected/active state tracking.
   */
  value?: string;
  /**
   * Whether selecting this item closes the mega menu.
   * @default true
   */
  closeOnSelect?: boolean;
  /**
   * Navigation URL for the menu item. If provided, renders as a link.
   * If omitted, renders as a button for action items.
   */
  href?: string;
}

export const MegaMenuItem = forwardRef<HTMLLIElement, MegaMenuItemProps>(
  function MegaMenuItem(
    { children, className, value, closeOnSelect = true, href, ...rest },
    ref,
  ) {
    const targetWindow = useWindow();
    const megaMenu = useMegaMenu();

    useComponentCssInjection({
      testId: "salt-mega-menu-item",
      css: megaMenuItemCss,
      window: targetWindow,
    });

    const isSelected = value != null && megaMenu.selectedItem === value;

    const baseProps = {
      className: clsx(
        withBaseName(),
        { [withBaseName("active")]: isSelected },
        className,
      ),
      tabIndex: 0,
      "data-mega-menu-item": "",
      ...(isSelected && { "aria-current": "page" as const }),
    };

    const handleClick = (event: MouseEvent<HTMLLIElement>) => {
      rest.onClick?.(event);
      if (value != null) {
        megaMenu.setSelectedItem(value);
      }
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
        <a href={href ?? "#"} {...baseProps}>
          {children}
        </a>
      </li>
    );
  },
);
