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

const ListItem = () => (
  <StaticListItem>
    <FlexLayout gap={1} style={{ width: "100%" }}>
      <NotificationIcon />
      <StackLayout gap={0.5}>
        <Text color="inherit">Item label</Text>
        <Text variant="secondary">Secondary label</Text>
      </StackLayout>
      <StackLayout direction={"row"} gap={0.5} style={{ marginLeft: "auto" }}>
        <Button variant="secondary" aria-label={"icon"}>
          {" "}
          <NoteIcon aria-hidden />
        </Button>
        <Button variant="secondary" aria-label={"icon"}>
          {" "}
          <NoteIcon aria-hidden />
        </Button>
      </StackLayout>
    </FlexLayout>
  </StaticListItem>
);

const ListItemWithoutIcons = () => (
  <StaticListItem>
    <FlexLayout gap={1} style={{ width: "100%" }}>
      <StackLayout gap={0.5}>
        <Text color="inherit">Item label</Text>
        <Text variant="secondary">Secondary label</Text>
      </StackLayout>
      <StackLayout direction={"row"} gap={0.5} style={{ marginLeft: "auto" }}>
        <Button variant="secondary" aria-label={"icon"}>
          {" "}
          <NoteIcon aria-hidden />
        </Button>
        <Button variant="secondary" aria-label={"icon"}>
          {" "}
          <NoteIcon aria-hidden />
        </Button>
      </StackLayout>
    </FlexLayout>
  </StaticListItem>
);

const NoDividerListItem = () => (
  <StaticListItem divider={false}>
    <FlexLayout gap={1} style={{ width: "100%" }}>
      <NotificationIcon />
      <StackLayout gap={0.5}>
        <Text color="inherit">Item label</Text>
        <Text variant="secondary">Secondary label</Text>
      </StackLayout>
      <StackLayout direction={"row"} gap={0.5} style={{ marginLeft: "auto" }}>
        <Button variant="secondary" aria-label={"icon"}>
          {" "}
          <NoteIcon aria-hidden />
        </Button>
        <Button variant="secondary" aria-label={"icon"}>
          {" "}
          <NoteIcon aria-hidden />
        </Button>
      </StackLayout>
    </FlexLayout>
  </StaticListItem>
);

export const WithDescriptiveIcons: StoryFn<StaticListProps> = (props) => {
  return (
    <StaticList style={{ width: "320px" }}>
      <ListItem />
      <ListItem />
      <ListItem />
    </StaticList>
  );
};

export const WithoutDescriptiveIcons: StoryFn<StaticListProps> = (props) => {
  return (
    <StaticList style={{ width: "320px" }}>
      <ListItemWithoutIcons />
      <ListItemWithoutIcons />
      <ListItemWithoutIcons />
    </StaticList>
  );
};

export const WithoutDivider: StoryFn<StaticListProps> = (props) => {
  return (
    <StaticList style={{ width: "320px" }}>
      <NoDividerListItem />
      <NoDividerListItem />
      <NoDividerListItem />
    </StaticList>
  );
};
