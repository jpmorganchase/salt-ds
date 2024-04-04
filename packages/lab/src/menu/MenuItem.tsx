import {
  ComponentPropsWithoutRef,
  FocusEvent,
  forwardRef,
  KeyboardEvent,
  MouseEvent,
} from "react";
import { clsx } from "clsx";
import { makePrefixer, useForkRef } from "@salt-ds/core";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import { ChevronRightIcon } from "@salt-ds/icons";
import { useFloatingTree, useListItem } from "@floating-ui/react";

import menuItemCss from "./MenuItem.css";
import { useIsMenuTrigger } from "./MenuTriggerContext";
import { useMenuPanelContext } from "./MenuPanelContext";

export interface MenuItemProps extends ComponentPropsWithoutRef<"div"> {
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
          className
        )}
        role="menuitem"
        aria-disabled={disabled || undefined}
        tabIndex={active ? 0 : -1}
        {...getItemProps({
          onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
            onKeyDown?.(event);
            if (
              event.key == " " ||
              (event.key == "Enter" && !triggersSubmenu)
            ) {
              tree?.events.emit("click");
            }
          },
          onClick(event: MouseEvent<HTMLDivElement>) {
            onClick?.(event);
            if (!triggersSubmenu) {
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
          <ChevronRightIcon className={withBaseName("expandIcon")} />
        )}
      </div>
    );
  }
);
