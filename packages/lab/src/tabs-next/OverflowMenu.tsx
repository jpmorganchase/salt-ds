import { Button } from "@salt-ds/core";
import { Dropdown, DropdownProps } from "../dropdown";
import { OverflowMenuIcon } from "@salt-ds/icons";
import { TabElement } from "../tabs/TabsTypes";
import { useOverflowContext, useOverflowMenu } from "@fluentui/react-overflow";

type TabItem = { label: string; id: string };

export interface OverflowMenuProps extends DropdownProps<TabItem> {
  tabs: TabElement[];
}

export function OverflowMenu({
  tabs,
  onSelectionChange,
  ...rest
}: OverflowMenuProps) {
  const { ref, isOverflowing, overflowCount } =
    useOverflowMenu<HTMLButtonElement>();
  const itemVisibility = useOverflowContext(
    (context) => context.itemVisibility
  );

  const tabList: TabItem[] = tabs
    .filter((tab) => tab.props.id && !itemVisibility[tab.props.id])
    .map((tab) => {
      const label =
        typeof tab.props.children === "string"
          ? tab.props.children
          : tab.props.label;

      return {
        label,
        id: tab.props.id,
      } as TabItem;
    });

  if (!isOverflowing) {
    return null;
  }

  return (
    <Dropdown<TabItem>
      aria-label={`${overflowCount} more tabs`}
      triggerComponent={
        <Button aria-label="More tabs" variant="secondary" ref={ref}>
          <OverflowMenuIcon aria-hidden style={{ margin: 0 }} />
        </Button>
      }
      itemToString={(item) => item.label}
      onSelectionChange={onSelectionChange}
      source={tabList}
      width="auto"
      key={tabList.map((tab) => tab.id).join("-")}
      {...rest}
    />
  );
}
