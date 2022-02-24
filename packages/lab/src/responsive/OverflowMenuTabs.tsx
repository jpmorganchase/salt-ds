import { forwardRef } from "react";
import cx from "classnames";
import { Button } from "@brandname/core";
import { OverflowMenuIcon } from "@brandname/icons";
import { ListSingleSelectionVariant } from "../list";
import { Dropdown, DropdownProps } from "../dropdown";
import { ManagedItem } from "./overflowTypes";

import "./OverflowMenuTabs.css";

const classBase = "uitkOverflowMenu";

export interface OverflowMenuTabsProps extends DropdownProps<ManagedItem> {
  IconComponent?: any;
  overflowOffsetLeft?: any;
  source: ManagedItem[];
}

export const OverflowMenuTabs = forwardRef<
  HTMLDivElement,
  OverflowMenuTabsProps
>(function OverflowMenu(
  {
    "aria-label": ariaLabel = "toggle overflow",
    className,
    IconComponent = OverflowMenuIcon,
    overflowOffsetLeft: left,
    source = [],
    ...rest
  },
  ref
) {
  return source.length > 0 ? (
    <Dropdown<ManagedItem, ListSingleSelectionVariant>
      {...rest}
      className={cx(`${classBase}`, className)}
      ListProps={{
        width: 200,
      }}
      ref={ref}
      source={source}
      width="auto"
    >
      {({
        DropdownButtonProps: {
          ariaHideOptionRole,
          fullWidth,
          IconComponent: _1,
          iconSize,
          isOpen: _2,
          label,
          labelId,
          ...buttonProps
        },
        isOpen,
      }) => {
        return (
          <Button
            {...buttonProps}
            // 'aria-expanded': menuOpen, // do we use this or isOpen ?
            data-testid="dropdown-button"
            aria-label={ariaLabel}
            aria-haspopup={true}
            className={cx(`${classBase}-dropdown`, {
              [`${classBase}-open`]: isOpen,
            })}
            title="Overflow Menu"
            variant="secondary"
          >
            <IconComponent className={`${classBase}-icon`} size={iconSize} />
          </Button>
        );
      }}
    </Dropdown>
  ) : null;
});
