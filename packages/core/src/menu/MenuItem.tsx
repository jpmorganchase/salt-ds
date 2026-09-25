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
  useRef,
} from "react";
import { CheckboxIcon } from "../checkbox";
import { RadioButtonIcon } from "../radio-button";
import { useIcon } from "../semantic-icon-provider";
import { makePrefixer, useForkRef } from "../utils";
import { useMenuContext } from "./MenuContext";
import { useMenuGroup } from "./MenuGroupContext";
import menuItemCss from "./MenuItem.css";
import { useMenuPanelContext } from "./MenuPanelContext";
import { useIsMenuTrigger } from "./MenuTriggerContext";
export interface MenuItemProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * If `true`, the item will be disabled.
   */
  disabled?: boolean;
  /**
   * The value of the item. Identifies the item inside a `MenuGroup` whose `selectionVariant` is "single" or "multiple".
   */
  value?: string;
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
      value,
      ...rest
    } = props;

    const { triggersSubmenu, blurActive } = useIsMenuTrigger();
    const { setTriggerDisabled } = useMenuContext();
    const { ExpandGroupIcon } = useIcon();
    const { activeIndex, getItemProps, setFocusInside } = useMenuPanelContext();
    const { closeOnSelect, isSelected, select, selectionVariant } =
      useMenuGroup();
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
    const activationKeyRef = useRef<string | null>(null);

    const insideSelectableGroup =
      selectionVariant !== "none" && !triggersSubmenu;
    const selectable = insideSelectableGroup && value !== undefined;
    const selected = selectable && isSelected(value);

    useEffect(() => {
      setTriggerDisabled(!!disabled);
    }, [disabled, setTriggerDisabled]);

    useEffect(() => {
      if (process.env.NODE_ENV !== "production") {
        if (insideSelectableGroup && value === undefined) {
          console.warn(
            "Salt: MenuItem requires a `value` to be selectable inside a MenuGroup with `selectionVariant` set. It will behave as a regular menu item.",
          );
        }
      }
    }, [insideSelectableGroup, value]);

    const shouldCloseMenu = () => {
      if (!selectable) {
        return true;
      }
      if (closeOnSelect !== undefined) {
        return closeOnSelect;
      }
      if (activationKeyRef.current === "Enter") {
        return true;
      }
      if (activationKeyRef.current === " ") {
        return false;
      }
      return selectionVariant === "single";
    };

    let role = "menuitem";
    if (selectable) {
      role =
        selectionVariant === "single" ? "menuitemradio" : "menuitemcheckbox";
    }

    return (
      // biome-ignore lint/a11y/useAriaPropsSupportedByRole: Biome can't detect the role provided by the role variable. aria-checked is only used when the role is appropriate.
      <div
        className={clsx(
          withBaseName(),
          {
            [withBaseName("blurActive")]: blurActive,
          },
          className,
        )}
        role={role}
        aria-checked={selectable ? selected : undefined}
        aria-disabled={disabled || undefined}
        {...getItemProps({
          tabIndex: disabled ? undefined : active ? 0 : -1,
          onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
            const element = event.currentTarget;
            const { key } = event;
            onKeyDown?.(event);
            if (
              (key === " " || key === "Enter") &&
              !triggersSubmenu &&
              !disabled
            ) {
              event.preventDefault();
              const { view, ...eventInit } = event;
              queueMicrotask(() => {
                activationKeyRef.current = key;
                element.dispatchEvent(
                  new window.MouseEvent("click", eventInit),
                );
                activationKeyRef.current = null;
              });
            }
          },
          onClick(event: MouseEvent<HTMLDivElement>) {
            if (!disabled) {
              if (selectable) {
                select(event, value);
              }
              onClick?.(event);
              if (!triggersSubmenu && shouldCloseMenu()) {
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
        {selectable && selectionVariant === "single" && (
          <RadioButtonIcon
            checked={selected}
            className={withBaseName("selectionIcon")}
          />
        )}
        {selectable && selectionVariant === "multiple" && (
          <CheckboxIcon
            checked={selected}
            className={withBaseName("selectionIcon")}
          />
        )}
        {children}
        {triggersSubmenu && (
          <ExpandGroupIcon className={withBaseName("expandIcon")} aria-hidden />
        )}
      </div>
    );
  },
);
