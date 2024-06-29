import { useFloatingTree, useListItem } from "@floating-ui/react";
import { ChevronRightIcon } from "@salt-ds/icons";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  forwardRef,
} from "react";
import { makePrefixer, useForkRef } from "../utils";

import menuItemCss from "./MenuItem.css";
import { useMenuPanelContext } from "./MenuPanelContext";
import { useIsMenuTrigger } from "./MenuTriggerContext";

export interface MenuItemProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * If `true`, the item will be disabled.
   */
  disabled?: boolean;
}

const withBaseName = makePrefixer("saltMenuItem");

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  function MenuItem(props, ref) {
    const {
      children,
      className,
      disabled,
      onClick,
      onFocus,
      onKeyDown,
      ...rest
    } = props;

    const { triggersSubmenu, blurActive } = useIsMenuTrigger();
    const { activeIndex, getItemProps, setFocusInside } = useMenuPanelContext();
    const item = useListItem();
    const tree = useFloatingTree();
    const active = item.index === activeIndex;
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-menu-item",
      css: menuItemCss,
      window: targetWindow,
    });
    const handleRef = useForkRef<HTMLDivElement>(ref, item.ref);
    return (
      <div
        className={clsx(
          withBaseName(),
          {
            [withBaseName("blurActive")]: blurActive,
          },
          className,
        )}
        role="menuitem"
        aria-disabled={disabled || undefined}
        {...getItemProps({
          tabIndex: disabled ? undefined : active ? 0 : -1,
          onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
            const element = event.currentTarget;
            onKeyDown?.(event);
            if (
              (event.key == " " || event.key == "Enter") &&
              !triggersSubmenu &&
              !disabled
            ) {
              event.preventDefault();
              // eslint-disable-next-line @typescript-eslint/no-unused-vars -- view is unused.
              const { view, ...eventInit } = event;
              queueMicrotask(() => {
                element.dispatchEvent(
                  new window.MouseEvent("click", eventInit),
                );
              });
              tree?.events.emit("click");
            }
          },
          onClick(event: MouseEvent<HTMLDivElement>) {
            onClick?.(event);
            if (!triggersSubmenu && !disabled) {
              tree?.events.emit("click");
            }
          },
          onFocus(event: FocusEvent<HTMLDivElement>) {
            onFocus?.(event);
            setFocusInside(true);
          },
          ...rest,
        })}
        ref={handleRef}
      >
        {children}
        {triggersSubmenu && (
          <ChevronRightIcon
            className={withBaseName("expandIcon")}
            aria-hidden
          />
        )}
      </div>
    );
  },
);
