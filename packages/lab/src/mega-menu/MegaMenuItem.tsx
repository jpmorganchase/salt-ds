import { useListItem } from "@floating-ui/react";
import { makePrefixer, useForkRef } from "@salt-ds/core";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useContext,
} from "react";
import { MegaMenuContext } from "./MegaMenuContext";
import megaMenuItemCss from "./MegaMenuItem.css";

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
}

export const MegaMenuItem = forwardRef<HTMLLIElement, MegaMenuItemProps>(
  function MegaMenuItem({ children, className, value, ...rest }, ref) {
    const targetWindow = useWindow();
    const megaMenu = useContext(MegaMenuContext);
    const { ref: listItemRef } = useListItem();
    const handleRef = useForkRef<HTMLLIElement>(ref, listItemRef);

    useComponentCssInjection({
      testId: "salt-mega-menu-item",
      css: megaMenuItemCss,
      window: targetWindow,
    });

    const isSelected = value != null && megaMenu?.selectedItem === value;

    const handleClick = (event: MouseEvent<HTMLLIElement>) => {
      rest.onClick?.(event);
      if (value != null) {
        megaMenu?.setSelectedItem(value);
      }
      megaMenu?.setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
      rest.onKeyDown?.(event);

      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        const element = event.currentTarget;
        const { view, ...eventInit } = event;
        queueMicrotask(() => {
          element.dispatchEvent(new window.MouseEvent("click", eventInit));
        });
        return;
      }
    };

    return (
      <li
        className={clsx(
          withBaseName(),
          { [withBaseName("active")]: isSelected },
          className,
        )}
        ref={handleRef}
        role={rest.role ?? "menuitem"}
        tabIndex={0}
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
