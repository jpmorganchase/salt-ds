import { StackLayout, Text } from "@salt-ds/core";
import { NotificationIcon } from "@salt-ds/icons";
import {
  StaticList,
  StaticListItem,
  StaticListItemContent,
} from "@salt-ds/lab";
import type { ReactElement } from "react";

const ListItem = () => (
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

export const WithIcons = (): ReactElement => (
  <div style={{ width: "80%" }}>
    <StaticList style={{ width: "320px" }}>
      <ListItem />
      <ListItem />
      <ListItem />
      <ListItem />
      <ListItem />
    </StaticList>
  </div>
);
