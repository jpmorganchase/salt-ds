import { Button, Divider, Label, StackLayout, Text } from "@salt-ds/core";
import { NoteIcon, NotificationIcon } from "@salt-ds/icons";
import { StaticList, StaticListItem } from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { QAContainer, type QAContainerProps } from "docs/components";

export default {
  title: "Lab/Static List/Static List QA",
  component: StaticList,
} as Meta<typeof StaticList>;

const ListItemWithIcons = () => (
  <StaticListItem
    style={{
      padding: "var(--salt-spacing-50) var(--salt-spacing-100)",
      alignItems: "baseline",
    }}
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

export const AllExamples: StoryFn<QAContainerProps> = ({ imgSrc }) => (
  <QAContainer cols={5} height={950} imgSrc={imgSrc} itemPadding={5}>
    <StaticList style={{ width: "320px" }}>
      <ListItem />
    </StaticList>
    <StaticList style={{ width: "320px" }}>
      <ListItem />
      <ListItem />
      <ListItem />
    </StaticList>
    <StaticList style={{ width: "320px" }}>
      <ListItemWithIcons />
      <ListItemWithIcons />
      <ListItemWithIcons />
    </StaticList>
    <StaticList style={{ width: "320px" }}>
      <ListItemWithButtons />
      <ListItemWithButtons />
      <ListItemWithButtons />
    </StaticList>
    <StaticList style={{ width: "320px" }}>
      <StackLayout gap={0} separators>
        <AdditionalLabelListItem />
        <AdditionalLabelListItem />
        <AdditionalLabelListItem />
        <AdditionalLabelListItem />
      </StackLayout>
    </StaticList>
    <StaticList style={{ width: "320px" }}>
      <AdditionalLabelListItem />
      <Divider variant="tertiary" />
      <AdditionalLabelListItem />
      <Divider variant="tertiary" />
      <AdditionalLabelListItem />
      <Divider variant="tertiary" />
      <AdditionalLabelListItem />
    </StaticList>
  </QAContainer>
);

AllExamples.parameters = {
  chromatic: { disableSnapshot: false },
};
