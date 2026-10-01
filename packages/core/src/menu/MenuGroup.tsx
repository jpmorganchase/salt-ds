import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
  type SyntheticEvent,
  useCallback,
  useMemo,
} from "react";
import { makePrefixer, useId } from "../utils";
import menuGroupCss from "./MenuGroup.css";
import { MenuGroupContext } from "./MenuGroupContext";

interface BaseMenuGroupProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Menus to be rendered inside the menu group.
   */
  children?: ReactNode;
  /**
   * The label of the menu group.
   */
  label?: string;
  /**
   * Selection variant of the menu group. If "single", the menu items inside behave like radio buttons. If "multiple", they behave like checkboxes. Each selectable menu item needs a `value`. Defaults to "none".
   */
  selectionVariant?: "none" | "single" | "multiple";
}

interface SelectableMenuGroupProps extends BaseMenuGroupProps {
  /**
   * Callback fired when the selection changes.
   * @param event
   * @param newSelected The new selected values.
   */
  onSelectionChange?: (event: SyntheticEvent, newSelected: string[]) => void;
  /**
   * The values of the selected menu items. Required when `selectionVariant` is "single" or "multiple". The menu's content unmounts when it closes, so keep the selection in state and update it in `onSelectionChange`.
   */
  selected: string[];
  selectionVariant: "single" | "multiple";
}

interface NonSelectableMenuGroupProps extends BaseMenuGroupProps {
  selectionVariant?: "none";
}

export type MenuGroupProps =
  | SelectableMenuGroupProps
  | NonSelectableMenuGroupProps;

const withBaseName = makePrefixer("saltMenuGroup");

const noSelection: string[] = [];

export const MenuGroup = forwardRef<HTMLDivElement, MenuGroupProps>(
  function MenuGroup(props, ref) {
    const {
      className,
      children,
      label,
      onSelectionChange,
      selected: selectedProp = noSelection,
      selectionVariant = "none",
      ...rest
    } = props as BaseMenuGroupProps &
      Partial<Pick<SelectableMenuGroupProps, "onSelectionChange" | "selected">>;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-menu-group",
      css: menuGroupCss,
      window: targetWindow,
    });

    const labelId = useId();

    const selected = useMemo(
      () =>
        selectionVariant === "single" ? selectedProp.slice(0, 1) : selectedProp,
      [selectedProp, selectionVariant],
    );

    const isSelected = useCallback(
      (value: string) => selected.includes(value),
      [selected],
    );

    const select = useCallback(
      (event: SyntheticEvent, value: string) => {
        if (selectionVariant === "single") {
          if (!selected.includes(value)) {
            onSelectionChange?.(event, [value]);
          }
        } else if (selectionVariant === "multiple") {
          onSelectionChange?.(
            event,
            selected.includes(value)
              ? selected.filter((item) => item !== value)
              : selected.concat(value),
          );
        }
      },
      [onSelectionChange, selected, selectionVariant],
    );

    const contextValue = useMemo(
      () => ({ isSelected, select, selectionVariant }),
      [isSelected, select, selectionVariant],
    );

    return (
      <MenuGroupContext.Provider value={contextValue}>
        <div
          aria-labelledby={label ? labelId : undefined}
          className={clsx(withBaseName(), className)}
          role="group"
          ref={ref}
          {...rest}
        >
          {label && (
            <div aria-hidden className={withBaseName("label")} id={labelId}>
              {label}
            </div>
          )}
          {children}
        </div>
      </MenuGroupContext.Provider>
    );
  },
);
