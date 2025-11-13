import { useFloatingTree, useListItem } from "@floating-ui/react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  type FocusEvent,
  forwardRef,
  type KeyboardEvent,
  type MouseEvent,
  useEffect,
} from "react";
import { useIcon } from "../semantic-icon-provider";
import { makePrefixer, useForkRef } from "../utils";
import { useMenuContext } from "./MenuContext";
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
    const { setTriggerDisabled } = useMenuContext();
    const { ExpandGroupIcon } = useIcon();
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

    useEffect(() => {
      setTriggerDisabled(!!disabled);
    }, [disabled, setTriggerDisabled]);

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
              (event.key === " " || event.key === "Enter") &&
              !triggersSubmenu &&
              !disabled
            ) {
              event.preventDefault();
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
            if (!disabled) {
              onClick?.(event);
              if (!triggersSubmenu) {
                tree?.events.emit("click");
              }
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
          <ExpandGroupIcon className={withBaseName("expandIcon")} aria-hidden />
        )}
      </div>
    );
  },
);
