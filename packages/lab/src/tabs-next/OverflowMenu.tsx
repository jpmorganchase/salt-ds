import { forwardRef, ReactNode, MouseEvent, SyntheticEvent } from "react";
import {
  Button,
  useForkRef,
  Menu,
  MenuTrigger,
  MenuPanel,
  MenuItem,
  ButtonProps,
} from "@salt-ds/core";
import { OverflowMenuIcon } from "@salt-ds/icons";

import { useOverflowContext, useOverflowMenu } from "@fluentui/react-overflow";

type TabValue = {
  value: string;
  label: ReactNode;
};

export interface OverflowMenuProps extends ButtonProps {
  tabs: TabValue[];
  onItemClick?: (event: SyntheticEvent, value: string) => void;
}

export const OverflowMenu = forwardRef<HTMLButtonElement, OverflowMenuProps>(
  function OverflowMenu(props, forwardedRef) {
    const { tabs, onItemClick, ...rest } = props;
    const { ref, overflowCount, isOverflowing } =
      useOverflowMenu<HTMLButtonElement>();
    const handleRef = useForkRef(ref, forwardedRef);
    const itemVisibility = useOverflowContext(
      (context) => context.itemVisibility
    );

    const tabList = tabs.filter(({ value }) => !itemVisibility[value]);

    if (!isOverflowing) return null;

    const handleItemClick = (event: MouseEvent<HTMLDivElement>) => {
      const value = event.currentTarget.dataset.value;
      if (value) {
        onItemClick?.(event, value);
      }
    };

    return (
      <Menu>
        <MenuTrigger>
          <Button
            aria-label={`${overflowCount} more tabs`}
            variant="secondary"
            role="tab"
            ref={handleRef}
            {...rest}
          >
            <OverflowMenuIcon aria-hidden />
          </Button>
        </MenuTrigger>
        <MenuPanel>
          {tabList.map(({ value, label }) => (
            <MenuItem key={value} onClick={handleItemClick} data-value={value}>
              {label}
            </MenuItem>
          ))}
        </MenuPanel>
      </Menu>
    );
  }
);
