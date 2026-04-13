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
   * Defaults to the children string content if not provided.
   */
  value?: string;
}

export const MegaMenuItem = forwardRef<HTMLLIElement, MegaMenuItemProps>(
  function MegaMenuItem({ children, className, value, ...rest }, ref) {
    const targetWindow = useWindow();
    const megaMenu = useContext(MegaMenuContext);

    useComponentCssInjection({
      testId: "salt-mega-menu-item",
      css: megaMenuItemCss,
      window: targetWindow,
    });

    const itemValue =
      value ?? (typeof children === "string" ? children : undefined);
    const isSelected =
      itemValue != null && megaMenu?.selectedItem === itemValue;

    const handleClick = (event: MouseEvent<HTMLLIElement>) => {
      rest.onClick?.(event);
      if (itemValue != null) {
        megaMenu?.setSelectedItem(itemValue);
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

      if (event.key === "Tab" && !event.shiftKey) {
        const items = Array.from(
          event.currentTarget
            .closest('[role="region"]')
            ?.querySelectorAll<HTMLElement>(".saltMegaMenuItem") ?? [],
        );
        const i = items.indexOf(event.currentTarget);
        if (i === items.length - 1) {
          megaMenu?.setOpen(false);
        }
      }

      const dir =
        event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? -1
          : event.key === "ArrowDown" || event.key === "ArrowRight"
            ? 1
            : 0;

      if (dir) {
        event.preventDefault();
        const items = Array.from(
          event.currentTarget
            .closest('[role="region"]')
            ?.querySelectorAll<HTMLElement>(".saltMegaMenuItem") ?? [],
        );
        const i = items.indexOf(event.currentTarget);

        if (dir === -1 && i === 0) {
          const reference = megaMenu?.floatingRootContext.elements
            .reference as HTMLElement | null;
          if (reference) {
            const focusable =
              reference.querySelector<HTMLElement>("a, button, [tabindex]") ??
              reference;
            focusable.focus();
          }
          return;
        }

        items[(i + dir + items.length) % items.length]?.focus();
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
