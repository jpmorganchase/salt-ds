import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { clsx } from "clsx";
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
  type SyntheticEvent,
  useMemo,
} from "react";
import { makePrefixer, useId } from "../utils";
import menuGroupCss from "./MenuGroup.css";
import { MenuGroupContext, useMenuGroupSelection } from "./MenuGroupContext";

export interface MenuGroupProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * Menus to be rendered inside the menu group.
   */
  children?: ReactNode;
  /**
   * If `true`, selecting a menu item closes the menu. If `false`, the menu stays open.
   * When not set, clicking closes the menu for "single" selection but not for "multiple" selection, Enter always closes the menu and Space never does.
   * Only applies when `selectionVariant` is "single" or "multiple".
   */
  closeOnSelect?: boolean;
  /**
   * The label of the menu group.
   */
  label?: string;
  /**
   * Callback fired when the selection changes.
   * @param event
   * @param newSelected The new selected values.
   */
  onSelectionChange?: (event: SyntheticEvent, newSelected: string[]) => void;
  /**
   * The values of the selected menu items. Required when `selectionVariant` is "single" or "multiple".
   */
  selected?: string[];
  /**
   * Selection variant of the menu group. If "single", the menu items inside behave like radio buttons. If "multiple", they behave like checkboxes. Each selectable menu item needs a `value`. Defaults to "none".
   */
  selectionVariant?: "none" | "single" | "multiple";
}

const withBaseName = makePrefixer("saltMenuGroup");

export const MenuGroup = forwardRef<HTMLDivElement, MenuGroupProps>(
  function MenuGroup(props, ref) {
    const {
      className,
      children,
      closeOnSelect,
      label,
      onSelectionChange,
      selected,
      selectionVariant = "none",
      ...rest
    } = props;

    const targetWindow = useWindow();
    useComponentCssInjection({
      testId: "salt-menu-group",
      css: menuGroupCss,
      window: targetWindow,
    });

    const labelId = useId();

    const { isSelected, select } = useMenuGroupSelection({
      onSelectionChange,
      selected,
      selectionVariant,
    });

    const contextValue = useMemo(
      () => ({ closeOnSelect, isSelected, select, selectionVariant }),
      [closeOnSelect, isSelected, select, selectionVariant],
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
