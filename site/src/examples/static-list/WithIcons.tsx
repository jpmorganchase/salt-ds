import { FlexLayout, StackLayout, Text } from "@salt-ds/core";
import { NotificationIcon } from "@salt-ds/icons";
import { StaticList, StaticListItem } from "@salt-ds/lab";
import type { ReactElement } from "react";

const ListItem = () => (
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
