import { Button, FlexLayout, StackLayout, Text } from "@salt-ds/core";
import { NoteIcon, NotificationIcon } from "@salt-ds/icons";
import { StaticList, StaticListItem } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab/Static List/Static List QA",
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

export const AllExamples: StoryFn<QAContainerProps> = ({ imgSrc }) => (
  <QAContainer cols={4} height={950} imgSrc={imgSrc} itemPadding={5}>
    <StaticList style={{ width: "320px" }}>
      <ListItem />
      <ListItem />
      <ListItem />
    </StaticList>
    <StaticList style={{ width: "320px" }}>
      <ListItemWithoutIcons />
      <ListItemWithoutIcons />
      <ListItemWithoutIcons />
    </StaticList>
    <StaticList style={{ width: "320px" }}>
      <NoDividerListItem />
      <NoDividerListItem />
      <NoDividerListItem />
    </StaticList>
  </QAContainer>
);

AllExamples.parameters = {
  chromatic: { disableSnapshot: false },
};
