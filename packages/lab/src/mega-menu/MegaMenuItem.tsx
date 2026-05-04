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
}

export const MegaMenuItem = forwardRef<HTMLLIElement, MegaMenuItemProps>(
  function MegaMenuItem(
    { children, className, value, closeOnSelect = true, ...rest },
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
        className={clsx(
          withBaseName(),
          { [withBaseName("active")]: isSelected },
          className,
        )}
        ref={ref}
        tabIndex={0}
        data-mega-menu-item=""
        aria-current={isSelected ? "page" : undefined}
        {...rest}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {children}
      </li>
    );
  },
);
