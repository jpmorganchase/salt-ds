import { Button, FlexLayout, StackLayout, Text } from "@salt-ds/core";
import { NoteIcon, NotificationIcon } from "@salt-ds/icons";
import { StaticList, StaticListItem, type StaticListProps } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";

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
  <StaticListItem>
    <FlexLayout gap={1} style={{ width: "100%" }}>
      <NotificationIcon />
      <StackLayout gap={0.5}>
        <Text color="inherit">Item label</Text>
        <Text variant="secondary">Secondary label</Text>
      </StackLayout>
    </FlexLayout>
  </StaticListItem>
);

const ListItem = () => (
  <StaticListItem>
    <StackLayout gap={0.5} style={{ width: "100%" }}>
      <Text color="inherit">Item label</Text>
      <Text variant="secondary">Secondary label</Text>
    </StackLayout>
  </StaticListItem>
);

const ListItemWithDivider = () => (
  <StaticListItem divider>
    <StackLayout gap={0.5} style={{ width: "100%" }}>
      <Text color="inherit">Item label</Text>
      <Text variant="secondary">Secondary label</Text>
    </StackLayout>
  </StaticListItem>
);

const ListItemWithButtons = () => (
  <StaticListItem>
    <StackLayout gap={0.5} style={{ width: "100%" }}>
      <Text color="inherit">Item label</Text>
      <Text variant="secondary">Secondary label</Text>
    </StackLayout>
    <StackLayout direction={"row"} gap={0.5} style={{ marginLeft: "auto" }}>
      <Button variant="secondary" aria-label={"icon"}>
        <NoteIcon aria-hidden />
      </Button>
      <Button variant="secondary" aria-label={"icon"}>
        <NoteIcon aria-hidden />
      </Button>
    </StackLayout>
  </StaticListItem>
);
export const DefaultSingle: StoryFn<StaticListProps> = () => {
  return (
    <StaticList style={{ width: "320px" }}>
      <ListItem />
    </StaticList>
  );
};

export const DefaultMultiple: StoryFn<StaticListProps> = () => {
  return (
    <StaticList style={{ width: "320px" }}>
      <ListItem />
      <ListItem />
      <ListItem />
    </StaticList>
  );
};

export const WithIcons: StoryFn<StaticListProps> = () => {
  return (
    <StaticList style={{ width: "320px" }}>
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
    </StaticList>
  );
};

export const WithDividers: StoryFn<StaticListProps> = () => {
  return (
    <StaticList style={{ width: "320px" }}>
      <ListItem />
      <ListItemWithDivider />
      <ListItemWithDivider />
    </StaticList>
  );
};
