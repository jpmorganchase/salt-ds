import { useIcon } from "@salt-ds/core";
import {
  Children,
  type Component,
  isValidElement,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
} from "react";
import type { CascadingMenuProps, MenuDescriptor } from "../../cascading-menu";
import { MenuButton, type MenuButtonProps } from "../../menu-button";
import type { BreadcrumbProps } from "../Breadcrumb";
import { useFocusMenuRemount } from "./useFocusMenuRemount";

export interface BreadcrumbsCollapsedProps
  extends Omit<MenuButtonProps, "CascadingMenuProps"> {
  CascadingMenuProps?: CascadingMenuProps;
  accessibleText?: string;
  children: ReactNode;
  className?: string;
}

export const BreadcrumbsCollapsed = ({
  children,
  CascadingMenuProps,
  accessibleText,
  ...rest
}: BreadcrumbsCollapsedProps) => {
  const keys = Children.map(children, (child) => {
    if (isValidElement(child)) {
      return child.key;
    }
    return "";
  });

  const { OverflowIcon } = useIcon();
  const key = keys ? keys.join("") : "";
  const { ref, shouldFocusOnMount } =
    useFocusMenuRemount<HTMLButtonElement>(key);

  const itemToString = useCallback((child: Component<BreadcrumbProps>) => {
    if (!child) {
      return "";
    }
    const { overflowLabel, tooltipText, children } = child.props;
    return overflowLabel || tooltipText || String(children);
  }, []);

  const onItemClick = useCallback(
    (sourceItem: MenuDescriptor, event: MouseEvent | KeyboardEvent): void => {
      shouldFocusOnMount.current = true;
    },
    [shouldFocusOnMount],
  );

  const menuItems: MenuDescriptor[] = [];
  Children.forEach(children, (x) => {
    if (isValidElement(x)) {
      menuItems.push({ props: x.props } as MenuDescriptor);
    }
  });

  return (
    <MenuButton
      CascadingMenuProps={{
        initialSource: {
          // Only `props` is required for `itemToString`. Otherwise causing circular JSON conversion in useControlled.js
          // This is not reproducible in unit tests, where react / react-dom is partially mocked without circular reference
          menuItems,
        },
        itemToString,
        onItemClick,
        minWidth: 0,
        ...CascadingMenuProps,
      }}
      hideCaret
      {...rest}
      ref={ref}
    >
      <OverflowIcon />
    </MenuButton>
  );
};
