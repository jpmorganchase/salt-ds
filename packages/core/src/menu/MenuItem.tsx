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
  useState,
} from "react";
import { CheckboxIcon } from "../checkbox";
import { RadioButtonIcon } from "../radio-button";
import { useIcon } from "../semantic-icon-provider";
import { makePrefixer, useForkRef, useIsomorphicLayoutEffect } from "../utils";
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

const leadingSlotClassNames = [
  withBaseName("selectionIcon"),
  withBaseName("selectionIconPlaceholder"),
  withBaseName("iconPlaceholder"),
];

function hasLeadingIcon(item: HTMLElement | null) {
  for (const node of Array.from(item?.childNodes ?? [])) {
    if (node.nodeType === node.TEXT_NODE) {
      if (node.textContent?.trim()) {
        return false;
      }
    } else if (node.nodeType === node.ELEMENT_NODE) {
      const { classList } = node as Element;
      if (
        !leadingSlotClassNames.some((className) =>
          classList.contains(className),
        )
      ) {
        return classList.contains("saltIcon");
      }
    }
  }
  return false;
}

let missingValueWarningShown = false;

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
    const {
      activeIndex,
      getItemProps,
      setFocusInside,
      reserveIconSpace,
      reserveSelectionIconSpace,
      registerIcon,
      registerSelectionIcon,
    } = useMenuPanelContext();
    const { isSelected, select, selectionVariant } = useMenuGroup();
    const item = useListItem();
    const tree = useFloatingTree();
    const active = item.index === activeIndex;
    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-menu-item",
      css: menuItemCss,
      window: targetWindow,
    });
    const itemRef = useRef<HTMLDivElement>(null);
    const listItemRef = useForkRef<HTMLDivElement>(item.ref, itemRef);
    const handleRef = useForkRef<HTMLDivElement>(ref, listItemRef);
    const activationKeyRef = useRef<string | null>(null);
    const [hasIcon, setHasIcon] = useState(false);

    const insideSelectableGroup =
      selectionVariant !== "none" && !triggersSubmenu;
    const selectable = insideSelectableGroup && value !== undefined;
    const selected = selectable && isSelected(value);

    useIsomorphicLayoutEffect(() => {
      setHasIcon(hasLeadingIcon(itemRef.current));
    });

    useIsomorphicLayoutEffect(
      () => (hasIcon ? registerIcon() : undefined),
      [hasIcon, registerIcon],
    );

    useIsomorphicLayoutEffect(
      () => (selectable ? registerSelectionIcon() : undefined),
      [selectable, registerSelectionIcon],
    );

    useEffect(() => {
      if (triggersSubmenu) {
        setTriggerDisabled(!!disabled);
      }
    }, [disabled, setTriggerDisabled, triggersSubmenu]);

    useEffect(() => {
      if (process.env.NODE_ENV !== "production") {
        if (
          insideSelectableGroup &&
          value === undefined &&
          !missingValueWarningShown
        ) {
          missingValueWarningShown = true;
          console.warn(
            "Salt: MenuItem requires a `value` to be selectable inside a MenuGroup with `selectionVariant` set. It will behave as a regular menu item.",
          );
        }
      }
    }, [insideSelectableGroup, value]);

    const shouldCloseMenu = () =>
      !selectable || activationKeyRef.current === "Enter";

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
          tabIndex: active ? 0 : -1,
          onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
            const element = event.currentTarget;
            const { key } = event;
            onKeyDown?.(event);
            if ((key === " " || key === "Enter") && !triggersSubmenu) {
              event.preventDefault();
              if (disabled || event.repeat) {
                return;
              }
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
        {reserveSelectionIconSpace && !selectable && (
          <span
            aria-hidden
            className={withBaseName("selectionIconPlaceholder")}
          />
        )}
        {reserveIconSpace && !hasIcon && (
          <span aria-hidden className={withBaseName("iconPlaceholder")} />
        )}
        {children}
        {triggersSubmenu && (
          <ExpandGroupIcon className={withBaseName("expandIcon")} aria-hidden />
        )}
      </div>
    );
  },
);
