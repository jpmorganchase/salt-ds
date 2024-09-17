import { Button, Divider, StackLayout, Text } from "@salt-ds/core";
import { NoteIcon, NotificationIcon } from "@salt-ds/icons";
import {
  StaticList,
  StaticListItem,
  StaticListItemContent,
  type StaticListProps,
} from "@salt-ds/lab";
import type { Meta, StoryFn } from "@storybook/react";
import { useState } from "react";

export default {
  title: "Lab/Static List",
  component: StaticList,
} as Meta<typeof StaticList>;

const ListItemWithIcons = () => (
  <StaticListItem>
    <NotificationIcon />
    <StaticListItemContent>
      <StackLayout gap={0.5}>
        <Text color="inherit">Item label</Text>
        <Text styleAs="label" color="secondary">
          Secondary label
        </Text>
      </StackLayout>
    </StaticListItemContent>
  </StaticListItem>
);

const ListItem = () => (
  <StaticListItem>
    <StaticListItemContent>Item label</StaticListItemContent>
  </StaticListItem>
);

const AdditionalLabelListItem = () => (
  <StaticListItem>
    <StaticListItemContent>
      <StackLayout gap={0.5}>
        <Text color="inherit">Item label</Text>
        <Text styleAs="label" color="secondary">
          Secondary label
        </Text>
      </StackLayout>
    </StaticListItemContent>
  </StaticListItem>
);

const ListItemWithButtons = () => (
  <StaticListItem>
    <StaticListItemContent>
      <StackLayout gap={0.5}>
        <Text color="inherit">Item label</Text>
        <Text styleAs="label" color="secondary">
          Secondary label
        </Text>
      </StackLayout>
    </StaticListItemContent>
    <Button variant="secondary" aria-label={"icon"}>
      <NoteIcon aria-hidden />
    </Button>
    <Button variant="secondary" aria-label={"icon"}>
      <NoteIcon aria-hidden />
    </Button>
  </StaticListItem>
);

export const Multiple: StoryFn<StaticListProps> = () => {
  const defaultList = ["item", "item", "item"];
  const [listArray, setListArray] = useState([...defaultList]);

  const handleListItem = () => {
    setListArray([...listArray, "item"]);
  };
  const handleReset = () => {
    setListArray([...defaultList]);
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
