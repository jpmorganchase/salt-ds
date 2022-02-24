import React, {
  Children,
  FC,
  isValidElement,
  ReactNode,
  useCallback,
} from "react";
import { OverflowMenuIcon } from "@brandname/icons";
import { CascadingMenuProps, MenuDescriptor } from "../../cascading-menu";
import { useFocusMenuRemount } from "./useFocusMenuRemount";
import { MenuButton } from "../../menu-button";

export interface BreadcrumbsCollapsedProps {
  cascadingMenuProps?: CascadingMenuProps;
  accessibleText?: string;
  children: ReactNode;
  className?: string;
}

export const BreadcrumbsCollapsed: FC<BreadcrumbsCollapsedProps> = ({
  children,
  cascadingMenuProps,
  accessibleText,
  ...rest
}) => {
  const keys = Children.map(children, (child) => {
    if (isValidElement(child)) {
      return child.key;
    }
    return "";
  });

  const key = keys ? keys.join("") : "";
  const { ref, shouldFocusOnMount } =
    useFocusMenuRemount<HTMLButtonElement>(key);

  const itemToString = useCallback((child) => {
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
    [shouldFocusOnMount]
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
        ...cascadingMenuProps,
      }}
      hideCaret
      {...rest}
      ref={ref}
    >
      <OverflowMenuIcon />
    </MenuButton>
  );
};
