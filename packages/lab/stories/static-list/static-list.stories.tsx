import { Button, Divider, Label, StackLayout, Text } from "@salt-ds/core";
import { NoteIcon, NotificationIcon } from "@salt-ds/icons";
import { StaticList, StaticListItem, type StaticListProps } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";

const containerStyle = {
  display: "flex",
  justifyContent: "center",
  width: "calc(100vw - 2em)",
};

export default {
  title: "Lab/Static List",
  component: StaticList,
} as Meta<typeof StaticList>;

const ListItemWithIcons = () => (
  <StaticListItem
    style={{ padding: "var(--salt-spacing-50) var(--salt-spacing-100)" }}
  >
    <NotificationIcon />
    <StackLayout
      gap={0.5}
      style={{ padding: "var(--salt-spacing-75) 0", width: "100%" }}
    >
      <Text color="inherit">Item label</Text>
      <Label color="secondary">Secondary label</Label>
    </StackLayout>
  </StaticListItem>
);

const ListItem = () => <StaticListItem>Item label</StaticListItem>;

const AdditionalLabelListItem = () => (
  <StaticListItem>
    <StackLayout gap={0.5}>
      <Text color="inherit">Item label</Text>
      <Label color="secondary">Secondary label</Label>
    </StackLayout>
  </StaticListItem>
);

const ListItemWithButtons = () => (
  <StaticListItem
    style={{
      padding: "var(--salt-spacing-50) var(--salt-spacing-100)",
      alignItems: "flex-start",
    }}
  >
    <StackLayout
      gap={0.5}
      style={{ padding: "var(--salt-spacing-75) 0", width: "100%" }}
    >
      <Text color="inherit">Item label</Text>
      <Label color="secondary">Secondary label</Label>
    </StackLayout>
    <Button variant="secondary" aria-label={"icon"}>
      <NoteIcon aria-hidden />
    </Button>
    <Button variant="secondary" aria-label={"icon"}>
      <NoteIcon aria-hidden />
    </Button>
  </StaticListItem>
);

export const Multiple: StoryFn<StaticListProps> = () => {
  const [listArray, setListArray] = useState([ListItem, ListItem]);

  const handleListItem = () => {
    setListArray([...listArray, ListItem]);
  };
  const handleReset = () => {
    setListArray([ListItem, ListItem]);
  };
  return (
    <StackLayout>
      <StackLayout direction={"row"}>
        <Button onClick={handleListItem}>Add list item</Button>
        <Button onClick={handleReset}>Reset list</Button>
      </StackLayout>
      <StaticList style={{ width: "320px", height: "250px" }}>
        {listArray.map((item, _index) => (
          <ListItem key={_index} />
        ))}
      </StaticList>
    </StackLayout>
  );
};

export const AdditionalLabel: StoryFn<StaticListProps> = () => {
  return (
    <StaticList style={{ width: "320px" }}>
      <AdditionalLabelListItem />
      <AdditionalLabelListItem />
      <AdditionalLabelListItem />
      <AdditionalLabelListItem />
    </StaticList>
  );
};

export const WithIcons: StoryFn<StaticListProps> = () => {
  return (
    <StaticList style={{ width: "320px" }}>
      <ListItemWithIcons />
      <ListItemWithIcons />
      <ListItemWithIcons />
      <ListItemWithIcons />
    </StaticList>
  );
};

export const WithButtons: StoryFn<StaticListProps> = () => {
  return (
    <StaticList style={{ width: "320px" }}>
      <ListItemWithButtons />
      <ListItemWithButtons />
      <ListItemWithButtons />
      <ListItemWithButtons />
    </StaticList>
  );
};

export const WithDividers: StoryFn<StaticListProps> = () => {
  return (
    <StaticList style={{ width: "320px" }}>
      <AdditionalLabelListItem />
      <Divider variant="tertiary" />
      <AdditionalLabelListItem />
      <Divider variant="tertiary" />
      <AdditionalLabelListItem />
      <Divider variant="tertiary" />
      <AdditionalLabelListItem />
    </StaticList>
  );
};
