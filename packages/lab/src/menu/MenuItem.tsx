import {
  ComponentPropsWithoutRef,
  forwardRef,
  MouseEvent,
  FocusEvent,
} from "react";
import { makePrefixer, useForkRef } from "@salt-ds/core";
import { clsx } from "clsx";
import { useWindow } from "@salt-ds/window";
import { useComponentCssInjection } from "@salt-ds/styles";
import menuItemCss from "./MenuItem.css";
import { ChevronRightIcon } from "@salt-ds/icons";
import { useIsMenuTrigger } from "./MenuTriggerContext";
import { useFloatingTree, useListItem } from "@floating-ui/react";
import { useMenuPanelContext } from "./MenuPanelContext";

export interface MenuItemProps extends ComponentPropsWithoutRef<"div"> {
  disabled?: boolean;
}

const withBaseName = makePrefixer("saltMenuItem");

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  function MenuItem(props, ref) {
    const { children, className, disabled, onClick, onFocus, ...rest } = props;

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
          onClick(event: MouseEvent<HTMLDivElement>) {
            onClick?.(event);
            tree?.events.emit("click");
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
