import { forwardRef, ReactNode } from "react";
import { Button, useForkRef } from "@salt-ds/core";
import { OverflowMenuIcon } from "@salt-ds/icons";

import { useOverflowContext, useOverflowMenu } from "@fluentui/react-overflow";
import { Dropdown, DropdownProps } from "../dropdown";

type TabValue = {
  value: string;
  label: ReactNode;
};

export interface OverflowMenuProps extends DropdownProps<TabValue> {
  tabs: TabValue[];
}

export const OverflowMenu = forwardRef<HTMLDivElement, OverflowMenuProps>(
  function OverflowMenu(props, forwardedRef) {
    const { tabs, ...rest } = props;
    const { ref, overflowCount, isOverflowing } =
      useOverflowMenu<HTMLDivElement>();
    const handleRef = useForkRef(ref, forwardedRef);
    const itemVisibility = useOverflowContext(
      (context) => context.itemVisibility
    );

    const tabList = tabs.filter(({ value }) => !itemVisibility[value]);

    if (!isOverflowing) return null;

    return (
      <Dropdown<TabValue>
        aria-label={`${overflowCount} more tabs`}
        triggerComponent={
          <Button aria-label="More tabs" variant="secondary" role="combobox">
            <OverflowMenuIcon aria-hidden style={{ margin: 0 }} />
          </Button>
        }
        width="auto"
        ref={handleRef}
        source={tabList}
        selected={null}
        {...rest}
      />
    );
  }
);
